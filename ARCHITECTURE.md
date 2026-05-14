# TypeSpec TypeScript Emitter — Architecture

## Overview

The TypeSpec TypeScript emitter generates TypeScript client libraries from TypeSpec API definitions. It runs as a TypeSpec compiler plugin that receives a compiled program and produces TypeScript source files.

This document describes the target architecture we're migrating toward: a clean separation between **data building** (deciding *what* to generate) and **rendering** (deciding *how* to format it as TypeScript).

## Data Flow

```
┌─────────────┐     ┌──────┐     ┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  TypeSpec    │────▶│ TCGC │────▶│  Data Builders   │────▶│    Renderers      │────▶│  .ts files  │
│  (.tsp)     │     │      │     │  (src/codemodel/) │     │  (src/codemodel/) │     │             │
└─────────────┘     └──────┘     └─────────────────┘     └──────────────────┘     └─────────────┘
                                         │                        │
                                         ▼                        ▼
                                  Semantic Model           ts-morph / Alloy
                                  (pure data)              (pluggable backend)
```

### Phase 1: TypeSpec → TCGC

The TypeSpec compiler parses `.tsp` files and produces a typed program. TCGC (`@azure-tools/typespec-client-generator-core`) then transforms this into a language-neutral SDK model:

- `SdkPackage` — top-level container
- `SdkClientType` — client hierarchy with operations
- `SdkServiceMethod` — operations with parameters, responses, LRO/paging metadata
- `SdkModelType`, `SdkEnumType`, `SdkUnionType` — type system
- `UsageFlags` — input/output/spread/LRO metadata

TCGC handles all shared SDK-shaping concerns: client grouping, paging/LRO recognition, convenience vs protocol methods, model usage/access pruning, API versioning, naming, and parameter flattening. The emitter does not re-derive these.

### Phase 2: TCGC → Semantic Model (Data Builders)

Data builders transform TCGC types into a **TypeScript-specific semantic model** — pure data structures that describe exactly what to generate. All conditional logic, naming decisions, type resolution, and file layout happens here.

**Rules:**
- Zero ts-morph imports (no rendering concerns)
- All names are resolved TypeScript identifiers
- All references are symbolic (`SymbolRef`), not concrete imports
- All decisions are made — the renderer has no if/else about *what* to emit

```
src/codemodel/
├── types.ts                    # Semantic model type definitions
├── build-client-context.ts     # TCGC → ClientContextDeclaration
├── build-classical-client.ts   # TCGC → ClassicalClientDeclaration
├── build-operations.ts         # TCGC → OperationFileDeclaration[]
└── index.ts                    # Public exports
```

#### Semantic Model Types

```
ClientContextDeclaration
├── filePath: string
├── clientInterface: InterfaceShape      (name, extends, properties)
├── optionsInterface: InterfaceShape     (XOptionalParams)
├── factoryFunction: FunctionShape       (createX, params, body statements)
├── isAzure: boolean
└── hierarchyDepth: number

ClassicalClientDeclaration
├── filePath, className, modularClientName
├── clientPropertyType, pipelineType
├── constructorParameters, constructorBody
├── needsSubscriptionIdOverload
├── methods: MethodShape[]
├── operationGroups: OperationGroupShape[]
└── childClientAccessors: ChildClientAccessor[]

OperationFileDeclaration
├── filePath, groupPrefix
├── operations: OperationDeclaration[]
├── clientImportAlias, clientImportPath
└── each OperationDeclaration:
    ├── name, displayName, mainFunction: FunctionShape
    ├── sendFunctionName, deserializeFunctionName
    └── isLro, isPaging, isLroPaging
```

#### StatementCollector Pattern

Some existing helpers (`buildGetClientEndpointParam`, `buildGetClientOptionsParam`) were designed to mutate ts-morph function nodes directly. Rather than rewriting them, we use a `StatementCollector` — a minimal object that implements the `addStatements()` interface but just captures strings into an array:

```typescript
class StatementCollector {
  readonly statements: string[] = [];
  addStatements(stmts: string | string[]) {
    if (Array.isArray(stmts)) this.statements.push(...stmts);
    else this.statements.push(stmts);
  }
}
```

This lets data builders reuse existing helpers without ts-morph, collecting their output as pure data. Over time, these helpers should be refactored to return data directly.

### Phase 3: Semantic Model → Output Files (Renderers)

Renderers take the semantic model and produce output. Currently this is ts-morph; in the future it could be Alloy.js or string templates.

**Rules:**
- Zero TCGC imports (no data concerns)
- No conditional logic about *what* to generate — only *how* to format it
- Renderer is pluggable: the same semantic model feeds different backends

```
src/codemodel/
├── render-client-context.ts    # ClientContextDeclaration → ts-morph SourceFile
├── render-classical-client.ts  # (planned)
└── render-operations.ts        # (planned)
```

#### Example: renderClientContext

```typescript
// Zero TCGC imports — only ts-morph and semantic model types
import { SourceFile, Project } from "ts-morph";
import type { ClientContextDeclaration } from "./types.js";

export function renderClientContext(
  project: Project,
  data: ClientContextDeclaration
): SourceFile {
  const file = project.createSourceFile(data.filePath);

  // 1. Client interface — data already has name, extends, properties
  file.addInterface({ ... });

  // 2. Options interface
  file.addInterface({ ... });

  // 3. Factory function — body statements already computed
  const fn = file.addFunction({ ... });
  for (const stmt of data.factoryFunction.bodyStatements) {
    fn.addStatements(stmt);
  }

  return file;
}
```

## Symbolic References (Alloy.js Compatibility)

The semantic model uses `SymbolRef` for all cross-declaration references, NOT concrete import paths. This is critical for renderer pluggability:

```typescript
type SymbolRef =
  | ExternalSymbolRef    // { kind: "external"; name: "Pipeline"; package: "@azure-rest/core-client" }
  | GeneratedSymbolRef   // { kind: "generated"; declarationId: "models.Widget"; name: "Widget" }
  | StaticHelperRef;     // { kind: "static-helper"; name: "AzureSupportedClouds"; group: "CloudSettingHelpers" }
```

Each renderer resolves `SymbolRef` differently:
- **ts-morph renderer**: resolves to file paths → concrete import statements
- **Alloy renderer** (future): resolves to Alloy refkeys → automatic import management

The semantic model answers *"what declaration does this code reference?"* not *"what import statement should appear."*

## What Stays the Same

Not everything needs to change. These parts of the architecture are stable:

| Component | Role | Status |
|-----------|------|--------|
| `rlc-common` package | Project metadata (package.json, README, tsconfig, etc.) | Keeps working — consumes RLCModel for metadata only |
| `src/framework/` | Binder, refkey, reference resolution, static helper loading | Keeps working — used by current renderer |
| `src/modular/helpers/` | TCGC interpretation helpers (params, naming, operations) | Reused by data builders via StatementCollector |
| `src/modular/static-helpers-metadata.ts` | Runtime helper declarations | Keeps working |
| `src/modular/serialization/` | Serializer/deserializer generation | To be migrated (complex — needs SerializerPlan) |

## Migration Status

| Builder | Data Builder | Renderer | Wired In | E2E Verified |
|---------|-------------|----------|----------|-------------|
| Client Context | ✅ `build-client-context.ts` | ✅ `render-client-context.ts` | ✅ | ✅ |
| Classical Client | ✅ `build-classical-client.ts` | ⬜ planned | ⬜ | ⬜ |
| Operations | ✅ `build-operations.ts` | ⬜ planned | ⬜ | ⬜ |
| Models/Enums | ⬜ planned | ⬜ planned | ⬜ | ⬜ |
| Serialization | ⬜ planned (SerializerPlan) | ⬜ planned | ⬜ | ⬜ |

## Testing Strategy

### Data Builders (TDD)
Each data builder has dedicated unit tests that assert on the semantic model output:
```
test/unit/codemodel/
├── build-client-context.spec.ts     (6 tests)
├── build-classical-client.spec.ts   (9 tests)
└── build-operations.spec.ts         (8 tests)
```

Tests construct a TCGC context from TypeSpec input, call the data builder, and assert on the returned data structure — not on rendered output. This makes them fast, focused, and renderer-independent.

### E2E (Smoke + Integration)
After wiring a data→render pair into the emitter, we run:
- Smoke test (`npm run smoke-test` in `packages/typespec-test/`)
- Modular integration tests (578 tests)
- Azure modular integration tests (934 tests)

These verify the emitter still produces correct, compilable, functional TypeScript client libraries.

## Future: Alloy.js Migration Path

The semantic model is designed to make an Alloy.js migration straightforward:

1. **Add Alloy renderers** alongside ts-morph renderers (e.g., `render-client-context-alloy.tsx`)
2. **Alloy renderers consume the same semantic model** — `ClientContextDeclaration`, `ClassicalClientDeclaration`, etc.
3. **SymbolRef → Alloy refkeys** instead of → import statements
4. **Alloy handles** symbol scoping, imports, and file layout automatically
5. **Switch the renderer** in `index.ts` — data builders don't change

Because all decisions are in the data phase, swapping the rendering backend is a localized change.

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Codegen layer — generates TypeScript source files from the code model
 * and TCGC SDK context.
 *
 * This is the TypeScript equivalent of:
 * - Go's `codegen.go/src/emitter.ts` → `Emitter.emit()`
 * - Rust's `src/codegen/codeGenerator.ts` → `CodeGenerator.emitContent()`
 *
 * This barrel file exports the public surface of the codegen layer for
 * use by the emitter entry point in `src/index.ts`.
 */

// Code-model-driven emitter (Phase 0/1 — fully data-driven path)
export { emitFromCodeModel } from "./emitter.js";

// Client context (code-model-driven)
export { emitClientContext } from "./clients.js";

// Operations
export {
  buildOperationFiles,
  buildOperationOptions,
  buildLroDeserDetailMap
} from "./buildOperations.js";
export { buildApiOptions } from "./emitModelsOptions.js";

// Classical client
export { buildClassicalClient } from "./buildClassicalClient.js";
export { buildClassicOperationFiles } from "./buildClassicalOperationGroups.js";

// Models/enums/types
export {
  emitTypes,
  emitNonModelResponseTypes,
  visitPackageTypes,
  buildEnumTypes,
  getApiVersionEnum,
  normalizeModelName
} from "./emitModels.js";

// Restore poller
export { buildRestorePoller } from "./buildRestorePoller.js";

// Index files
export { buildSubpathIndexFile } from "./buildSubpathIndex.js";
export { buildRootIndex, buildSubClientIndexFile } from "./buildRootIndex.js";
export { emitLoggerFile } from "./emitLoggerFile.js";

// Samples/tests
export { emitSamples } from "./emitSamples.js";
export { emitTests } from "./emitTests.js";

// Client context helpers
export {
  getClientContextPath,
  buildClientContext
} from "./buildClientContext.js";

// Configuration / project files
export { transformModularEmitterOptions } from "./buildModularOptions.js";
export { getModuleExports } from "./buildProjectFiles.js";

// Types
export type { ModularEmitterOptions } from "./interfaces.js";

// External package dependencies (used for import resolution)
export {
  AzureCoreDependencies,
  AzureIdentityDependencies,
  AzurePollingDependencies,
  AzureTestDependencies,
  DefaultCoreDependencies
} from "./external-dependencies.js";

// Static helper metadata (runtime helpers copied into generated SDKs)
export {
  CloudSettingHelpers,
  CreateRecorderHelpers,
  MultipartHelpers,
  PagingHelpers,
  PlatformTypeHelpers,
  PollingHelpers,
  SerializationHelpers,
  SimplePollerHelpers,
  StorageCompatHelpers,
  UrlTemplateHelpers,
  XmlHelpers
} from "./static-helpers-metadata.js";

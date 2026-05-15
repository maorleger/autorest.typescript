// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Codegen layer — walks the TSCodeModel tree and generates source files.
 *
 * This is the TypeScript equivalent of:
 * - Go's `codegen.go/src/emitter.ts` → `Emitter.emit()`
 * - Rust's `src/codegen/codeGenerator.ts` → `CodeGenerator.emitContent()`
 *
 * This layer has ZERO TCGC imports. It consumes only the code model types
 * and delegates to existing modular builders via thin wrappers.
 */

// Orchestrator
export { emitFromCodeModel } from "./emitter.js";

// Client context (new codegen path)
export { emitClientContext } from "./clients.js";

// Operations (thin wrappers)
export {
  emitOperationFiles,
  emitApiOptions,
  buildLroDeserDetailMap
} from "./operations.js";

// Classical client (thin wrappers)
export {
  emitClassicalClient,
  emitClassicOperationFiles
} from "./classicalClient.js";

// Models/enums (thin wrappers)
export { emitModels, emitNonModelResponses } from "./models.js";

// Restore poller (thin wrapper)
export { emitRestorePoller } from "./restorePoller.js";

// Index files (thin wrappers)
export {
  buildSubpathIndexFile as emitSubpathIndexFile,
  buildRootIndex as emitRootIndex,
  buildSubClientIndexFile as emitSubClientIndexFile,
  emitLoggerFile
} from "./indexes.js";

// Samples/tests (thin wrappers)
export {
  emitSamples as emitSampleFiles,
  emitTests as emitTestFiles
} from "./samples.js";

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Thin compatibility wrappers for classical client and operation-group codegen.
 *
 * This establishes the codegen-layer boundary while delegating to the
 * existing modular builders.
 */

import type {
  SdkClientType,
  SdkServiceOperation
} from "@azure-tools/typespec-client-generator-core";
import type { SourceFile } from "ts-morph";
import { buildClassicalClient } from "../modular/buildClassicalClient.js";
import { buildClassicOperationFiles } from "../modular/buildClassicalOperationGroups.js";
import type { ModularEmitterOptions } from "../modular/interfaces.js";
import type { SdkContext } from "../utils/interfaces.js";

type ClassicalClientMap = [string[], SdkClientType<SdkServiceOperation>];

export function emitClassicalClient(
  dpgContext: SdkContext,
  clientMap: ClassicalClientMap,
  emitterOptions: ModularEmitterOptions
): SourceFile {
  return buildClassicalClient(dpgContext, clientMap, emitterOptions);
}

export function emitClassicOperationFiles(
  dpgContext: SdkContext,
  clientMap: ClassicalClientMap,
  emitterOptions: ModularEmitterOptions
): Map<string, SourceFile> {
  return buildClassicOperationFiles(dpgContext, clientMap, emitterOptions);
}

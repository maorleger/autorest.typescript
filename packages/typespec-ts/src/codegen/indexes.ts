// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  SdkClientType,
  SdkServiceOperation
} from "@azure-tools/typespec-client-generator-core";
import { SourceFile } from "ts-morph";
import {
  buildRootIndex as buildRootIndexInternal,
  buildSubClientIndexFile as buildSubClientIndexFileInternal
} from "../modular/buildRootIndex.js";
import {
  buildSubpathIndexFile as buildSubpathIndexFileInternal,
  buildSubpathIndexFileOptions
} from "../modular/buildSubpathIndex.js";
import { emitLoggerFile as emitLoggerFileInternal } from "../modular/emitLoggerFile.js";
import { ModularEmitterOptions } from "../modular/interfaces.js";
import { SdkContext } from "../utils/interfaces.js";

export function buildSubpathIndexFile(
  emitterOptions: ModularEmitterOptions,
  subpath: string,
  clientMap?: [string[], SdkClientType<SdkServiceOperation>],
  options: buildSubpathIndexFileOptions = {}
): void {
  buildSubpathIndexFileInternal(emitterOptions, subpath, clientMap, options);
}

export function buildRootIndex(
  context: SdkContext,
  emitterOptions: ModularEmitterOptions,
  rootIndexFile: SourceFile,
  clientMap?: [string[], SdkClientType<SdkServiceOperation>]
): void {
  buildRootIndexInternal(context, emitterOptions, rootIndexFile, clientMap);
}

export function buildSubClientIndexFile(
  context: SdkContext,
  clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions
): void {
  buildSubClientIndexFileInternal(context, clientMap, emitterOptions);
}

export function emitLoggerFile(
  emitterOptions: ModularEmitterOptions,
  srcPath: string = "src"
): void {
  emitLoggerFileInternal(emitterOptions, srcPath);
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { emitNonModelResponseTypes, emitTypes } from "../modular/emitModels.js";
import { SdkContext } from "../utils/interfaces.js";

export function emitModels(
  dpgContext: SdkContext,
  options: { sourceRoot: string }
): void {
  emitTypes(dpgContext, options);
}

export function emitNonModelResponses(
  dpgContext: SdkContext,
  options: { sourceRoot: string }
): void {
  emitNonModelResponseTypes(dpgContext, options);
}

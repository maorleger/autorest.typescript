// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SourceFile } from "ts-morph";
import { emitSamples as emitSamplesInternal } from "../modular/emitSamples.js";
import { emitTests as emitTestsInternal } from "../modular/emitTests.js";
import { SdkContext } from "../utils/interfaces.js";

export function emitSamples(dpgContext: SdkContext): SourceFile[] {
  return emitSamplesInternal(dpgContext);
}

export async function emitTests(dpgContext: SdkContext): Promise<SourceFile[]> {
  return emitTestsInternal(dpgContext);
}

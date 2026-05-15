// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  SdkClientType,
  SdkServiceOperation
} from "@azure-tools/typespec-client-generator-core";
import { buildRestorePoller } from "../modular/buildRestorePoller.js";
import { ModularEmitterOptions } from "../modular/interfaces.js";
import { SdkContext } from "../utils/interfaces.js";

export function emitRestorePoller(
  context: SdkContext,
  clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions
): void {
  buildRestorePoller(context, clientMap, emitterOptions);
}

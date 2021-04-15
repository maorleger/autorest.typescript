/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { CanonicalCode } from "@opentelemetry/api";
import { createSpan } from "../tracing";
import * as coreHttp from "@azure/core-http";
import { FlattencomplexGetValidResponse } from "../models";

/** Interface representing a Flattencomplex. */
export interface Flattencomplex {
  /** @param options The options parameters. */
  getValid(
    options?: coreHttp.OperationOptions
  ): Promise<FlattencomplexGetValidResponse>;
}
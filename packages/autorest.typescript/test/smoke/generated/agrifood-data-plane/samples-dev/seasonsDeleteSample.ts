// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import createAzureAgriFoodPlatformDataPlaneServiceClient from "@msinternal/agrifood-data-plane";
import { AzureKeyCredential } from "@azure/core-auth";
import "dotenv/config";

/**
 * This sample demonstrates how to Deletes a specified season resource.
 *
 * @summary Deletes a specified season resource.
 * x-ms-original-file: specification/agrifood/data-plane/Microsoft.AgFoodPlatform/preview/2021-03-31-preview/examples/Seasons_Delete.json
 */
async function seasonsDelete(): Promise<void> {
  const endpoint = "{Endpoint}";
  const credential = new AzureKeyCredential("{Your API key}");
  const client = createAzureAgriFoodPlatformDataPlaneServiceClient(
    endpoint,
    credential,
  );
  const seasonId = "SEASON123";
  const result = await client.path("/seasons/{seasonId}", seasonId).delete();
  console.log(result);
}

async function main(): Promise<void> {
  await seasonsDelete();
}

main().catch(console.error);

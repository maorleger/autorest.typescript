// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import createDpgCustomizationClient from "@msinternal/dpg-customization-rest";
import "dotenv/config";

/**
 * This sample demonstrates how to Get models that you will either return to end users as a raw body, or with a model added during grow up.
 *
 * @summary Get models that you will either return to end users as a raw body, or with a model added during grow up.
 * x-ms-original-file: /@microsoft.azure/autorest.testserver/swagger/examples/getModel.json
 */
async function dpgGetModel(): Promise<void> {
  const client = createDpgCustomizationClient();
  const mode = "uat";
  const result = await client.path("/customization/model/{mode}", mode).get();
  console.log(result);
}

async function main(): Promise<void> {
  await dpgGetModel();
}

main().catch(console.error);

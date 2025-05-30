/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import {
  LedgerDigestUploads,
  SqlManagementClient,
} from "@msinternal/sql-resource-manager";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

/**
 * This sample demonstrates how to Enables upload ledger digests to an Azure Storage account or an Azure Confidential Ledger instance.
 *
 * @summary Enables upload ledger digests to an Azure Storage account or an Azure Confidential Ledger instance.
 * x-ms-original-file: specification/sql/resource-manager/Microsoft.Sql/preview/2021-02-01-preview/examples/LedgerDigestUploadsEnable.json
 */
async function enablesLedgerDigestUploadConfigurationForADatabase(): Promise<void> {
  const subscriptionId =
    process.env["SUBSCRIPTION_ID"] || "00000000-1111-2222-3333-444444444444";
  const resourceGroupName = process.env["RESOURCE_GROUP"] || "ledgertestrg";
  const serverName = "ledgertestserver";
  const databaseName = "testdb";
  const ledgerDigestUploads = "current";
  const parameters: LedgerDigestUploads = {
    digestStorageEndpoint: "https://MyAccount.blob.core.windows.net",
  };
  const credential = new DefaultAzureCredential();
  const client = new SqlManagementClient(credential, subscriptionId);
  const result =
    await client.ledgerDigestUploadsOperations.beginCreateOrUpdateAndWait(
      resourceGroupName,
      serverName,
      databaseName,
      ledgerDigestUploads,
      parameters,
    );
  console.log(result);
}

async function main(): Promise<void> {
  await enablesLedgerDigestUploadConfigurationForADatabase();
}

main().catch(console.error);

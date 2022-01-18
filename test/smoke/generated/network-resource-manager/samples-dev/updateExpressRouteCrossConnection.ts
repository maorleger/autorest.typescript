/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * This sample demonstrates how to Update the specified ExpressRouteCrossConnection.
 *
 * @summary Update the specified ExpressRouteCrossConnection.
 * x-ms-original-file: specification/network/resource-manager/Microsoft.Network/stable/2021-05-01/examples/ExpressRouteCrossConnectionUpdate.json
 */
import {
  ExpressRouteCrossConnection,
  NetworkManagementClient
} from "@msinternal/network-resource-manager";
import { DefaultAzureCredential } from "@azure/identity";

async function updateExpressRouteCrossConnection() {
  const subscriptionId = "subid";
  const resourceGroupName = "CrossConnection-SiliconValley";
  const crossConnectionName = "<circuitServiceKey>";
  const parameters: ExpressRouteCrossConnection = {
    serviceProviderProvisioningState: "NotProvisioned"
  };
  const credential = new DefaultAzureCredential();
  const client = new NetworkManagementClient(credential, subscriptionId);
  const result = await client.expressRouteCrossConnections.beginCreateOrUpdateAndWait(
    resourceGroupName,
    crossConnectionName,
    parameters
  );
  console.log(result);
}

updateExpressRouteCrossConnection().catch(console.error);
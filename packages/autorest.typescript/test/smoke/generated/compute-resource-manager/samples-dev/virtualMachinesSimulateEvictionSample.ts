/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { ComputeManagementClient } from "@msinternal/compute-resource-manager";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

/**
 * This sample demonstrates how to The operation to simulate the eviction of spot virtual machine.
 *
 * @summary The operation to simulate the eviction of spot virtual machine.
 * x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-07-01/examples/compute/SimulateEvictionOfVM.json
 */
async function simulateEvictionAVirtualMachine(): Promise<void> {
  const subscriptionId = process.env["SUBSCRIPTION_ID"] || "{subscription-id}";
  const resourceGroupName = process.env["RESOURCE_GROUP"] || "ResourceGroup";
  const vmName = "VMName";
  const credential = new DefaultAzureCredential();
  const client = new ComputeManagementClient(credential, subscriptionId);
  const result = await client.virtualMachines.simulateEviction(
    resourceGroupName,
    vmName,
  );
  console.log(result);
}

async function main(): Promise<void> {
  await simulateEvictionAVirtualMachine();
}

main().catch(console.error);

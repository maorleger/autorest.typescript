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
 * This sample demonstrates how to The operation to get all extensions of an instance in Virtual Machine Scaleset.
 *
 * @summary The operation to get all extensions of an instance in Virtual Machine Scaleset.
 * x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-07-01/examples/compute/ListVirtualMachineScaleSetVMExtensions.json
 */
async function listExtensionsInVmssInstance(): Promise<void> {
  const subscriptionId = process.env["SUBSCRIPTION_ID"] || "{subscription-id}";
  const resourceGroupName = process.env["RESOURCE_GROUP"] || "myResourceGroup";
  const vmScaleSetName = "myvmScaleSet";
  const instanceId = "0";
  const credential = new DefaultAzureCredential();
  const client = new ComputeManagementClient(credential, subscriptionId);
  const result = await client.virtualMachineScaleSetVMExtensions.list(
    resourceGroupName,
    vmScaleSetName,
    instanceId,
  );
  console.log(result);
}

async function main(): Promise<void> {
  await listExtensionsInVmssInstance();
}

main().catch(console.error);

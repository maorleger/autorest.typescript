/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import {
  ProximityPlacementGroup,
  ComputeManagementClient,
} from "@msinternal/compute-resource-manager";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

/**
 * This sample demonstrates how to Create or update a proximity placement group.
 *
 * @summary Create or update a proximity placement group.
 * x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-07-01/examples/compute/CreateOrUpdateAProximityPlacementGroup.json
 */
async function createOrUpdateAProximityPlacementGroup(): Promise<void> {
  const subscriptionId = process.env["SUBSCRIPTION_ID"] || "{subscription-id}";
  const resourceGroupName = process.env["RESOURCE_GROUP"] || "myResourceGroup";
  const proximityPlacementGroupName = "myProximityPlacementGroup";
  const parameters: ProximityPlacementGroup = {
    location: "westus",
    proximityPlacementGroupType: "Standard",
  };
  const credential = new DefaultAzureCredential();
  const client = new ComputeManagementClient(credential, subscriptionId);
  const result = await client.proximityPlacementGroups.createOrUpdate(
    resourceGroupName,
    proximityPlacementGroupName,
    parameters,
  );
  console.log(result);
}

async function main(): Promise<void> {
  await createOrUpdateAProximityPlacementGroup();
}

main().catch(console.error);

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
 * This sample demonstrates how to Prepares a subnet by applying network intent policies.
 *
 * @summary Prepares a subnet by applying network intent policies.
 * x-ms-original-file: specification/network/resource-manager/Microsoft.Network/stable/2021-05-01/examples/SubnetPrepareNetworkPolicies.json
 */
import {
  PrepareNetworkPoliciesRequest,
  NetworkManagementClient
} from "@msinternal/network-resource-manager";
import { DefaultAzureCredential } from "@azure/identity";

async function prepareNetworkPolicies() {
  const subscriptionId = "subid";
  const resourceGroupName = "rg1";
  const virtualNetworkName = "test-vnet";
  const subnetName = "subnet1";
  const prepareNetworkPoliciesRequestParameters: PrepareNetworkPoliciesRequest = {
    serviceName: "Microsoft.Sql/managedInstances"
  };
  const credential = new DefaultAzureCredential();
  const client = new NetworkManagementClient(credential, subscriptionId);
  const result = await client.subnets.beginPrepareNetworkPoliciesAndWait(
    resourceGroupName,
    virtualNetworkName,
    subnetName,
    prepareNetworkPoliciesRequestParameters
  );
  console.log(result);
}

prepareNetworkPolicies().catch(console.error);
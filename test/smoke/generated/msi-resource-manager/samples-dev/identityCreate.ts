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
 * This sample demonstrates how to Create or update an identity in the specified subscription and resource group.
 *
 * @summary Create or update an identity in the specified subscription and resource group.
 * x-ms-original-file: specification/msi/resource-manager/Microsoft.ManagedIdentity/stable/2018-11-30/examples/IdentityCreate.json
 */
import {
  Identity,
  ManagedServiceIdentityClient
} from "@msinternal/msi-resource-manager";
import { DefaultAzureCredential } from "@azure/identity";

async function identityCreate() {
  const subscriptionId = "subid";
  const resourceGroupName = "rgName";
  const resourceName = "resourceName";
  const parameters: Identity = {
    location: "eastus",
    tags: { key1: "value1", key2: "value2" }
  };
  const credential = new DefaultAzureCredential();
  const client = new ManagedServiceIdentityClient(credential, subscriptionId);
  const result = await client.userAssignedIdentities.createOrUpdate(
    resourceGroupName,
    resourceName,
    parameters
  );
  console.log(result);
}

identityCreate().catch(console.error);
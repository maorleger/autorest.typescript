/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import "@azure/core-paging";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import * as coreHttp from "@azure/core-http";
import { PollerLike, PollOperationState } from "@azure/core-lro";
import {
  ServerDnsAlias,
  ServerDnsAliasesGetResponse,
  ServerDnsAliasesCreateOrUpdateResponse,
  ServerDnsAliasAcquisition
} from "../models";

/// <reference lib="esnext.asynciterable" />
/** Interface representing a ServerDnsAliases. */
export interface ServerDnsAliases {
  /**
   * Gets a list of server DNS aliases for a server.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server that the alias is pointing to.
   * @param options The options parameters.
   */
  listByServer(
    resourceGroupName: string,
    serverName: string,
    options?: coreHttp.OperationOptions
  ): PagedAsyncIterableIterator<ServerDnsAlias>;
  /**
   * Gets a server DNS alias.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server that the alias is pointing to.
   * @param dnsAliasName The name of the server DNS alias.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    serverName: string,
    dnsAliasName: string,
    options?: coreHttp.OperationOptions
  ): Promise<ServerDnsAliasesGetResponse>;
  /**
   * Creates a server dns alias.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server that the alias is pointing to.
   * @param dnsAliasName The name of the server DNS alias.
   * @param options The options parameters.
   */
  createOrUpdate(
    resourceGroupName: string,
    serverName: string,
    dnsAliasName: string,
    options?: coreHttp.OperationOptions
  ): Promise<
    PollerLike<
      PollOperationState<ServerDnsAliasesCreateOrUpdateResponse>,
      ServerDnsAliasesCreateOrUpdateResponse
    >
  >;
  /**
   * Deletes the server DNS alias with the given name.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server that the alias is pointing to.
   * @param dnsAliasName The name of the server DNS alias.
   * @param options The options parameters.
   */
  delete(
    resourceGroupName: string,
    serverName: string,
    dnsAliasName: string,
    options?: coreHttp.OperationOptions
  ): Promise<
    PollerLike<PollOperationState<coreHttp.RestResponse>, coreHttp.RestResponse>
  >;
  /**
   * Acquires server DNS alias from another server.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server that the alias is pointing to.
   * @param dnsAliasName The name of the server dns alias.
   * @param parameters A server DNS alias acquisition request.
   * @param options The options parameters.
   */
  acquire(
    resourceGroupName: string,
    serverName: string,
    dnsAliasName: string,
    parameters: ServerDnsAliasAcquisition,
    options?: coreHttp.OperationOptions
  ): Promise<
    PollerLike<PollOperationState<coreHttp.RestResponse>, coreHttp.RestResponse>
  >;
}
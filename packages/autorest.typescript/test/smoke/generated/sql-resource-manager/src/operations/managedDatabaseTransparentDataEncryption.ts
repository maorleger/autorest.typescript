/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import { setContinuationToken } from "../pagingHelper.js";
import { ManagedDatabaseTransparentDataEncryption } from "../operationsInterfaces/index.js";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers.js";
import * as Parameters from "../models/parameters.js";
import { SqlManagementClient } from "../sqlManagementClient.js";
import {
  ManagedTransparentDataEncryption,
  ManagedDatabaseTransparentDataEncryptionListByDatabaseNextOptionalParams,
  ManagedDatabaseTransparentDataEncryptionListByDatabaseOptionalParams,
  ManagedDatabaseTransparentDataEncryptionListByDatabaseResponse,
  TransparentDataEncryptionName,
  ManagedDatabaseTransparentDataEncryptionGetOptionalParams,
  ManagedDatabaseTransparentDataEncryptionGetResponse,
  ManagedDatabaseTransparentDataEncryptionCreateOrUpdateOptionalParams,
  ManagedDatabaseTransparentDataEncryptionCreateOrUpdateResponse,
  ManagedDatabaseTransparentDataEncryptionListByDatabaseNextResponse,
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Class containing ManagedDatabaseTransparentDataEncryption operations. */
export class ManagedDatabaseTransparentDataEncryptionImpl
  implements ManagedDatabaseTransparentDataEncryption
{
  private readonly client: SqlManagementClient;

  /**
   * Initialize a new instance of the class ManagedDatabaseTransparentDataEncryption class.
   * @param client Reference to the service client
   */
  constructor(client: SqlManagementClient) {
    this.client = client;
  }

  /**
   * Gets a list of managed database's transparent data encryptions.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param managedInstanceName The name of the managed instance.
   * @param databaseName The name of the managed database for which the transparent data encryption is
   *                     defined.
   * @param options The options parameters.
   */
  public listByDatabase(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    options?: ManagedDatabaseTransparentDataEncryptionListByDatabaseOptionalParams,
  ): PagedAsyncIterableIterator<ManagedTransparentDataEncryption> {
    const iter = this.listByDatabasePagingAll(
      resourceGroupName,
      managedInstanceName,
      databaseName,
      options,
    );
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings?: PageSettings) => {
        if (settings?.maxPageSize) {
          throw new Error("maxPageSize is not supported by this operation.");
        }
        return this.listByDatabasePagingPage(
          resourceGroupName,
          managedInstanceName,
          databaseName,
          options,
          settings,
        );
      },
    };
  }

  private async *listByDatabasePagingPage(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    options?: ManagedDatabaseTransparentDataEncryptionListByDatabaseOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<ManagedTransparentDataEncryption[]> {
    let result: ManagedDatabaseTransparentDataEncryptionListByDatabaseResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listByDatabase(
        resourceGroupName,
        managedInstanceName,
        databaseName,
        options,
      );
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listByDatabaseNext(
        resourceGroupName,
        managedInstanceName,
        databaseName,
        continuationToken,
        options,
      );
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listByDatabasePagingAll(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    options?: ManagedDatabaseTransparentDataEncryptionListByDatabaseOptionalParams,
  ): AsyncIterableIterator<ManagedTransparentDataEncryption> {
    for await (const page of this.listByDatabasePagingPage(
      resourceGroupName,
      managedInstanceName,
      databaseName,
      options,
    )) {
      yield* page;
    }
  }

  /**
   * Gets a managed database's transparent data encryption.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param managedInstanceName The name of the managed instance.
   * @param databaseName The name of the managed database for which the transparent data encryption is
   *                     defined.
   * @param tdeName The name of the transparent data encryption configuration.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    tdeName: TransparentDataEncryptionName,
    options?: ManagedDatabaseTransparentDataEncryptionGetOptionalParams,
  ): Promise<ManagedDatabaseTransparentDataEncryptionGetResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        managedInstanceName,
        databaseName,
        tdeName,
        options,
      },
      getOperationSpec,
    );
  }

  /**
   * Updates a database's transparent data encryption configuration.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param managedInstanceName The name of the managed instance.
   * @param databaseName The name of the managed database for which the security alert policy is defined.
   * @param tdeName The name of the transparent data encryption configuration.
   * @param parameters The database transparent data encryption.
   * @param options The options parameters.
   */
  createOrUpdate(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    tdeName: TransparentDataEncryptionName,
    parameters: ManagedTransparentDataEncryption,
    options?: ManagedDatabaseTransparentDataEncryptionCreateOrUpdateOptionalParams,
  ): Promise<ManagedDatabaseTransparentDataEncryptionCreateOrUpdateResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        managedInstanceName,
        databaseName,
        tdeName,
        parameters,
        options,
      },
      createOrUpdateOperationSpec,
    );
  }

  /**
   * Gets a list of managed database's transparent data encryptions.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param managedInstanceName The name of the managed instance.
   * @param databaseName The name of the managed database for which the transparent data encryption is
   *                     defined.
   * @param options The options parameters.
   */
  private _listByDatabase(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    options?: ManagedDatabaseTransparentDataEncryptionListByDatabaseOptionalParams,
  ): Promise<ManagedDatabaseTransparentDataEncryptionListByDatabaseResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, managedInstanceName, databaseName, options },
      listByDatabaseOperationSpec,
    );
  }

  /**
   * ListByDatabaseNext
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param managedInstanceName The name of the managed instance.
   * @param databaseName The name of the managed database for which the transparent data encryption is
   *                     defined.
   * @param nextLink The nextLink from the previous successful call to the ListByDatabase method.
   * @param options The options parameters.
   */
  private _listByDatabaseNext(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    nextLink: string,
    options?: ManagedDatabaseTransparentDataEncryptionListByDatabaseNextOptionalParams,
  ): Promise<ManagedDatabaseTransparentDataEncryptionListByDatabaseNextResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        managedInstanceName,
        databaseName,
        nextLink,
        options,
      },
      listByDatabaseNextOperationSpec,
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/managedInstances/{managedInstanceName}/databases/{databaseName}/transparentDataEncryption/{tdeName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ManagedTransparentDataEncryption,
    },
    default: {},
  },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.databaseName,
    Parameters.managedInstanceName,
    Parameters.tdeName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/managedInstances/{managedInstanceName}/databases/{databaseName}/transparentDataEncryption/{tdeName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.ManagedTransparentDataEncryption,
    },
    201: {
      bodyMapper: Mappers.ManagedTransparentDataEncryption,
    },
    default: {},
  },
  requestBody: Parameters.parameters46,
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.databaseName,
    Parameters.managedInstanceName,
    Parameters.tdeName,
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};
const listByDatabaseOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/managedInstances/{managedInstanceName}/databases/{databaseName}/transparentDataEncryption",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ManagedTransparentDataEncryptionListResult,
    },
    default: {},
  },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.databaseName,
    Parameters.managedInstanceName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listByDatabaseNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ManagedTransparentDataEncryptionListResult,
    },
    default: {},
  },
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.databaseName,
    Parameters.nextLink,
    Parameters.managedInstanceName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};

/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import { setContinuationToken } from "../pagingHelper.js";
import { Providers } from "../operationsInterfaces/index.js";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers.js";
import * as Parameters from "../models/parameters.js";
import { ResourceManagementClient } from "../resourceManagementClient.js";
import {
  Provider,
  ProvidersListNextOptionalParams,
  ProvidersListOptionalParams,
  ProvidersListResponse,
  ProvidersListAtTenantScopeNextOptionalParams,
  ProvidersListAtTenantScopeOptionalParams,
  ProvidersListAtTenantScopeResponse,
  ProvidersUnregisterOptionalParams,
  ProvidersUnregisterResponse,
  ProvidersRegisterOptionalParams,
  ProvidersRegisterResponse,
  ProvidersGetOptionalParams,
  ProvidersGetResponse,
  ProvidersGetAtTenantScopeOptionalParams,
  ProvidersGetAtTenantScopeResponse,
  ProvidersListNextResponse,
  ProvidersListAtTenantScopeNextResponse,
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Class containing Providers operations. */
export class ProvidersImpl implements Providers {
  private readonly client: ResourceManagementClient;

  /**
   * Initialize a new instance of the class Providers class.
   * @param client Reference to the service client
   */
  constructor(client: ResourceManagementClient) {
    this.client = client;
  }

  /**
   * Gets all resource providers for a subscription.
   * @param options The options parameters.
   */
  public list(
    options?: ProvidersListOptionalParams,
  ): PagedAsyncIterableIterator<Provider> {
    const iter = this.listPagingAll(options);
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
        return this.listPagingPage(options, settings);
      },
    };
  }

  private async *listPagingPage(
    options?: ProvidersListOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<Provider[]> {
    let result: ProvidersListResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._list(options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listNext(continuationToken, options);
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listPagingAll(
    options?: ProvidersListOptionalParams,
  ): AsyncIterableIterator<Provider> {
    for await (const page of this.listPagingPage(options)) {
      yield* page;
    }
  }

  /**
   * Gets all resource providers for the tenant.
   * @param options The options parameters.
   */
  public listAtTenantScope(
    options?: ProvidersListAtTenantScopeOptionalParams,
  ): PagedAsyncIterableIterator<Provider> {
    const iter = this.listAtTenantScopePagingAll(options);
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
        return this.listAtTenantScopePagingPage(options, settings);
      },
    };
  }

  private async *listAtTenantScopePagingPage(
    options?: ProvidersListAtTenantScopeOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<Provider[]> {
    let result: ProvidersListAtTenantScopeResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listAtTenantScope(options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listAtTenantScopeNext(continuationToken, options);
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listAtTenantScopePagingAll(
    options?: ProvidersListAtTenantScopeOptionalParams,
  ): AsyncIterableIterator<Provider> {
    for await (const page of this.listAtTenantScopePagingPage(options)) {
      yield* page;
    }
  }

  /**
   * Unregisters a subscription from a resource provider.
   * @param resourceProviderNamespace The namespace of the resource provider to unregister.
   * @param options The options parameters.
   */
  unregister(
    resourceProviderNamespace: string,
    options?: ProvidersUnregisterOptionalParams,
  ): Promise<ProvidersUnregisterResponse> {
    return this.client.sendOperationRequest(
      { resourceProviderNamespace, options },
      unregisterOperationSpec,
    );
  }

  /**
   * Registers a subscription with a resource provider.
   * @param resourceProviderNamespace The namespace of the resource provider to register.
   * @param options The options parameters.
   */
  register(
    resourceProviderNamespace: string,
    options?: ProvidersRegisterOptionalParams,
  ): Promise<ProvidersRegisterResponse> {
    return this.client.sendOperationRequest(
      { resourceProviderNamespace, options },
      registerOperationSpec,
    );
  }

  /**
   * Gets all resource providers for a subscription.
   * @param options The options parameters.
   */
  private _list(
    options?: ProvidersListOptionalParams,
  ): Promise<ProvidersListResponse> {
    return this.client.sendOperationRequest({ options }, listOperationSpec);
  }

  /**
   * Gets all resource providers for the tenant.
   * @param options The options parameters.
   */
  private _listAtTenantScope(
    options?: ProvidersListAtTenantScopeOptionalParams,
  ): Promise<ProvidersListAtTenantScopeResponse> {
    return this.client.sendOperationRequest(
      { options },
      listAtTenantScopeOperationSpec,
    );
  }

  /**
   * Gets the specified resource provider.
   * @param resourceProviderNamespace The namespace of the resource provider.
   * @param options The options parameters.
   */
  get(
    resourceProviderNamespace: string,
    options?: ProvidersGetOptionalParams,
  ): Promise<ProvidersGetResponse> {
    return this.client.sendOperationRequest(
      { resourceProviderNamespace, options },
      getOperationSpec,
    );
  }

  /**
   * Gets the specified resource provider at the tenant level.
   * @param resourceProviderNamespace The namespace of the resource provider.
   * @param options The options parameters.
   */
  getAtTenantScope(
    resourceProviderNamespace: string,
    options?: ProvidersGetAtTenantScopeOptionalParams,
  ): Promise<ProvidersGetAtTenantScopeResponse> {
    return this.client.sendOperationRequest(
      { resourceProviderNamespace, options },
      getAtTenantScopeOperationSpec,
    );
  }

  /**
   * ListNext
   * @param nextLink The nextLink from the previous successful call to the List method.
   * @param options The options parameters.
   */
  private _listNext(
    nextLink: string,
    options?: ProvidersListNextOptionalParams,
  ): Promise<ProvidersListNextResponse> {
    return this.client.sendOperationRequest(
      { nextLink, options },
      listNextOperationSpec,
    );
  }

  /**
   * ListAtTenantScopeNext
   * @param nextLink The nextLink from the previous successful call to the ListAtTenantScope method.
   * @param options The options parameters.
   */
  private _listAtTenantScopeNext(
    nextLink: string,
    options?: ProvidersListAtTenantScopeNextOptionalParams,
  ): Promise<ProvidersListAtTenantScopeNextResponse> {
    return this.client.sendOperationRequest(
      { nextLink, options },
      listAtTenantScopeNextOperationSpec,
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const unregisterOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/providers/{resourceProviderNamespace}/unregister",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.Provider,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceProviderNamespace,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const registerOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/providers/{resourceProviderNamespace}/register",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.Provider,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceProviderNamespace,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/providers",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ProviderListResult,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  queryParameters: [Parameters.apiVersion, Parameters.top, Parameters.expand],
  urlParameters: [Parameters.$host, Parameters.subscriptionId],
  headerParameters: [Parameters.accept],
  serializer,
};
const listAtTenantScopeOperationSpec: coreClient.OperationSpec = {
  path: "/providers",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ProviderListResult,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  queryParameters: [Parameters.apiVersion, Parameters.top, Parameters.expand],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer,
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/providers/{resourceProviderNamespace}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.Provider,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  queryParameters: [Parameters.apiVersion, Parameters.expand],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceProviderNamespace,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const getAtTenantScopeOperationSpec: coreClient.OperationSpec = {
  path: "/providers/{resourceProviderNamespace}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.Provider,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  queryParameters: [Parameters.apiVersion, Parameters.expand],
  urlParameters: [Parameters.$host, Parameters.resourceProviderNamespace],
  headerParameters: [Parameters.accept],
  serializer,
};
const listNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ProviderListResult,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  urlParameters: [
    Parameters.$host,
    Parameters.nextLink,
    Parameters.subscriptionId,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listAtTenantScopeNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ProviderListResult,
    },
    default: {
      bodyMapper: Mappers.CloudError,
    },
  },
  urlParameters: [Parameters.$host, Parameters.nextLink],
  headerParameters: [Parameters.accept],
  serializer,
};

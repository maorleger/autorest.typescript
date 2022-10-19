/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { JobExecutions } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { SqlManagementClient } from "../sqlManagementClient";
import { PollerLike, PollOperationState, LroEngine } from "@azure/core-lro";
import { LroImpl } from "../lroImpl";
import {
  JobExecution,
  JobExecutionsListByAgentNextOptionalParams,
  JobExecutionsListByAgentOptionalParams,
  JobExecutionsListByJobNextOptionalParams,
  JobExecutionsListByJobOptionalParams,
  JobExecutionsListByAgentResponse,
  JobExecutionsCancelOptionalParams,
  JobExecutionsCreateOptionalParams,
  JobExecutionsCreateResponse,
  JobExecutionsListByJobResponse,
  JobExecutionsGetOptionalParams,
  JobExecutionsGetResponse,
  JobExecutionsCreateOrUpdateOptionalParams,
  JobExecutionsCreateOrUpdateResponse,
  JobExecutionsListByAgentNextResponse,
  JobExecutionsListByJobNextResponse
} from "../models";

/// <reference lib="esnext.asynciterable" />
/** Class containing JobExecutions operations. */
export class JobExecutionsImpl implements JobExecutions {
  private readonly client: SqlManagementClient;

  /**
   * Initialize a new instance of the class JobExecutions class.
   * @param client Reference to the service client
   */
  constructor(client: SqlManagementClient) {
    this.client = client;
  }

  /**
   * Lists all executions in a job agent.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param options The options parameters.
   */
  public listByAgent(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    options?: JobExecutionsListByAgentOptionalParams
  ): PagedAsyncIterableIterator<JobExecution> {
    const iter = this.listByAgentPagingAll(
      resourceGroupName,
      serverName,
      jobAgentName,
      options
    );
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: () => {
        return this.listByAgentPagingPage(
          resourceGroupName,
          serverName,
          jobAgentName,
          options
        );
      }
    };
  }

  private async *listByAgentPagingPage(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    options?: JobExecutionsListByAgentOptionalParams
  ): AsyncIterableIterator<JobExecution[]> {
    let result = await this._listByAgent(
      resourceGroupName,
      serverName,
      jobAgentName,
      options
    );
    yield result.value || [];
    let continuationToken = result.nextLink;
    while (continuationToken) {
      result = await this._listByAgentNext(
        resourceGroupName,
        serverName,
        jobAgentName,
        continuationToken,
        options
      );
      continuationToken = result.nextLink;
      yield result.value || [];
    }
  }

  private async *listByAgentPagingAll(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    options?: JobExecutionsListByAgentOptionalParams
  ): AsyncIterableIterator<JobExecution> {
    for await (const page of this.listByAgentPagingPage(
      resourceGroupName,
      serverName,
      jobAgentName,
      options
    )) {
      yield* page;
    }
  }

  /**
   * Lists a job's executions.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job to get.
   * @param options The options parameters.
   */
  public listByJob(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    options?: JobExecutionsListByJobOptionalParams
  ): PagedAsyncIterableIterator<JobExecution> {
    const iter = this.listByJobPagingAll(
      resourceGroupName,
      serverName,
      jobAgentName,
      jobName,
      options
    );
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: () => {
        return this.listByJobPagingPage(
          resourceGroupName,
          serverName,
          jobAgentName,
          jobName,
          options
        );
      }
    };
  }

  private async *listByJobPagingPage(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    options?: JobExecutionsListByJobOptionalParams
  ): AsyncIterableIterator<JobExecution[]> {
    let result = await this._listByJob(
      resourceGroupName,
      serverName,
      jobAgentName,
      jobName,
      options
    );
    yield result.value || [];
    let continuationToken = result.nextLink;
    while (continuationToken) {
      result = await this._listByJobNext(
        resourceGroupName,
        serverName,
        jobAgentName,
        jobName,
        continuationToken,
        options
      );
      continuationToken = result.nextLink;
      yield result.value || [];
    }
  }

  private async *listByJobPagingAll(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    options?: JobExecutionsListByJobOptionalParams
  ): AsyncIterableIterator<JobExecution> {
    for await (const page of this.listByJobPagingPage(
      resourceGroupName,
      serverName,
      jobAgentName,
      jobName,
      options
    )) {
      yield* page;
    }
  }

  /**
   * Lists all executions in a job agent.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param options The options parameters.
   */
  private _listByAgent(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    options?: JobExecutionsListByAgentOptionalParams
  ): Promise<JobExecutionsListByAgentResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, serverName, jobAgentName, options },
      listByAgentOperationSpec
    );
  }

  /**
   * Requests cancellation of a job execution.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job.
   * @param jobExecutionId The id of the job execution to cancel.
   * @param options The options parameters.
   */
  cancel(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    jobExecutionId: string,
    options?: JobExecutionsCancelOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        serverName,
        jobAgentName,
        jobName,
        jobExecutionId,
        options
      },
      cancelOperationSpec
    );
  }

  /**
   * Starts an elastic job execution.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job to get.
   * @param options The options parameters.
   */
  async beginCreate(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    options?: JobExecutionsCreateOptionalParams
  ): Promise<
    PollerLike<
      PollOperationState<JobExecutionsCreateResponse>,
      JobExecutionsCreateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<JobExecutionsCreateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ) => {
      let currentRawResponse:
        | coreClient.FullOperationResponse
        | undefined = undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback
        }
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON()
        }
      };
    };

    const lro = new LroImpl(
      sendOperation,
      { resourceGroupName, serverName, jobAgentName, jobName, options },
      createOperationSpec
    );
    const poller = new LroEngine(lro, {
      resumeFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Starts an elastic job execution.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job to get.
   * @param options The options parameters.
   */
  async beginCreateAndWait(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    options?: JobExecutionsCreateOptionalParams
  ): Promise<JobExecutionsCreateResponse> {
    const poller = await this.beginCreate(
      resourceGroupName,
      serverName,
      jobAgentName,
      jobName,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Lists a job's executions.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job to get.
   * @param options The options parameters.
   */
  private _listByJob(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    options?: JobExecutionsListByJobOptionalParams
  ): Promise<JobExecutionsListByJobResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, serverName, jobAgentName, jobName, options },
      listByJobOperationSpec
    );
  }

  /**
   * Gets a job execution.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job.
   * @param jobExecutionId The id of the job execution
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    jobExecutionId: string,
    options?: JobExecutionsGetOptionalParams
  ): Promise<JobExecutionsGetResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        serverName,
        jobAgentName,
        jobName,
        jobExecutionId,
        options
      },
      getOperationSpec
    );
  }

  /**
   * Creates or updates a job execution.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job to get.
   * @param jobExecutionId The job execution id to create the job execution under.
   * @param options The options parameters.
   */
  async beginCreateOrUpdate(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    jobExecutionId: string,
    options?: JobExecutionsCreateOrUpdateOptionalParams
  ): Promise<
    PollerLike<
      PollOperationState<JobExecutionsCreateOrUpdateResponse>,
      JobExecutionsCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<JobExecutionsCreateOrUpdateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ) => {
      let currentRawResponse:
        | coreClient.FullOperationResponse
        | undefined = undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback
        }
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON()
        }
      };
    };

    const lro = new LroImpl(
      sendOperation,
      {
        resourceGroupName,
        serverName,
        jobAgentName,
        jobName,
        jobExecutionId,
        options
      },
      createOrUpdateOperationSpec
    );
    const poller = new LroEngine(lro, {
      resumeFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Creates or updates a job execution.
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job to get.
   * @param jobExecutionId The job execution id to create the job execution under.
   * @param options The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    jobExecutionId: string,
    options?: JobExecutionsCreateOrUpdateOptionalParams
  ): Promise<JobExecutionsCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(
      resourceGroupName,
      serverName,
      jobAgentName,
      jobName,
      jobExecutionId,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * ListByAgentNext
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param nextLink The nextLink from the previous successful call to the ListByAgent method.
   * @param options The options parameters.
   */
  private _listByAgentNext(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    nextLink: string,
    options?: JobExecutionsListByAgentNextOptionalParams
  ): Promise<JobExecutionsListByAgentNextResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, serverName, jobAgentName, nextLink, options },
      listByAgentNextOperationSpec
    );
  }

  /**
   * ListByJobNext
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param serverName The name of the server.
   * @param jobAgentName The name of the job agent.
   * @param jobName The name of the job to get.
   * @param nextLink The nextLink from the previous successful call to the ListByJob method.
   * @param options The options parameters.
   */
  private _listByJobNext(
    resourceGroupName: string,
    serverName: string,
    jobAgentName: string,
    jobName: string,
    nextLink: string,
    options?: JobExecutionsListByJobNextOptionalParams
  ): Promise<JobExecutionsListByJobNextResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        serverName,
        jobAgentName,
        jobName,
        nextLink,
        options
      },
      listByJobNextOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const listByAgentOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/jobAgents/{jobAgentName}/executions",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.JobExecutionListResult
    },
    default: {}
  },
  queryParameters: [
    Parameters.skip,
    Parameters.apiVersion2,
    Parameters.createTimeMin,
    Parameters.createTimeMax,
    Parameters.endTimeMin,
    Parameters.endTimeMax,
    Parameters.isActive,
    Parameters.top
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.jobAgentName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const cancelOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/jobAgents/{jobAgentName}/jobs/{jobName}/executions/{jobExecutionId}/cancel",
  httpMethod: "POST",
  responses: { 200: {}, default: {} },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.jobAgentName,
    Parameters.jobName,
    Parameters.jobExecutionId
  ],
  serializer
};
const createOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/jobAgents/{jobAgentName}/jobs/{jobName}/start",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.JobExecution
    },
    201: {
      bodyMapper: Mappers.JobExecution
    },
    202: {
      bodyMapper: Mappers.JobExecution
    },
    204: {
      bodyMapper: Mappers.JobExecution
    },
    default: {}
  },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.jobAgentName,
    Parameters.jobName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listByJobOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/jobAgents/{jobAgentName}/jobs/{jobName}/executions",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.JobExecutionListResult
    },
    default: {}
  },
  queryParameters: [
    Parameters.skip,
    Parameters.apiVersion2,
    Parameters.createTimeMin,
    Parameters.createTimeMax,
    Parameters.endTimeMin,
    Parameters.endTimeMax,
    Parameters.isActive,
    Parameters.top
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.jobAgentName,
    Parameters.jobName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/jobAgents/{jobAgentName}/jobs/{jobName}/executions/{jobExecutionId}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.JobExecution
    },
    default: {}
  },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.jobAgentName,
    Parameters.jobName,
    Parameters.jobExecutionId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Sql/servers/{serverName}/jobAgents/{jobAgentName}/jobs/{jobName}/executions/{jobExecutionId}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.JobExecution
    },
    201: {
      bodyMapper: Mappers.JobExecution
    },
    202: {
      bodyMapper: Mappers.JobExecution
    },
    204: {
      bodyMapper: Mappers.JobExecution
    },
    default: {}
  },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.jobAgentName,
    Parameters.jobName,
    Parameters.jobExecutionId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listByAgentNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.JobExecutionListResult
    },
    default: {}
  },
  queryParameters: [
    Parameters.skip,
    Parameters.apiVersion2,
    Parameters.createTimeMin,
    Parameters.createTimeMax,
    Parameters.endTimeMin,
    Parameters.endTimeMax,
    Parameters.isActive,
    Parameters.top
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.nextLink,
    Parameters.jobAgentName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listByJobNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.JobExecutionListResult
    },
    default: {}
  },
  queryParameters: [
    Parameters.skip,
    Parameters.apiVersion2,
    Parameters.createTimeMin,
    Parameters.createTimeMax,
    Parameters.endTimeMin,
    Parameters.endTimeMax,
    Parameters.isActive,
    Parameters.top
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.serverName,
    Parameters.nextLink,
    Parameters.jobAgentName,
    Parameters.jobName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
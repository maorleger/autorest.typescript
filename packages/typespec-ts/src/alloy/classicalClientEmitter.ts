// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";
import { shouldUseAlloyClientClass } from "./codeGenerationEmitter.js";
import {
  generateClientClass,
  createClientClassData,
  ClientClassData
} from "./components/ClientClass.js";

/**
 * Builds classical client class using Alloy components if enabled
 * @param model - The RLC model containing options and data
 * @param clientName - The name of the client class
 * @returns The generated content or null if not using Alloy
 */
export function buildClassicalClientWithAlloy(
  model: RLCModel,
  clientName: string
): string | null {
  if (!shouldUseAlloyClientClass(model)) {
    return null;
  }

  const classicalClientName = `${clientName}Client`;
  const modularClientName = `${clientName}Context`;
  const rlcClientName = `${clientName}`;
  const isMultiEndpoint = false; // TODO: Get actual value from model
  
  const clientParams = [
    {
      name: "endpointParam",
      type: "string",
      isOptional: false,
      docs: ["The endpoint URL"]
    },
    {
      name: "options",
      type: `${classicalClientName}OptionalParams`,
      isOptional: true,
      docs: ["Optional parameters"]
    }
  ];

  const operationMethods = [
    {
      name: "getUser",
      parameters: [
        {
          name: "userId",
          type: "string",
          isOptional: false,
          docs: ["The user ID"]
        },
        {
          name: "options",
          type: "GetUserOptions",
          isOptional: true,
          docs: ["Optional parameters"]
        }
      ],
      returnType: "Promise<GetUserResponse>",
      body: "    return getUserOperation(this._client, userId, options);",
      docs: ["Get a user by ID"],
      isAsync: true
    }
  ];

  const clientClassData = createClientClassData(
    classicalClientName,
    modularClientName,
    rlcClientName,
    isMultiEndpoint,
    clientParams,
    operationMethods
  );

  return generateClientClass(clientClassData);
}

/**
 * Creates mock client class data for testing
 * @param clientName - The name of the client
 * @returns Mock client class data
 */
export function createMockClientClassData(clientName: string): ClientClassData {
  const classicalClientName = `${clientName}Client`;
  const modularClientName = `${clientName}Context`;
  const rlcClientName = `${clientName}`;
  
  return {
    className: classicalClientName,
    clientType: modularClientName,
    rlcClientName,
    isMultiEndpoint: false,
    constructorParameters: [
      {
        name: "endpointParam",
        type: "string",
        isOptional: false,
        docs: ["The endpoint URL"]
      },
      {
        name: "options",
        type: `${classicalClientName}OptionalParams`,
        isOptional: true,
        docs: ["Optional parameters"]
      }
    ],
    constructorBody: `    this._client = ${rlcClientName}(endpointParam, options);
    this.pipeline = this._client.pipeline;`,
    methods: [
      {
        name: "getUser",
        parameters: [
          {
            name: "userId",
            type: "string",
            isOptional: false,
            docs: ["The user ID"]
          },
          {
            name: "options",
            type: "GetUserOptions",
            isOptional: true,
            docs: ["Optional parameters"]
          }
        ],
        returnType: "Promise<GetUserResponse>",
        body: "    return getUserOperation(this._client, userId, options);",
        docs: ["Get a user by ID"],
        isAsync: true
      }
    ],
    docs: [`${classicalClientName} client`]
  };
}

/**
 * Demonstrates Alloy client class generation
 * @param clientName - The name of the client
 * @returns The generated client class code
 */
export function demoAlloyClientClass(clientName: string = "Test"): string {
  const mockData = createMockClientClassData(clientName);
  return generateClientClass(mockData);
}
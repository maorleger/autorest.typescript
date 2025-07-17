// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";
import { shouldUseAlloyOperationFunction } from "./codeGenerationEmitter.js";
import {
  generateOperationFunction,
  generateSendFunction,
  generateDeserializeFunction,
  createOperationFunctionData,
  createSendFunctionData,
  createDeserializeFunctionData
} from "./components/OperationFunction.js";

/**
 * Builds operation functions using Alloy components if enabled
 * @param model - The RLC model containing options and data
 * @param operationName - The name of the operation
 * @param operation - The operation data
 * @returns The generated content or null if not using Alloy
 */
export function buildOperationWithAlloy(
  model: RLCModel,
  operationName: string,
  operation: any
): string | null {
  if (!shouldUseAlloyOperationFunction(model)) {
    return null;
  }

  const clientType = "Client";
  const isLroOperation = operation.isLroOperation || false;
  const isPagingOperation = operation.isPagingOperation || false;

  // Generate the main operation function
  const operationFunctionData = createOperationFunctionData(
    operationName,
    operation,
    clientType,
    isLroOperation,
    isPagingOperation
  );

  // Generate the send function
  const sendFunctionData = createSendFunctionData(
    operationName,
    operation,
    clientType
  );

  // Generate the deserialize function
  const deserializeFunctionData = createDeserializeFunctionData(
    operationName,
    operation,
    isLroOperation
  );

  const operationFunction = generateOperationFunction(operationFunctionData);
  const sendFunction = generateSendFunction(sendFunctionData);
  const deserializeFunction = generateDeserializeFunction(deserializeFunctionData);

  return [operationFunction, sendFunction, deserializeFunction].join("\n\n");
}

/**
 * Creates mock operation data for testing
 * @param operationName - The name of the operation
 * @returns Mock operation data
 */
export function createMockOperationData(operationName: string): any {
  return {
    path: `/api/${operationName}`,
    method: "GET",
    parameters: [
      {
        name: "id",
        type: "string",
        optional: false,
        docs: ["The resource ID"]
      },
      {
        name: "options",
        type: `${operationName}Options`,
        optional: true,
        docs: ["Optional parameters"]
      }
    ],
    returnType: `${operationName}Response`,
    pathParameters: [
      {
        name: "id",
        type: "string",
        urlTemplate: "{id}"
      }
    ],
    queryParameters: [
      {
        name: "filter",
        type: "string",
        isApiVersion: false
      }
    ],
    headerParameters: [
      {
        name: "customHeader",
        type: "string",
        headerName: "X-Custom-Header"
      }
    ],
    expectedStatuses: ["200", "201"],
    deserializedType: `${operationName}Response`,
    docs: [`Performs ${operationName} operation`],
    isLroOperation: false,
    isPagingOperation: false,
    hasApiVersion: false
  };
}

/**
 * Creates mock LRO operation data for testing
 * @param operationName - The name of the operation
 * @returns Mock LRO operation data
 */
export function createMockLroOperationData(operationName: string): any {
  const baseData = createMockOperationData(operationName);
  return {
    ...baseData,
    method: "PUT",
    isLroOperation: true,
    returnType: `${operationName}Result`,
    lroSubPath: ".result",
    expectedStatuses: ["200", "201", "202"]
  };
}

/**
 * Creates mock paging operation data for testing
 * @param operationName - The name of the operation
 * @returns Mock paging operation data
 */
export function createMockPagingOperationData(operationName: string): any {
  const baseData = createMockOperationData(operationName);
  return {
    ...baseData,
    isPagingOperation: true,
    returnType: `${operationName}Item`,
    expectedStatuses: ["200"]
  };
}

/**
 * Demonstrates Alloy operation function generation
 * @param operationName - The name of the operation
 * @returns The generated operation function code
 */
export function demoAlloyOperationFunction(operationName: string = "getUser"): string {
  const mockData = createMockOperationData(operationName);
  const clientType = "Client";
  
  const operationFunctionData = createOperationFunctionData(
    operationName,
    mockData,
    clientType,
    false,
    false
  );

  return generateOperationFunction(operationFunctionData);
}

/**
 * Demonstrates Alloy LRO operation function generation
 * @param operationName - The name of the operation
 * @returns The generated LRO operation function code
 */
export function demoAlloyLroOperationFunction(operationName: string = "createResource"): string {
  const mockData = createMockLroOperationData(operationName);
  const clientType = "Client";
  
  const operationFunctionData = createOperationFunctionData(
    operationName,
    mockData,
    clientType,
    true,
    false
  );

  return generateOperationFunction(operationFunctionData);
}

/**
 * Demonstrates Alloy paging operation function generation
 * @param operationName - The name of the operation
 * @returns The generated paging operation function code
 */
export function demoAlloyPagingOperationFunction(operationName: string = "listUsers"): string {
  const mockData = createMockPagingOperationData(operationName);
  const clientType = "Client";
  
  const operationFunctionData = createOperationFunctionData(
    operationName,
    mockData,
    clientType,
    false,
    true
  );

  return generateOperationFunction(operationFunctionData);
}
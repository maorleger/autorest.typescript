// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";
import { shouldUseAlloyClientInterface } from "./codeGenerationEmitter.js";
import { 
  generateClientInterface, 
  createClientInterfaceData,
  ClientInterfaceData
} from "./components/ClientInterface.js";

/**
 * Builds client definitions using Alloy components if enabled
 * @param model - The RLC model containing options and data
 * @returns The generated content or null if not using Alloy
 */
export function buildClientDefinitionsWithAlloy(model: RLCModel): string | null {
  if (!shouldUseAlloyClientInterface(model)) {
    return null;
  }

  const pathDictionary = model.paths;
  const shortcuts = model.options?.includeShortcuts ? [] : []; // TODO: Get actual shortcuts
  const operationGroups: any[] = []; // TODO: Get actual operation groups
  const clientName = getClientName(model);
  
  const clientInterfaceData = createClientInterfaceData(
    clientName,
    pathDictionary,
    shortcuts,
    operationGroups
  );

  return generateClientInterface(clientInterfaceData);
}

/**
 * Gets the client name from the model
 * @param model - The RLC model
 * @returns The client name
 */
function getClientName(model: RLCModel): string {
  return model.options?.title || "Client";
}

/**
 * Creates mock client interface data for testing
 * @param clientName - The name of the client
 * @returns Mock client interface data
 */
export function createMockClientInterfaceData(clientName: string): ClientInterfaceData {
  return {
    clientName,
    routeSignatures: [
      {
        pathTemplate: "/users/{userId}",
        method: "GET",
        parameters: [
          {
            name: "userId",
            type: "string",
            isOptional: false
          }
        ],
        returnType: "StreamableMethod<GetUserResponse>",
        docs: ["Get user by ID"]
      }
    ],
    shortcutGroups: [
      {
        name: "users",
        type: "UserOperations",
        docs: ["User operations"]
      }
    ],
    hasClientLevelShortcuts: true,
    docs: [`${clientName} client interface`]
  };
}

/**
 * Demonstrates Alloy client interface generation
 * @param clientName - The name of the client
 * @returns The generated client interface code
 */
export function demoAlloyClientInterface(clientName: string = "TestClient"): string {
  const mockData = createMockClientInterfaceData(clientName);
  return generateClientInterface(mockData);
}
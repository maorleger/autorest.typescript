// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { 
  InterfaceDeclaration, 
  InterfaceMember, 
  TypeDeclaration,
  SourceFile,
  ImportStatement
} from "@alloy-js/typescript";
import { AlloyReferenceManager, AlloyGenerationContext } from "../core/references.js";
import { RLCModel, PathMetadata } from "@azure-tools/rlc-common";
import { ServiceOperation } from "../../utils/operationUtil.js";

export interface ClientInterfaceConfig {
  clientName: string;
  paths: Record<string, PathMetadata>;
  operationGroups: string[];
  hasShortcuts: boolean;
  imports: string[];
}

/**
 * Production-ready client interface generation using proper Alloy components
 */
export function ClientInterfaceComponent({ 
  config, 
  context 
}: { 
  config: ClientInterfaceConfig; 
  context: AlloyGenerationContext; 
}) {
  const interfaceRef = AlloyReferenceManager.createClientInterfaceRef(config.clientName);
  const routesRef = AlloyReferenceManager.createTypeRef("Routes");
  
  return (
    <>
      {/* Routes Interface */}
      <RoutesInterface 
        paths={config.paths} 
        context={context} 
        refkey={routesRef}
      />
      
      {/* Client Type Definition */}
      <ClientTypeDefinition 
        config={config} 
        context={context}
        refkey={interfaceRef}
      />
      
      {/* Operation Group Interfaces */}
      {config.operationGroups.map(groupName => (
        <OperationGroupInterface
          key={groupName}
          groupName={groupName}
          paths={config.paths}
          context={context}
        />
      ))}
    </>
  );
}

/**
 * Routes interface for path-first routing
 */
function RoutesInterface({ 
  paths, 
  context, 
  refkey 
}: { 
  paths: Record<string, PathMetadata>; 
  context: AlloyGenerationContext; 
  refkey: string;
}) {
  return (
    <InterfaceDeclaration 
      name="Routes" 
      refkey={refkey}
      export={true}
    >
      {Object.entries(paths).map(([path, pathInfo]) => (
        <RouteSignature
          key={path}
          path={path}
          pathInfo={pathInfo}
          context={context}
        />
      ))}
    </InterfaceDeclaration>
  );
}

/**
 * Individual route signature
 */
function RouteSignature({ 
  path, 
  pathInfo, 
  context 
}: { 
  path: string; 
  pathInfo: PathMetadata; 
  context: AlloyGenerationContext; 
}) {
  const routeRef = AlloyReferenceManager.createRouteRef(path, "GET");
  const returnType = getRouteReturnType(pathInfo);
  
  return (
    <InterfaceMember
      name={`(path: "${path}", ${getRouteParameters(pathInfo)})`}
      type={returnType}
      refkey={routeRef}
    />
  );
}

/**
 * Client type definition
 */
function ClientTypeDefinition({ 
  config, 
  context, 
  refkey 
}: { 
  config: ClientInterfaceConfig; 
  context: AlloyGenerationContext; 
  refkey: string;
}) {
  const clientTypeMembers = [
    "Client",
    "{ path: Routes }",
    ...config.operationGroups.map(group => `{ ${getOperationGroupProperty(group)}: ${group}Operations }`),
    ...(config.hasShortcuts ? ["ClientOperations"] : [])
  ];
  
  const clientType = clientTypeMembers.join(" & ");
  
  return (
    <TypeDeclaration
      name={config.clientName}
      type={clientType}
      refkey={refkey}
      export={true}
    />
  );
}

/**
 * Operation group interface
 */
function OperationGroupInterface({ 
  groupName, 
  paths, 
  context 
}: { 
  groupName: string; 
  paths: Record<string, PathMetadata>; 
  context: AlloyGenerationContext; 
}) {
  const interfaceRef = AlloyReferenceManager.createTypeRef(`${groupName}Operations`);
  const groupOperations = getOperationsForGroup(groupName, paths);
  
  return (
    <InterfaceDeclaration 
      name={`${groupName}Operations`} 
      refkey={interfaceRef}
      export={true}
    >
      {groupOperations.map(operation => (
        <OperationSignature
          key={operation.name}
          operation={operation}
          context={context}
        />
      ))}
    </InterfaceDeclaration>
  );
}

/**
 * Individual operation signature
 */
function OperationSignature({ 
  operation, 
  context 
}: { 
  operation: ServiceOperation; 
  context: AlloyGenerationContext; 
}) {
  const operationRef = AlloyReferenceManager.createOperationRef(operation);
  const parameters = getOperationParameters(operation);
  const returnType = getOperationReturnType(operation);
  
  return (
    <InterfaceMember
      name={`${operation.name}(${parameters})`}
      type={returnType}
      refkey={operationRef}
    />
  );
}

/**
 * Complete source file for client interface
 */
export function ClientInterfaceSourceFile({
  config,
  context
}: {
  config: ClientInterfaceConfig;
  context: AlloyGenerationContext;
}) {
  const fileName = "clientDefinitions.ts";
  
  return (
    <SourceFile path={fileName}>
      {/* Imports */}
      {config.imports.map(importPath => (
        <ImportStatement
          key={importPath}
          moduleSpecifier={importPath}
          namedImports={getNamedImportsForModule(importPath)}
        />
      ))}
      
      {/* Client interface components */}
      <ClientInterfaceComponent config={config} context={context} />
    </SourceFile>
  );
}

// Helper functions

function getRouteReturnType(pathInfo: PathMetadata): string {
  // Determine return type based on path operations
  if (pathInfo.operations && pathInfo.operations.length > 0) {
    const operationName = pathInfo.name;
    return `StreamableMethod<${operationName}Response>`;
  }
  return "StreamableMethod";
}

function getRouteParameters(pathInfo: PathMetadata): string {
  const params: string[] = [];
  
  // Add path parameters
  if (pathInfo.pathParameters) {
    pathInfo.pathParameters.forEach(param => {
      params.push(`${param.name}: ${param.type}`);
    });
  }
  
  return params.join(", ");
}

function getOperationGroupProperty(groupName: string): string {
  // Convert "UserOperations" to "user"
  return groupName.replace(/Operations$/, "").toLowerCase();
}

function getOperationsForGroup(groupName: string, paths: Record<string, PathMetadata>): ServiceOperation[] {
  const operations: ServiceOperation[] = [];
  
  Object.values(paths).forEach(pathInfo => {
    if (pathInfo.operationGroupName === groupName && pathInfo.operations) {
      operations.push(...pathInfo.operations);
    }
  });
  
  return operations;
}

function getOperationParameters(operation: ServiceOperation): string {
  const params: string[] = [];
  
  // Add operation-specific parameters
  operation.parameters?.forEach(param => {
    if (!param.onClient) {
      const paramStr = `${param.name}${param.optional ? "?" : ""}: ${param.type}`;
      params.push(paramStr);
    }
  });
  
  // Add options parameter
  params.push(`options?: ${operation.name}Options`);
  
  return params.join(", ");
}

function getOperationReturnType(operation: ServiceOperation): string {
  // Handle LRO operations
  if (operation.lroMetadata) {
    return `PollerLike<OperationState<${operation.response.type}>, ${operation.response.type}>`;
  }
  
  // Handle paging operations
  if (operation.paging) {
    return `PagedAsyncIterableIterator<${operation.response.type}>`;
  }
  
  // Regular operation
  return `Promise<${operation.response.type}>`;
}

function getNamedImportsForModule(modulePath: string): string[] {
  const importMap: Record<string, string[]> = {
    "@azure-tools/core-client": ["Client", "StreamableMethod"],
    "@azure-tools/core-paging": ["PagedAsyncIterableIterator"],
    "@azure-tools/core-lro": ["PollerLike", "OperationState"],
    "./parameters.js": [], // Dynamic based on used parameters
    "./responses.js": [], // Dynamic based on used responses
    "./models.js": [] // Dynamic based on used models
  };
  
  return importMap[modulePath] || [];
}
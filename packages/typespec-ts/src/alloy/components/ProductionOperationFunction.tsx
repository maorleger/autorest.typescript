// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { 
  FunctionDeclaration, 
  SourceFile,
  ImportStatement,
  VarDeclaration
} from "@alloy-js/typescript";
import { AlloyReferenceManager, AlloyGenerationContext } from "../core/references.js";
import { ServiceOperation } from "../../utils/operationUtil.js";

export interface OperationFunctionConfig {
  operation: ServiceOperation;
  clientType: string;
  isLroOperation: boolean;
  isPagingOperation: boolean;
  imports: string[];
}

/**
 * Production-ready operation function generation using proper Alloy components
 */
export function OperationFunctionComponent({ 
  config, 
  context 
}: { 
  config: OperationFunctionConfig; 
  context: AlloyGenerationContext; 
}) {
  const { operation, clientType, isLroOperation, isPagingOperation } = config;
  const operationRef = AlloyReferenceManager.createOperationFunctionRef(operation);
  
  return (
    <>
      {/* Main operation function */}
      <MainOperationFunction
        operation={operation}
        clientType={clientType}
        isLroOperation={isLroOperation}
        isPagingOperation={isPagingOperation}
        refkey={operationRef}
        context={context}
      />
      
      {/* Send function */}
      <SendFunction
        operation={operation}
        clientType={clientType}
        context={context}
      />
      
      {/* Deserialize function */}
      <DeserializeFunction
        operation={operation}
        isLroOperation={isLroOperation}
        context={context}
      />
    </>
  );
}

/**
 * Main operation function
 */
function MainOperationFunction({ 
  operation, 
  clientType, 
  isLroOperation, 
  isPagingOperation, 
  refkey, 
  context 
}: { 
  operation: ServiceOperation; 
  clientType: string; 
  isLroOperation: boolean; 
  isPagingOperation: boolean; 
  refkey: string; 
  context: AlloyGenerationContext; 
}) {
  const parameters = createOperationParameters(operation, clientType, context);
  const returnType = createOperationReturnType(operation, isLroOperation, isPagingOperation);
  const body = createOperationBody(operation, isLroOperation, isPagingOperation);
  
  return (
    <FunctionDeclaration
      name={operation.name}
      refkey={refkey}
      parameters={parameters}
      returnType={returnType}
      async={true}
      export={true}
    >
      {body}
    </FunctionDeclaration>
  );
}

/**
 * Send function for making HTTP requests
 */
function SendFunction({ 
  operation, 
  clientType, 
  context 
}: { 
  operation: ServiceOperation; 
  clientType: string; 
  context: AlloyGenerationContext; 
}) {
  const sendRef = AlloyReferenceManager.createSendFunctionRef(operation);
  const parameters = createSendParameters(operation, clientType, context);
  const body = createSendBody(operation);
  
  return (
    <FunctionDeclaration
      name={`_${operation.name}Send`}
      refkey={sendRef}
      parameters={parameters}
      returnType="StreamableMethod"
      export={true}
    >
      {body}
    </FunctionDeclaration>
  );
}

/**
 * Deserialize function for processing responses
 */
function DeserializeFunction({ 
  operation, 
  isLroOperation, 
  context 
}: { 
  operation: ServiceOperation; 
  isLroOperation: boolean; 
  context: AlloyGenerationContext; 
}) {
  const deserializeRef = AlloyReferenceManager.createDeserializeFunctionRef(operation);
  const parameters = createDeserializeParameters(operation, context);
  const returnType = createDeserializeReturnType(operation, isLroOperation);
  const body = createDeserializeBody(operation, isLroOperation);
  
  return (
    <FunctionDeclaration
      name={`_${operation.name}Deserialize`}
      refkey={deserializeRef}
      parameters={parameters}
      returnType={returnType}
      async={true}
      export={true}
    >
      {body}
    </FunctionDeclaration>
  );
}

/**
 * Complete source file for operation functions
 */
export function OperationFunctionSourceFile({
  config,
  context
}: {
  config: OperationFunctionConfig;
  context: AlloyGenerationContext;
}) {
  const fileName = `${config.operation.name}Operations.ts`;
  
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
      
      {/* Operation function components */}
      <OperationFunctionComponent config={config} context={context} />
    </SourceFile>
  );
}

// Helper functions for parameter creation

function createOperationParameters(
  operation: ServiceOperation, 
  clientType: string, 
  context: AlloyGenerationContext
): Record<string, any> {
  const parameters: Record<string, any> = {};
  
  // Add context parameter
  parameters.context = {
    type: clientType,
    refkey: AlloyReferenceManager.createParameterRef("context", operation.name)
  };
  
  // Add operation-specific parameters
  operation.parameters?.forEach(param => {
    if (!param.onClient) {
      parameters[param.name] = {
        type: param.type,
        optional: param.optional,
        refkey: AlloyReferenceManager.createParameterRef(param.name, operation.name)
      };
    }
  });
  
  // Add options parameter
  parameters.options = {
    type: `${operation.name}Options`,
    optional: true,
    refkey: AlloyReferenceManager.createParameterRef("options", operation.name)
  };
  
  return parameters;
}

function createSendParameters(
  operation: ServiceOperation, 
  clientType: string, 
  context: AlloyGenerationContext
): Record<string, any> {
  const parameters: Record<string, any> = {};
  
  // Add context parameter
  parameters.context = {
    type: clientType,
    refkey: AlloyReferenceManager.createParameterRef("context", `${operation.name}Send`)
  };
  
  // Add all operation parameters for send function
  operation.parameters?.forEach(param => {
    if (!param.onClient) {
      parameters[param.name] = {
        type: param.type,
        optional: param.optional,
        refkey: AlloyReferenceManager.createParameterRef(param.name, `${operation.name}Send`)
      };
    }
  });
  
  // Add options parameter
  parameters.options = {
    type: `${operation.name}Options`,
    optional: true,
    refkey: AlloyReferenceManager.createParameterRef("options", `${operation.name}Send`)
  };
  
  return parameters;
}

function createDeserializeParameters(
  operation: ServiceOperation, 
  context: AlloyGenerationContext
): Record<string, any> {
  return {
    result: {
      type: "PathUncheckedResponse",
      refkey: AlloyReferenceManager.createParameterRef("result", `${operation.name}Deserialize`)
    }
  };
}

// Helper functions for return types

function createOperationReturnType(
  operation: ServiceOperation, 
  isLroOperation: boolean, 
  isPagingOperation: boolean
): string {
  if (isLroOperation) {
    return `PollerLike<OperationState<${operation.response.type}>, ${operation.response.type}>`;
  }
  
  if (isPagingOperation) {
    return `PagedAsyncIterableIterator<${operation.response.type}>`;
  }
  
  return `Promise<${operation.response.type}>`;
}

function createDeserializeReturnType(
  operation: ServiceOperation, 
  isLroOperation: boolean
): string {
  if (isLroOperation) {
    return `Promise<${operation.lroMetadata?.finalResponse?.result || operation.response.type}>`;
  }
  
  return `Promise<${operation.response.type}>`;
}

// Helper functions for function bodies

function createOperationBody(
  operation: ServiceOperation, 
  isLroOperation: boolean, 
  isPagingOperation: boolean
): string {
  const sendFunctionCall = `_${operation.name}Send(context, ${getParameterList(operation)})`;
  const deserializeFunctionCall = `_${operation.name}Deserialize(result)`;
  
  if (isLroOperation) {
    return `
  const result = await ${sendFunctionCall};
  return getLongRunningPoller(context, result, {
    deserialize: ${deserializeFunctionCall}
  });
    `;
  }
  
  if (isPagingOperation) {
    return `
  return buildPagedAsyncIterator(
    context,
    () => ${sendFunctionCall},
    ${deserializeFunctionCall},
    options
  );
    `;
  }
  
  return `
  const result = await ${sendFunctionCall};
  return ${deserializeFunctionCall};
  `;
}

function createSendBody(operation: ServiceOperation): string {
  const operationPath = operation.operation.path;
  const operationMethod = operation.operation.verb.toLowerCase();
  
  // Build URL template handling
  const urlTemplateParams = getUrlTemplateParams(operation);
  const pathBuilder = urlTemplateParams.length > 0 
    ? `const path = parseTemplate("${operationPath}", {${urlTemplateParams.join(", ")}});`
    : "";
  
  const pathVariable = urlTemplateParams.length > 0 ? "path" : `"${operationPath}"`;
  
  // Build request parameters
  const requestParams = getRequestParameters(operation);
  
  return `
  ${pathBuilder}
  return context.path(${pathVariable}).${operationMethod}({
    ${requestParams.join(",\n    ")}
  });
  `;
}

function createDeserializeBody(operation: ServiceOperation, isLroOperation: boolean): string {
  const expectedStatuses = operation.operation.responses.map(r => r.statusCode).join(", ");
  
  let deserializationLogic = "return result.body;";
  
  if (isLroOperation && operation.lroMetadata?.finalResponse?.resultSegments) {
    const resultPath = operation.lroMetadata.finalResponse.resultSegments
      .map(seg => `.${seg.name}`)
      .join("");
    deserializationLogic = `return result.body${resultPath};`;
  }
  
  return `
  const expectedStatuses = [${expectedStatuses}];
  if (!expectedStatuses.includes(result.status)) {
    throw createRestError(result);
  }
  
  ${deserializationLogic}
  `;
}

// Utility functions

function getParameterList(operation: ServiceOperation): string {
  const params: string[] = [];
  
  operation.parameters?.forEach(param => {
    if (!param.onClient) {
      params.push(param.name);
    }
  });
  
  params.push("options");
  
  return params.join(", ");
}

function getUrlTemplateParams(operation: ServiceOperation): string[] {
  const params: string[] = [];
  
  operation.parameters?.forEach(param => {
    if (param.location === "path") {
      params.push(`${param.name}: ${param.name}`);
    } else if (param.location === "query") {
      params.push(`${param.name}: options?.${param.name}`);
    }
  });
  
  return params;
}

function getRequestParameters(operation: ServiceOperation): string[] {
  const params: string[] = ["...operationOptionsToRequestParameters(options)"];
  
  // Add headers
  const headerParams = operation.parameters?.filter(p => p.location === "header");
  if (headerParams && headerParams.length > 0) {
    const headers = headerParams.map(p => `"${p.headerName}": options?.${p.name}`).join(", ");
    params.push(`headers: { ${headers} }`);
  }
  
  // Add body
  const bodyParam = operation.parameters?.find(p => p.location === "body");
  if (bodyParam) {
    params.push(`body: ${bodyParam.name}`);
  }
  
  return params;
}

function getNamedImportsForModule(modulePath: string): string[] {
  const importMap: Record<string, string[]> = {
    "@azure-tools/core-client": ["StreamableMethod", "PathUncheckedResponse", "createRestError"],
    "@azure-tools/core-paging": ["PagedAsyncIterableIterator", "buildPagedAsyncIterator"],
    "@azure-tools/core-lro": ["PollerLike", "OperationState", "getLongRunningPoller"],
    "../utils/urlTemplate.js": ["parseTemplate"],
    "../utils/requestParameters.js": ["operationOptionsToRequestParameters"],
    "./index.js": ["Client"]
  };
  
  return importMap[modulePath] || [];
}
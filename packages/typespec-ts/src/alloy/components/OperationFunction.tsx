// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { code } from "@alloy-js/core";
import { 
  FunctionDeclaration, 
  ParameterDeclarationProps
} from "./BaseTypeScriptComponents.js";

export interface OperationFunctionProps {
  functionName: string;
  parameters: ParameterDeclarationProps[];
  returnType: string;
  body: string;
  isAsync?: boolean;
  isExported?: boolean;
  docs?: string[];
  isLroOperation?: boolean;
  isPagingOperation?: boolean;
}

export interface SendFunctionProps {
  functionName: string;
  parameters: ParameterDeclarationProps[];
  returnType: string;
  operationPath: string;
  operationMethod: string;
  pathParameters: PathParameterProps[];
  queryParameters: QueryParameterProps[];
  headerParameters: HeaderParameterProps[];
  bodyParameter?: BodyParameterProps;
  hasApiVersion?: boolean;
  docs?: string[];
}

export interface DeserializeFunctionProps {
  functionName: string;
  returnType: string;
  expectedStatuses: string[];
  deserializedType?: string;
  lroSubPath?: string;
  isLroOperation?: boolean;
  docs?: string[];
}

export interface PathParameterProps {
  name: string;
  type: string;
  urlTemplate?: string;
}

export interface QueryParameterProps {
  name: string;
  type: string;
  isApiVersion?: boolean;
  collectionFormat?: string;
}

export interface HeaderParameterProps {
  name: string;
  type: string;
  headerName: string;
}

export interface BodyParameterProps {
  name: string;
  type: string;
  contentType?: string;
  isSpread?: boolean;
}

export function OperationFunction({
  functionName,
  parameters,
  returnType,
  body,
  isAsync = false,
  isExported = true,
  docs,
  isLroOperation = false,
  isPagingOperation = false
}: OperationFunctionProps) {
  const operationDocs = docs || [`Operation: ${functionName}`];
  
  if (isLroOperation) {
    operationDocs.push("This is a long-running operation.");
  }
  
  if (isPagingOperation) {
    operationDocs.push("This operation supports paging.");
  }

  return (
    <FunctionDeclaration
      name={functionName}
      parameters={parameters}
      returnType={returnType}
      body={body}
      isAsync={isAsync}
      isExported={isExported}
      docs={operationDocs}
    />
  );
}

export function SendFunction({
  functionName,
  parameters,
  returnType,
  operationPath,
  operationMethod,
  pathParameters,
  queryParameters,
  headerParameters,
  bodyParameter,
  hasApiVersion = false,
  docs
}: SendFunctionProps) {
  const optionalParamName = parameters.find(p => p.name.includes("options"))?.name || "options";
  
  let statements: string[] = [];
  
  // Handle URL template parameters
  if (pathParameters.length > 0 || queryParameters.length > 0) {
    const urlTemplateParams = [
      ...pathParameters.map(p => `${p.name}: ${p.name}`),
      ...queryParameters.map(p => `${p.name}: ${optionalParamName}?.${p.name}`)
    ];
    
    statements.push(`const path = parseTemplate("${operationPath}", {
        ${urlTemplateParams.join(",\n        ")}
      }, {
        allowReserved: ${optionalParamName}?.requestOptions?.skipUrlEncoding
      });`);
  }
  
  // Handle API version policy
  if (hasApiVersion) {
    statements.push(
      `context.pipeline.removePolicy({ name: "ClientApiVersionPolicy"});`
    );
  }
  
  // Build request parameters
  const requestParams = ["...operationOptionsToRequestParameters(options)"];
  
  if (headerParameters.length > 0) {
    const headers = headerParameters.map(h => 
      `"${h.headerName}": ${optionalParamName}?.${h.name}`
    ).join(", ");
    requestParams.push(`headers: { ${headers} }`);
  }
  
  if (bodyParameter) {
    if (bodyParameter.isSpread) {
      requestParams.push(`body: ${optionalParamName}?.${bodyParameter.name}`);
    } else {
      requestParams.push(`body: ${bodyParameter.name}`);
    }
    
    if (bodyParameter.contentType) {
      requestParams.push(`contentType: "${bodyParameter.contentType}"`);
    }
  }
  
  const pathStr = pathParameters.length > 0 || queryParameters.length > 0 ? "path" : `"${operationPath}"`;
  statements.push(
    `return context.path(${pathStr}).${operationMethod}({${requestParams.join(", ")}});`
  );
  
  const body = statements.join("\n  ");
  
  return (
    <FunctionDeclaration
      name={functionName}
      parameters={parameters}
      returnType={returnType}
      body={`  ${body}`}
      isExported={true}
      docs={docs || [`Sends ${operationMethod.toUpperCase()} request to ${operationPath}`]}
    />
  );
}

export function DeserializeFunction({
  functionName,
  returnType,
  expectedStatuses,
  deserializedType,
  lroSubPath,
  isLroOperation = false,
  docs
}: DeserializeFunctionProps) {
  let statements: string[] = [];
  
  statements.push(`const expectedStatuses = [${expectedStatuses.join(", ")}];`);
  statements.push(`if (!expectedStatuses.includes(result.status)) {`);
  statements.push(`  throw createRestError(result);`);
  statements.push(`}`);
  
  if (isLroOperation) {
    statements.push("");
    statements.push(`// Handle LRO result`);
    if (lroSubPath) {
      statements.push(`return result.body${lroSubPath};`);
    } else {
      statements.push(`return result.body;`);
    }
  } else if (deserializedType) {
    statements.push("");
    statements.push(`// Deserialize response`);
    statements.push(`return result.body;`);
  } else {
    statements.push("");
    statements.push(`// No response body expected`);
    statements.push(`return;`);
  }
  
  const body = statements.join("\n  ");
  
  return (
    <FunctionDeclaration
      name={functionName}
      parameters={[
        {
          name: "result",
          type: "PathUncheckedResponse"
        }
      ]}
      returnType={`Promise<${returnType}>`}
      body={`  ${body}`}
      isAsync={true}
      isExported={true}
      docs={docs || [`Deserializes the response for ${functionName}`]}
    />
  );
}

export function generateOperationFunction(props: OperationFunctionProps): string {
  const component = OperationFunction(props);
  return String(component);
}

export function generateSendFunction(props: SendFunctionProps): string {
  const component = SendFunction(props);
  return String(component);
}

export function generateDeserializeFunction(props: DeserializeFunctionProps): string {
  const component = DeserializeFunction(props);
  return String(component);
}

// Helper functions for generating operation function data

export interface OperationFunctionData {
  functionName: string;
  parameters: ParameterDeclarationProps[];
  returnType: string;
  body: string;
  isAsync?: boolean;
  isExported?: boolean;
  docs?: string[];
  isLroOperation?: boolean;
  isPagingOperation?: boolean;
}

export function createOperationFunctionData(
  operationName: string,
  operation: any,
  clientType: string,
  isLroOperation: boolean = false,
  isPagingOperation: boolean = false
): OperationFunctionData {
  const parameters = operation.parameters?.map((p: any) => ({
    name: p.name,
    type: p.type,
    isOptional: p.optional,
    docs: p.docs
  })) || [];
  
  // Add context parameter
  parameters.unshift({
    name: "context",
    type: clientType,
    isOptional: false
  });
  
  const returnType = isLroOperation 
    ? `PollerLike<OperationState<${operation.returnType}>, ${operation.returnType}>`
    : isPagingOperation
    ? `PagedAsyncIterableIterator<${operation.returnType}>`
    : `Promise<${operation.returnType}>`;
  
  const body = generateOperationBody(operationName, operation, isLroOperation, isPagingOperation);
  
  return {
    functionName: operationName,
    parameters,
    returnType,
    body,
    isAsync: true,
    isExported: true,
    docs: operation.docs || [`Performs ${operationName} operation`],
    isLroOperation,
    isPagingOperation
  };
}

function generateOperationBody(
  operationName: string,
  operation: any,
  isLroOperation: boolean,
  isPagingOperation: boolean
): string {
  const sendFunctionName = `_${operationName}Send`;
  const deserializeFunctionName = `_${operationName}Deserialize`;
  
  if (isLroOperation) {
    return `  const result = await ${sendFunctionName}(context, ...arguments);
  return getLongRunningPoller(context, result, {
    deserialize: ${deserializeFunctionName}
  });`;
  } else if (isPagingOperation) {
    return `  return buildPagedAsyncIterator(
    context,
    ${sendFunctionName},
    ${deserializeFunctionName},
    options
  );`;
  } else {
    return `  const result = await ${sendFunctionName}(context, ...arguments);
  return ${deserializeFunctionName}(result);`;
  }
}

export function createSendFunctionData(
  operationName: string,
  operation: any,
  clientType: string
): SendFunctionProps {
  const functionName = `_${operationName}Send`;
  const parameters = operation.parameters?.map((p: any) => ({
    name: p.name,
    type: p.type,
    isOptional: p.optional,
    docs: p.docs
  })) || [];
  
  // Add context parameter
  parameters.unshift({
    name: "context",
    type: clientType,
    isOptional: false
  });
  
  return {
    functionName,
    parameters,
    returnType: "StreamableMethod",
    operationPath: operation.path,
    operationMethod: operation.method.toLowerCase(),
    pathParameters: operation.pathParameters || [],
    queryParameters: operation.queryParameters || [],
    headerParameters: operation.headerParameters || [],
    bodyParameter: operation.bodyParameter,
    hasApiVersion: operation.hasApiVersion || false,
    docs: [`Sends ${operation.method.toUpperCase()} request to ${operation.path}`]
  };
}

export function createDeserializeFunctionData(
  operationName: string,
  operation: any,
  isLroOperation: boolean = false
): DeserializeFunctionProps {
  const functionName = `_${operationName}Deserialize`;
  
  return {
    functionName,
    returnType: operation.returnType || "void",
    expectedStatuses: operation.expectedStatuses || ["200"],
    deserializedType: operation.deserializedType,
    lroSubPath: operation.lroSubPath,
    isLroOperation,
    docs: [`Deserializes the response for ${operationName}`]
  };
}

// Export component for use in other files
export { OperationFunction as default };
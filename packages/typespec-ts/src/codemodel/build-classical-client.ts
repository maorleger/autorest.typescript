// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Data builder for classical client files.
 *
 * Transforms TCGC types into a ClassicalClientDeclaration — a pure data
 * structure with zero ts-morph imports.
 */

import {
  InitializedByFlags,
  SdkClientType,
  SdkServiceMethod,
  SdkServiceOperation
} from "@azure-tools/typespec-client-generator-core";
import { SdkContext } from "../utils/interfaces.js";
import { NameType, normalizeName } from "@azure-tools/rlc-common";
import {
  getClientParametersDeclaration
} from "../modular/helpers/clientHelpers.js";
import {
  getClassicalClientName,
  getClientName
} from "../modular/helpers/namingHelpers.js";
import { getDocsFromDescription } from "../modular/helpers/docsHelpers.js";
import { getOperationFunction } from "../modular/helpers/operationHelpers.js";
import {
  getModularClientOptions,
  isRLCMultiEndpoint
} from "../utils/clientUtils.js";
import {
  getMethodHierarchiesMap,
  isTenantLevelOperation
} from "../utils/operationUtil.js";
import { resolveReference } from "../framework/reference.js";
import { useDependencies } from "../framework/hooks/useDependencies.js";
import { refkey } from "../framework/refkey.js";
import { ModularEmitterOptions } from "../modular/interfaces.js";
import { getPagingLROMethodName } from "../modular/helpers/classicalOperationHelpers.js";
import {
  PagingHelpers,
  SimplePollerHelpers
} from "../modular/static-helpers-metadata.js";
import { AzurePollingDependencies } from "../modular/external-dependencies.js";
import type {
  ClassicalClientDeclaration,
  MethodShape,
  OperationGroupShape,
  ChildClientAccessor,
  ParameterShape
} from "./types.js";

export function buildClassicalClientData(
  dpgContext: SdkContext,
  clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions
): ClassicalClientDeclaration {
  const dependencies = useDependencies();
  const [_hierarchy, client] = clientMap;
  const modularClientName = getClientName(client);
  const classicalClientName = getClassicalClientName(client);
  const { subfolder, rlcClientName } = getModularClientOptions(clientMap);
  const srcPath = emitterOptions.modularOptions.sourceRoot;

  // File path
  const filePath = `${srcPath}/${
    subfolder && subfolder !== "" ? subfolder + "/" : ""
  }${normalizeName(classicalClientName, NameType.File)}.ts`;

  // Client property type
  const clientPropertyType = isRLCMultiEndpoint(dpgContext)
    ? `Client.${rlcClientName}`
    : rlcClientName;

  // Pipeline type
  const pipelineType = resolveReference(dependencies.Pipeline);

  // Constructor parameters
  const classicalParams = getClientParametersDeclaration(client, dpgContext, {
    requiredOnly: true
  });
  const constructorParameters: ParameterShape[] = classicalParams.map((p) => ({
    name: p.name,
    type: typeof p.type === "string" ? p.type : String(p.type),
    optional: p.hasQuestionToken === true
  }));

  // Context parameters (for factory call)
  const contextParams = getClientParametersDeclaration(client, dpgContext, {
    onClientOnly: false,
    requiredOnly: true
  });

  // Check for child clients
  const hasChildClients = Boolean(
    client.children?.some(
      (c) => c.clientInitialization.initializedBy & InitializedByFlags.Parent
    )
  );

  // Check for subscriptionId overload need
  const hasSubscriptionIdParam = classicalParams.some(
    (p) => p.name.toLowerCase() === "subscriptionid"
  );
  const needsSubscriptionIdOverload =
    Boolean(dpgContext.arm) &&
    hasSubscriptionIdParam &&
    hasTenantLevelOps(client, dpgContext);

  // Overload base params
  const overloadBaseParameters = needsSubscriptionIdOverload
    ? classicalParams
        .filter(
          (p) =>
            p.name.toLowerCase() !== "subscriptionid" &&
            p.name.toLowerCase() !== "options"
        )
        .map(
          (p): ParameterShape => ({
            name: p.name,
            type: typeof p.type === "string" ? p.type : String(p.type),
            optional: p.hasQuestionToken === true
          })
        )
    : undefined;

  // Options type
  const optionsTypeName = `${classicalClientName}OptionalParams`;
  const optionsTypeExportSource = `./api/${normalizeName(modularClientName, NameType.File)}Context.js`;

  // Constructor body
  const constructorBody = buildConstructorBody(
    contextParams,
    modularClientName,
    emitterOptions,
    hasChildClients,
    classicalParams,
    needsSubscriptionIdOverload
  );

  // Client params type (for child client support)
  const clientParamsType = hasChildClients
    ? `{${classicalParams.map((p) => `${p.name}: ${typeof p.type === "string" ? p.type : String(p.type)}`).join("; ")}}`
    : undefined;
  const clientParamsInitStatement = hasChildClients
    ? `this._clientParams = {${classicalParams.map((p) => p.name).join(",")}};`
    : undefined;

  // Build methods and operation groups
  const { methods, operationGroups } = buildMethodsAndGroups(
    dpgContext,
    client,
    clientMap,
    subfolder
  );

  // Build child client accessors
  const childClientAccessors = buildChildAccessors(dpgContext, client);

  return {
    filePath,
    className: classicalClientName,
    modularClientName,
    doc: getDocsFromDescription(client.doc),
    clientPropertyType,
    pipelineType,
    constructorParameters,
    constructorBody,
    needsSubscriptionIdOverload,
    overloadBaseParameters,
    optionsTypeName,
    optionsTypeExportSource,
    hasChildClients,
    clientParamsType,
    clientParamsInitStatement,
    methods,
    operationGroups,
    childClientAccessors
  };
}

function buildConstructorBody(
  contextParams: any[],
  modularClientName: string,
  _emitterOptions: ModularEmitterOptions,
  hasChildClients: boolean,
  classicalParams: any[],
  needsSubscriptionIdOverload: boolean
): string[] {
  const body: string[] = [];

  const paramNames = (contextParams ?? [])
    .map((p: any) => p.name)
    .map((x: string) => {
      if (x === "options") {
        return `{...options, userAgentOptions: ${JSON.stringify({ userAgentPrefix: "azsdk-js-client" })}}`;
      } else if (
        x.toLowerCase() === "subscriptionid" &&
        needsSubscriptionIdOverload
      ) {
        return `subscriptionId ?? ""`;
      }
      return x;
    });

  body.push(
    `this._client = create${modularClientName}(${paramNames.join(",")});`
  );
  body.push(`this.pipeline = this._client.pipeline;`);

  if (hasChildClients) {
    body.push(
      `this._clientParams = {${classicalParams.map((p: any) => p.name).join(",")}};`
    );
  }

  return body;
}

function buildMethodsAndGroups(
  dpgContext: SdkContext,
  client: SdkClientType<SdkServiceOperation>,
  _clientMap: [string[], SdkClientType<SdkServiceOperation>],
  subfolder: string | undefined
): { methods: MethodShape[]; operationGroups: OperationGroupShape[] } {
  const methods: MethodShape[] = [];
  const operationGroups: OperationGroupShape[] = [];

  let clientType = "Client";
  if (subfolder && subfolder !== "") {
    clientType = `Client.${getClassicalClientName(client)}`;
  }

  const methodMap = getMethodHierarchiesMap(dpgContext, client);
  const seenGroups = new Set<string>();

  for (const [prefixKey, operations] of methodMap) {
    const prefixes = prefixKey.split("/");
    if (prefixKey === "") {
      // Direct methods on the client
      for (const op of operations) {
        methods.push(
          ...buildMethodShapes(dpgContext, clientType, [prefixes, op])
        );
      }
    } else {
      // Operation group
      const rawGroupName = normalizeName(
        prefixes[0] ?? "",
        NameType.Interface
      );
      const groupName = normalizeName(rawGroupName, NameType.Property);

      if (!seenGroups.has(groupName)) {
        seenGroups.add(groupName);
        operationGroups.push({
          name: groupName,
          rawName: rawGroupName,
          propertyName: groupName,
          getterName: `_get${normalizeName(rawGroupName, NameType.OperationGroup)}Operations`,
          operationsTypeName: `${normalizeName(rawGroupName, NameType.OperationGroup)}Operations`
        });
      }
    }
  }

  return { methods, operationGroups };
}

function buildMethodShapes(
  context: SdkContext,
  clientType: string,
  method: [string[], SdkServiceMethod<SdkServiceOperation>]
): MethodShape[] {
  const result: MethodShape[] = [];
  const declaration = getOperationFunction(context, method, clientType);
  const methodName = declaration.propertyName ?? declaration.name ?? "FIXME";
  const methodParams = (declaration.parameters ?? [])
    .filter((p) => p.name !== "context")
    .map(
      (p): ParameterShape => ({
        name: p.name,
        type: typeof p.type === "string" ? p.type : String(p.type),
        optional: p.hasQuestionToken === true
      })
    );

  const declarationRefKey = resolveReference(refkey(method[1], "api"));
  const methodParamStr = [
    "this._client",
    ...methodParams.map((p) => p.name)
  ].join(", ");

  result.push({
    name: methodName,
    parameters: methodParams,
    returnType:
      typeof declaration.returnType === "string"
        ? declaration.returnType
        : String(declaration.returnType ?? "void"),
    doc: declaration.docs as string[] | undefined,
    bodyStatements: [`return ${declarationRefKey}(${methodParamStr});`]
  });

  // LRO compatibility methods
  if (
    context.rlcOptions?.compatibilityLro &&
    declaration?.isLro &&
    !declaration?.isLroPaging
  ) {
    const operationStateRef = resolveReference(
      AzurePollingDependencies.OperationState
    );
    const simplePollerLikeRef = resolveReference(
      SimplePollerHelpers.SimplePollerLike
    );
    const getSimplePollerRef = resolveReference(
      SimplePollerHelpers.getSimplePoller
    );
    const returnType = declaration?.lroFinalReturnType ?? "void";
    const beginName = normalizeName(`begin_${methodName}`, NameType.Method);
    const beginAndWaitName = normalizeName(
      `${beginName}_andWait`,
      NameType.Method
    );

    result.push({
      name: beginName,
      parameters: methodParams,
      returnType: `Promise<${simplePollerLikeRef}<${operationStateRef}<${returnType}>, ${returnType}>>`,
      isAsync: true,
      isDeprecated: true,
      deprecationMessage: `use ${methodName} instead`,
      bodyStatements: [
        `const poller = ${declarationRefKey}(${methodParamStr});`,
        `await poller.submitted();`,
        `return ${getSimplePollerRef}(poller);`
      ]
    });

    result.push({
      name: beginAndWaitName,
      parameters: methodParams,
      returnType: `Promise<${returnType}>`,
      isAsync: true,
      isDeprecated: true,
      deprecationMessage: `use ${methodName} instead`,
      bodyStatements: [
        `return await ${declarationRefKey}(${methodParamStr});`
      ]
    });
  } else if (
    context.rlcOptions?.compatibilityLro &&
    declaration?.isLroPaging
  ) {
    const returnType = declaration?.lropagingFinalReturnType ?? "void";
    const pagedIterRef = resolveReference(
      PagingHelpers.PagedAsyncIterableIterator
    );
    const beginListAndWaitName = normalizeName(
      `${getPagingLROMethodName(methodName)}`,
      NameType.Method
    );

    result.push({
      name: beginListAndWaitName,
      parameters: methodParams,
      returnType: `${pagedIterRef}<${returnType}>`,
      isAsync: false,
      isDeprecated: true,
      deprecationMessage: `use ${methodName} instead`,
      bodyStatements: [`return ${declarationRefKey}(${methodParamStr});`]
    });
  }

  return result;
}

function buildChildAccessors(
  dpgContext: SdkContext,
  client: SdkClientType<SdkServiceOperation>
): ChildClientAccessor[] {
  if (!client.children) return [];

  return client.children
    .filter(
      (child) =>
        child.clientInitialization.initializedBy & InitializedByFlags.Parent
    )
    .map((child) => {
      const parentParams = getClientParametersDeclaration(client, dpgContext, {
        requiredOnly: true
      });
      const childParams = getClientParametersDeclaration(child, dpgContext, {
        requiredOnly: true
      });
      const diffParams = childParams.filter(
        (p) =>
          !parentParams.some(
            (pp) => pp.name === p.name && pp.name !== "options"
          )
      );
      const childName = getClassicalClientName(child);
      const subfolder = normalizeName(
        child.name.replace("Client", ""),
        NameType.File
      );

      const parentArgStr = parentParams
        .filter((p) => !p.name.includes("options"))
        .map((p) => `this._clientParams.${p.name}`)
        .join(",");
      const diffArgStr = diffParams
        .filter((p) => p.name !== "options")
        .map((p) => p.name)
        .join(",");
      const separator =
        parentParams.filter((p) => !p.name.includes("options")).length > 0 &&
        diffParams.filter((p) => p.name !== "options").length > 0
          ? ","
          : "";

      return {
        name: `get${childName}`,
        returnType: childName,
        doc: getDocsFromDescription(child.doc),
        additionalParameters: diffParams.map(
          (p): ParameterShape => ({
            name: p.name,
            type: typeof p.type === "string" ? p.type : String(p.type),
            optional: p.hasQuestionToken === true
          })
        ),
        bodyStatement: `return new ${childName}(${parentArgStr}${parentArgStr ? "," : ""}${diffArgStr}${separator}{ ...this._clientParams.options, ...options });`,
        childClientImportPath: `./${subfolder}/${normalizeName(childName, NameType.File)}.js`,
        childClientImportNames: [childName, `${childName}OptionalParams`]
      };
    });
}

function hasTenantLevelOps(
  client: SdkClientType<SdkServiceOperation>,
  dpgContext: SdkContext
): boolean {
  const methodMap = getMethodHierarchiesMap(dpgContext, client);
  for (const [_, operations] of methodMap) {
    for (const op of operations) {
      if (isTenantLevelOperation(op, client)) {
        return true;
      }
    }
  }
  return false;
}

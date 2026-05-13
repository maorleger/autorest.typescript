// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Data builder for client context files.
 *
 * Transforms TCGC types into a ClientContextDeclaration — a pure data
 * structure with zero ts-morph imports. All naming, type resolution, and
 * conditional decisions happen here.
 *
 * The renderer (render-client-context.ts) takes this data and produces
 * ts-morph output.
 */

import {
  SdkClientType,
  SdkServiceOperation
} from "@azure-tools/typespec-client-generator-core";
import { SdkContext } from "../utils/interfaces.js";
import { isAzurePackage, NameType, normalizeName } from "@azure-tools/rlc-common";
import {
  getClientParameterName,
  getClientParameters,
  getClientParametersDeclaration,
  buildGetClientEndpointParam,
  buildGetClientCredentialParam,
  buildGetClientOptionsParam
} from "../modular/helpers/clientHelpers.js";
import {
  getClassicalClientName,
  getClientName
} from "../modular/helpers/namingHelpers.js";
import { getDocsFromDescription } from "../modular/helpers/docsHelpers.js";
import { getTypeExpression } from "../modular/type-expressions/get-type-expression.js";
import { getModularClientOptions } from "../utils/clientUtils.js";
import { buildEnumTypes, getApiVersionEnum } from "../modular/emitModels.js";
import { ModularEmitterOptions } from "../modular/interfaces.js";
import { resolveReference } from "../framework/reference.js";
import { useDependencies } from "../framework/hooks/useDependencies.js";
import { refkey } from "../framework/refkey.js";
import { reportDiagnostic } from "../lib.js";
import { NoTarget } from "@typespec/compiler";
import { CloudSettingHelpers } from "../modular/static-helpers-metadata.js";
import type {
  ClientContextDeclaration,
  InterfaceShape,
  FunctionShape,
  ParameterShape,
  PropertyShape
} from "./types.js";

/**
 * Build the data for a client context file from TCGC types.
 *
 * Returns a pure data structure — no ts-morph types, no rendering.
 */
export function buildClientContextData(
  dpgContext: SdkContext,
  clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions
): ClientContextDeclaration {
  const dependencies = useDependencies();
  const [hierarchy, client] = clientMap;
  const name = getClientName(client);
  const { subfolder, rlcClientName } = getModularClientOptions(clientMap);
  const srcPath = emitterOptions.modularOptions.sourceRoot;

  // Compute file path
  const filePath = `${srcPath}/${
    subfolder && subfolder !== "" ? subfolder + "/" : ""
  }api/${normalizeName(name, NameType.File)}Context.ts`;

  // Build client interface
  const clientInterface = buildClientInterfaceData(
    dpgContext,
    client,
    rlcClientName,
    dependencies
  );

  // Build options interface
  const optionsInterface = buildOptionsInterfaceData(
    dpgContext,
    client,
    emitterOptions,
    dependencies
  );

  // Build factory function
  const factoryFunction = buildFactoryFunctionData(
    dpgContext,
    client,
    clientMap,
    emitterOptions,
    name,
    rlcClientName,
    hierarchy,
    dependencies
  );

  return {
    filePath,
    clientInterface,
    optionsInterface,
    factoryFunction,
    isAzure: isAzurePackage(emitterOptions),
    hierarchyDepth: hierarchy.length
  };
}

function buildClientInterfaceData(
  dpgContext: SdkContext,
  client: SdkClientType<SdkServiceOperation>,
  rlcClientName: string,
  dependencies: ReturnType<typeof useDependencies>
): InterfaceShape {
  const requiredProps = getClientParameters(client, dpgContext, {
    onClientOnly: false,
    requiredOnly: true
  })
    .filter((p) => {
      const name = getClientParameterName(p);
      return name !== "endpointParam" && name !== "credential";
    })
    .map((p): PropertyShape => ({
      name: getClientParameterName(p),
      type: getTypeExpression(dpgContext, p.type),
      optional: false,
      doc: getDocsWithKnownVersion(dpgContext, p)
    }));

  const requiredNames = new Set(requiredProps.map((p) => p.name));

  const optionalProps = getClientParameters(client, dpgContext, {
    onClientOnly: false,
    optionalOnly: true
  })
    .filter((p) => {
      const name = getClientParameterName(p);
      return (
        name !== "endpointParam" &&
        name !== "credential" &&
        name !== "endpoint" &&
        !requiredNames.has(name)
      );
    })
    .map((p): PropertyShape => ({
      name: getClientParameterName(p),
      type: getTypeExpression(dpgContext, p.type),
      optional: true,
      doc: getDocsWithKnownVersion(dpgContext, p)
    }));

  return {
    name: rlcClientName,
    exported: true,
    extends: [resolveReference(dependencies.Client)],
    properties: [...requiredProps, ...optionalProps],
    doc: getDocsFromDescription(client.doc)
  };
}

function buildOptionsInterfaceData(
  dpgContext: SdkContext,
  client: SdkClientType<SdkServiceOperation>,
  _emitterOptions: ModularEmitterOptions,
  dependencies: ReturnType<typeof useDependencies>
): InterfaceShape {
  const properties: PropertyShape[] = getClientParameters(client, dpgContext, {
    optionalOnly: true
  })
    .filter((p) => getClientParameterName(p) !== "endpoint")
    .map((p): PropertyShape => ({
      name: getClientParameterName(p),
      type:
        p.name.toLowerCase() === "apiversion"
          ? "string"
          : getTypeExpression(dpgContext, p.type),
      optional: true,
      doc: getDocsWithKnownVersion(dpgContext, p)
    }));

  if (dpgContext.arm) {
    properties.push({
      name: "cloudSetting",
      type: `${resolveReference(CloudSettingHelpers.AzureSupportedClouds)}`,
      optional: true,
      doc: ["Specifies the Azure cloud environment for the client."]
    });
  }

  // Check for duplicate options
  const existingNames = new Set<string>();
  for (const prop of properties) {
    if (existingNames.has(prop.name)) {
      reportDiagnostic(dpgContext.program, {
        code: "parameter-name-conflict",
        format: { parameterName: prop.name },
        target: NoTarget
      });
    }
    existingNames.add(prop.name);
  }

  return {
    name: `${getClassicalClientName(client)}OptionalParams`,
    exported: true,
    extends: [resolveReference(dependencies.ClientOptions)],
    properties,
    doc: ["Optional parameters for the client."]
  };
}

/**
 * A minimal StatementedNode-compatible collector that captures addStatements
 * calls without needing ts-morph. Allows reusing existing helpers that
 * expect to mutate a function body.
 */
class StatementCollector {
  readonly statements: string[] = [];
  addStatements(stmts: string | string[] | readonly string[]) {
    if (Array.isArray(stmts)) {
      this.statements.push(...stmts);
    } else {
      this.statements.push(stmts as string);
    }
  }
}

function buildFactoryFunctionData(
  dpgContext: SdkContext,
  client: SdkClientType<SdkServiceOperation>,
  _clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions,
  name: string,
  rlcClientName: string,
  _hierarchy: string[],
  dependencies: ReturnType<typeof useDependencies>
): FunctionShape {
  const params: ParameterShape[] = getClientParametersDeclaration(
    client,
    dpgContext,
    {
      onClientOnly: false,
      requiredOnly: true
    }
  ).map((p) => ({
    name: p.name,
    type: typeof p.type === "string" ? p.type : String(p.type),
    optional: p.hasQuestionToken === true,
    defaultValue: p.initializer as string | undefined
  }));

  // Use a StatementCollector to capture what the existing helpers produce
  // without needing a real ts-morph function node
  const collector = new StatementCollector();

  // Endpoint param — uses the real helper, captures its statement output
  const { endpointParamName: endpointParam, assignedOptionalParams } =
    buildGetClientEndpointParam(collector as any, dpgContext, client);
  const credentialParam = buildGetClientCredentialParam(client, emitterOptions);

  // API version param
  const apiVersionParam = getClientParameters(client, dpgContext).find(
    (x) => x.isApiVersionParam
  );
  const apiVersionParamName = apiVersionParam
    ? getClientParameterName(apiVersionParam)
    : undefined;

  // Options param — uses the real helper
  const optionsParam = buildGetClientOptionsParam(
    collector as any,
    emitterOptions,
    endpointParam,
    apiVersionParamName
  );

  // Now add the getClient call
  collector.addStatements(
    `const clientContext = ${resolveReference(dependencies.getClient)}(${endpointParam}, ${credentialParam}, ${optionsParam});`
  );

  // Custom auth header
  const { customHttpAuthHeaderName, customHttpAuthSharedKeyPrefix } =
    emitterOptions.options;
  if (customHttpAuthHeaderName && customHttpAuthSharedKeyPrefix) {
    collector.addStatements(`
      if(${resolveReference(dependencies.isKeyCredential)}(credential)) {
        clientContext.pipeline.addPolicy({ 
          name: "customKeyCredentialPolicy",
          sendRequest(request, next) {
            request.headers.set("${customHttpAuthHeaderName}", "${customHttpAuthSharedKeyPrefix} " + credential.key);
            return next(request);
          }
        });
      }`);
  }

  // API version statement
  buildApiVersionStatement(
    dpgContext,
    client,
    emitterOptions,
    apiVersionParam,
    apiVersionParamName,
    collector.statements
  );

  // Return statement
  const requiredParams = getClientParametersDeclaration(client, dpgContext, {
    onClientOnly: false,
    requiredOnly: true,
    apiVersionAsRequired: true
  });
  const contextRequiredParam = requiredParams.filter(
    (p) =>
      p.name !== "endpointParam" &&
      p.name !== "credential" &&
      p.name !== "options"
  );
  const requiredParamNames = new Set(contextRequiredParam.map((p) => p.name));

  const contextOptionalParams = getClientParameters(client, dpgContext, {
    optionalOnly: true,
    onClientOnly: false
  }).filter((p) => {
    const pName = getClientParameterName(p);
    return (
      pName !== "endpointParam" &&
      pName !== "credential" &&
      pName !== "endpoint" &&
      !requiredParamNames.has(pName)
    );
  });

  const allContextParams = [
    ...contextRequiredParam.map((p) => p.name),
    ...contextOptionalParams.map((p) => {
      const pName = getClientParameterName(p);
      if (
        requiredParamNames.has(pName) ||
        (assignedOptionalParams && assignedOptionalParams.has(pName))
      ) {
        return pName;
      }
      return `${pName}: options.${pName}`;
    })
  ];

  if (allContextParams.length) {
    collector.addStatements(
      `return { ...clientContext, ${allContextParams.join(", ")}} as ${rlcClientName};`
    );
  } else {
    collector.addStatements(`return clientContext;`);
  }

  return {
    name: `create${name}`,
    exported: true,
    parameters: params,
    returnType: rlcClientName,
    doc: getDocsFromDescription(client.doc),
    bodyStatements: collector.statements
  };
}

function buildApiVersionStatement(
  dpgContext: SdkContext,
  client: SdkClientType<SdkServiceOperation>,
  emitterOptions: ModularEmitterOptions,
  apiVersionParam: any,
  apiVersionParamName: string | undefined,
  bodyStatements: string[]
): void {
  const endpointParameter = getClientParameters(client, dpgContext, {
    onClientOnly: false,
    requiredOnly: true,
    skipEndpointTemplate: true
  }).find((x) => x.kind === "endpoint");

  if (apiVersionParam) {
    const templateArguments =
      endpointParameter && endpointParameter.type.kind === "endpoint"
        ? endpointParameter.type.templateArguments
        : endpointParameter && endpointParameter.type.kind === "union"
          ? endpointParameter.type.variantTypes[0]?.templateArguments
          : [];
    const apiVersionInEndpoint =
      templateArguments && templateArguments.find((p: any) => p.isApiVersionParam);
    if (!apiVersionInEndpoint && apiVersionParam.clientDefaultValue) {
      bodyStatements.push(
        `const ${apiVersionParamName} = options.${apiVersionParamName};`
      );
    }
  } else if (isAzurePackage(emitterOptions)) {
    bodyStatements.push(`
        if (options.apiVersion) {
          logger.warning("This client does not support client api-version, please change it at the operation level");
        }`);
  } else {
    bodyStatements.push(`
        if (options.apiVersion) {
          console.warn("This client does not support client api-version, please change it at the operation level");
        }`);
  }
}

function getDocsWithKnownVersion(dpgContext: SdkContext, param: any) {
  const docs = getDocsFromDescription(param.doc);
  if (param.name.toLowerCase() !== "apiversion") {
    return docs;
  }
  const apiVersionEnum = getApiVersionEnum(dpgContext);
  if (apiVersionEnum) {
    const [_, knownValuesEnum] = buildEnumTypes(
      dpgContext,
      apiVersionEnum,
      true
    );
    docs.push(
      `Known values of {@link ${resolveReference(refkey(knownValuesEnum.name, "knownValues"))}} that the service accepts.`
    );
  }
  return docs;
}

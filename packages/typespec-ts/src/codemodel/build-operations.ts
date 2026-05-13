// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Data builder for operation files.
 *
 * Transforms TCGC types into OperationFileDeclaration[] — pure data
 * structures with zero ts-morph imports.
 */

import {
  SdkClientType,
  SdkServiceOperation
} from "@azure-tools/typespec-client-generator-core";
import { SdkContext } from "../utils/interfaces.js";
import { NameType, normalizeName } from "@azure-tools/rlc-common";
import {
  getOperationFunction,
  getSendPrivateFunction,
  getDeserializePrivateFunction
} from "../modular/helpers/operationHelpers.js";
import { getOperationName } from "../modular/helpers/namingHelpers.js";
import {
  getModularClientOptions,
  isRLCMultiEndpoint
} from "../utils/clientUtils.js";
import { getMethodHierarchiesMap } from "../utils/operationUtil.js";
import { ModularEmitterOptions } from "../modular/interfaces.js";
import type {
  OperationFileDeclaration,
  OperationDeclaration,
  ParameterShape,
  FunctionShape
} from "./types.js";

export function buildOperationFilesData(
  dpgContext: SdkContext,
  clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions
): OperationFileDeclaration[] {
  const [_, client] = clientMap;
  const { subfolder, rlcClientName } = getModularClientOptions(clientMap);
  const isMultiEndpoint = isRLCMultiEndpoint(dpgContext);
  const clientType = isMultiEndpoint ? `Client.${rlcClientName}` : "Client";
  const srcPath = emitterOptions.modularOptions.sourceRoot;

  const methodMap = getMethodHierarchiesMap(dpgContext, client);
  const files: OperationFileDeclaration[] = [];

  for (const [prefixKey, operations] of methodMap) {
    const prefixes = prefixKey.split("/");

    // Compute file name
    const operationFileName =
      prefixes.length > 0 && prefixKey !== ""
        ? `${prefixes.map((h) => normalizeName(h, NameType.File)).join("/")}/operations`
        : "operations";

    const filePath = `${srcPath}/${
      subfolder && subfolder !== "" ? subfolder + "/" : ""
    }api/${operationFileName}.ts`;

    // Compute client import
    const indexPathPrefix =
      "../".repeat(prefixKey === "" ? 0 : prefixes.length) || "./";
    const clientImportAlias = `${rlcClientName} as Client`;
    const clientImportPath = `${indexPathPrefix}index.js`;

    // Build operation declarations
    const opDeclarations: OperationDeclaration[] = operations.map((op) => {
      const operationDeclaration = getOperationFunction(
        dpgContext,
        [prefixes, op],
        clientType
      );
      const sendDeclaration = getSendPrivateFunction(
        dpgContext,
        [prefixes, op],
        clientType,
        client
      );
      const deserializeDeclaration = getDeserializePrivateFunction(
        dpgContext,
        [prefixes, op]
      );

      const opName = operationDeclaration.propertyName ?? operationDeclaration.name ?? "FIXME";
      const displayName = String(getOperationName(op));

      // Build main function shape
      const params: ParameterShape[] = (operationDeclaration.parameters ?? []).map(
        (p) => ({
          name: p.name,
          type: typeof p.type === "string" ? p.type : String(p.type),
          optional: p.hasQuestionToken === true
        })
      );

      const mainFunction: FunctionShape = {
        name: opName,
        exported: true,
        parameters: params,
        returnType: typeof operationDeclaration.returnType === "string"
          ? operationDeclaration.returnType
          : String(operationDeclaration.returnType ?? "void"),
        doc: operationDeclaration.docs as string[] | undefined,
        bodyStatements: operationDeclaration.statements
          ? [typeof operationDeclaration.statements === "string"
              ? operationDeclaration.statements
              : String(operationDeclaration.statements)]
          : []
      };

      return {
        name: opName,
        displayName,
        doc: operationDeclaration.docs as string[] | undefined,
        mainFunction,
        sendFunctionName: sendDeclaration.name ?? `_${opName}Send`,
        deserializeFunctionName: deserializeDeclaration.name ?? `_${opName}Deserialize`,
        isLro: operationDeclaration.isLro === true,
        isPaging: false,
        isLroPaging: operationDeclaration.isLroPaging === true
      };
    });

    files.push({
      filePath,
      groupPrefix: prefixKey,
      operations: opDeclarations,
      clientImportAlias,
      clientImportPath
    });
  }

  return files;
}

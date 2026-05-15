// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from "path";

import { NameType, normalizeName } from "@azure-tools/rlc-common";
import type { Project, SourceFile } from "ts-morph";
import type {
  SdkClientType,
  SdkServiceOperation
} from "@azure-tools/typespec-client-generator-core";
import {
  buildOperationOptions,
  buildLroDeserDetailMap
} from "../modular/buildOperations.js";
import {
  getDeserializeExceptionHeadersPrivateFunction,
  getDeserializeHeadersPrivateFunction,
  getDeserializePrivateFunction,
  getOperationFunction,
  getSendPrivateFunction
} from "../modular/helpers/operationHelpers.js";
import type { ModularEmitterOptions } from "../modular/interfaces.js";
import { useContext } from "../contextManager.js";
import { addDeclaration } from "../framework/declaration.js";
import { refkey } from "../framework/refkey.js";
import {
  getModularClientOptions,
  isRLCMultiEndpoint
} from "../utils/clientUtils.js";
import type { SdkContext } from "../utils/interfaces.js";
import { getMethodHierarchiesMap } from "../utils/operationUtil.js";

/**
 * This function creates a file under /api for each operation group.
 * If there is no operation group in the TypeSpec program, we create a single
 * file called operations.ts where all operations are generated.
 */
export function emitOperationFiles(
  project: Project,
  dpgContext: SdkContext,
  clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions
): SourceFile[] {
  const [, client] = clientMap;
  const operationFiles: Set<SourceFile> = new Set();
  const { subfolder, rlcClientName } = getModularClientOptions(clientMap);
  const isMultiEndpoint = isRLCMultiEndpoint(dpgContext);
  const clientType = isMultiEndpoint ? `Client.${rlcClientName}` : "Client";
  const methodMap = getMethodHierarchiesMap(dpgContext, client);

  for (const [prefixKey, operations] of methodMap) {
    const prefixes = prefixKey.split("/");
    const operationFileName =
      prefixes.length > 0 && prefixKey !== ""
        ? `${prefixes
            .map((hierarchy) => normalizeName(hierarchy, NameType.File))
            .join("/")}/operations`
        : "operations";

    const srcPath = emitterOptions.modularOptions.sourceRoot;
    const filepath = `${srcPath}/${
      subfolder && subfolder !== "" ? subfolder + "/" : ""
    }api/${operationFileName}.ts`;

    const operationGroupFile = project.createSourceFile(filepath);
    operations.forEach((op) => {
      const operationDeclaration = getOperationFunction(
        dpgContext,
        [prefixes, op],
        clientType
      );
      const sendOperationDeclaration = getSendPrivateFunction(
        dpgContext,
        [prefixes, op],
        clientType,
        client
      );
      const deserializeOperationDeclaration = getDeserializePrivateFunction(
        dpgContext,
        [prefixes, op]
      );
      const deserializeHeadersDeclaration =
        getDeserializeHeadersPrivateFunction(dpgContext, op);
      const deserializeExceptionHeadersDeclaration =
        getDeserializeExceptionHeadersPrivateFunction(dpgContext, op);
      const functionsToAdd = [
        sendOperationDeclaration,
        deserializeOperationDeclaration
      ];

      if (deserializeHeadersDeclaration) {
        functionsToAdd.push(deserializeHeadersDeclaration);
      }
      if (deserializeExceptionHeadersDeclaration) {
        functionsToAdd.push(deserializeExceptionHeadersDeclaration);
      }

      operationGroupFile.addFunctions(functionsToAdd);
      addDeclaration(
        operationGroupFile,
        operationDeclaration,
        refkey(op, "api")
      );
    });

    const indexPathPrefix =
      "../".repeat(prefixKey === "" ? 0 : prefixes.length) || "./";
    operationGroupFile.addImportDeclaration({
      namedImports: [`${rlcClientName} as Client`],
      moduleSpecifier: `${indexPathPrefix}index.js`
    });
    operationGroupFile.fixUnusedIdentifiers();

    operationFiles.add(operationGroupFile);
  }

  return Array.from(operationFiles);
}

export function emitApiOptions(
  dpgContext: SdkContext,
  clientMap: [string[], SdkClientType<SdkServiceOperation>],
  emitterOptions: ModularEmitterOptions
): void {
  const project = useContext("outputProject");
  const [, client] = clientMap;
  const { subfolder } = getModularClientOptions(clientMap);
  const methodMap = getMethodHierarchiesMap(dpgContext, client);

  for (const [prefixKey, operations] of methodMap) {
    const prefixes = prefixKey.split("/");
    const modelOptionsFile = project.createSourceFile(
      path.join(
        emitterOptions.modularOptions.sourceRoot,
        subfolder ?? "",
        "api",
        ...prefixes.map((p) => normalizeName(p, NameType.File)),
        "options.ts"
      ),
      undefined,
      {
        overwrite: true
      }
    );

    operations.forEach((operation) => {
      buildOperationOptions(
        dpgContext,
        [prefixes, operation],
        modelOptionsFile
      );
    });

    modelOptionsFile
      .getImportDeclarations()
      .filter((importDeclaration) => {
        return (
          importDeclaration.isModuleSpecifierRelative() &&
          !importDeclaration.getModuleSpecifierValue().endsWith(".js")
        );
      })
      .forEach((importDeclaration) => {
        importDeclaration.setModuleSpecifier(
          importDeclaration.getModuleSpecifierValue() + ".js"
        );
      });
  }
}

export { buildLroDeserDetailMap };

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  SdkClient,
  SdkContext,
  listOperationGroups,
  listOperationsInOperationGroup,
  SdkOperationGroup
} from "@azure-tools/typespec-client-generator-core";
import {
  ResponseHeaderSchema,
  ImportKind,
  OperationResponse,
  ResponseMetadata,
  Schema,
  SchemaContext
} from "@azure-tools/rlc-common";
import { Program, getDoc, ignoreDiagnostics } from "@typespec/compiler";
import {
  getHttpOperation,
  HttpOperation,
  HttpOperationResponse
} from "@typespec/http";
import {
  getImportedModelName,
  getTypeName,
  getSchemaForType,
  getBinaryType
} from "../modelUtils.js";
import {
  getOperationGroupName,
  getOperationStatuscode,
  isBinaryPayload
} from "../operationUtil.js";

export function transformToResponseTypes(
  program: Program,
  importDetails: Map<ImportKind, Set<string>>,
  client: SdkClient,
  dpgContext: SdkContext
): OperationResponse[] {
  const operationGroups = listOperationGroups(dpgContext, client);
  const rlcResponses: OperationResponse[] = [];
  const inputImportedSet = new Set<string>();
  for (const operationGroup of operationGroups) {
    const operations = listOperationsInOperationGroup(
      dpgContext,
      operationGroup
    );
    for (const op of operations) {
      const route = ignoreDiagnostics(getHttpOperation(program, op));
      transformToResponseTypesForRoute(route, operationGroup);
    }
  }
  const clientOperations = listOperationsInOperationGroup(dpgContext, client);
  for (const clientOp of clientOperations) {
    const route = ignoreDiagnostics(getHttpOperation(program, clientOp));
    transformToResponseTypesForRoute(route);
  }
  if (inputImportedSet.size > 0) {
    importDetails.set(ImportKind.ResponseOutput, inputImportedSet);
  }
  function transformToResponseTypesForRoute(
    route: HttpOperation,
    operationGroup?: SdkOperationGroup
  ) {
    const rlcOperationUnit: OperationResponse = {
      operationGroup: getOperationGroupName(operationGroup),
      operationName: route.operation.name,
      responses: []
    };
    for (const resp of route.responses) {
      const statusCode = getOperationStatuscode(resp);
      const rlcResponseUnit: ResponseMetadata = {
        statusCode,
        description: resp.description
      };
      // transform header
      const headers = transformHeaders(program, resp);
      // transform body
      const body = transformBody(program, resp, inputImportedSet);
      rlcOperationUnit.responses.push({
        ...rlcResponseUnit,
        headers,
        body
      });
    }
    rlcResponses.push(rlcOperationUnit);
  }
  return rlcResponses;
}

/**
 * Return undefined if no valid header param
 * @param program the cadl program
 * @param response response detail
 * @returns rlc header shcema
 */
function transformHeaders(
  program: Program,
  response: HttpOperationResponse
): ResponseHeaderSchema[] | undefined {
  if (!response.responses.length) {
    return;
  }

  const rlcHeaders = [];
  // Current RLC client can't represent different headers per content type.
  // So we merge headers here, and report any duplicates.
  // It may be possible in principle to not error for identically declared
  // headers.
  for (const data of response.responses) {
    const headers = data?.headers;
    if (!headers || !Object.keys(headers).length) {
      continue;
    }

    for (const [key, value] of Object.entries(headers)) {
      if (!value) {
        continue;
      }
      const typeSchema = getSchemaForType(program, value!.type, [
        SchemaContext.Output
      ]) as Schema;
      const type = getTypeName(typeSchema);
      const header: ResponseHeaderSchema = {
        name: `"${key.toLowerCase()}"`,
        type,
        required: !value?.optional,
        description: getDoc(program, value!)
      };
      rlcHeaders.push(header);
    }
  }

  return rlcHeaders.length ? rlcHeaders : undefined;
}

function transformBody(
  program: Program,
  response: HttpOperationResponse,
  importedModels: Set<string>
) {
  if (!response.responses.length) {
    return;
  }
  // Currently RLC reponse only have one header and body defined
  // So we'll union all body shapes together with "|"
  const typeSet = new Set<string>();
  const descriptions = new Set<string>();
  let fromCore = false;
  for (const data of response.responses) {
    const body = data?.body;
    if (!body) {
      continue;
    }
    const hasBinaryContent = body.contentTypes.some((contentType) =>
      isBinaryPayload(body.type, contentType)
    );
    if (hasBinaryContent) {
      typeSet.add(getBinaryType([SchemaContext.Output]));
      descriptions.add("Value may contain any sequence of octets");
      continue;
    }
    const bodySchema = getSchemaForType(program, body!.type, [
      SchemaContext.Output
    ]) as Schema;
    if (bodySchema.fromCore) {
      fromCore = true;
    }
    const bodyType = getTypeName(bodySchema);
    const importedNames = getImportedModelName(bodySchema);
    if (importedNames) {
      importedNames.forEach(importedModels.add, importedModels);
    }
    typeSet.add(bodyType);
  }

  if (!typeSet.size) {
    return;
  }

  return {
    name: "body",
    type: [...typeSet].join("|"),
    description: [...descriptions].join("\n\n"),
    fromCore
  };
}
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type {
  MetadataRolesList200Response,
  MetadataRolesListDefaultResponse,
  MetadataPolicyListAll200Response,
  MetadataPolicyListAllDefaultResponse,
  MetadataPolicyUpdate200Response,
  MetadataPolicyUpdateDefaultResponse,
  MetadataPolicyGet200Response,
  MetadataPolicyGetDefaultResponse,
} from "./responses.js";

const responseMap: Record<string, string[]> = {
  "GET /metadataRoles": ["200"],
  "GET /metadataPolicies": ["200"],
  "PUT /metadataPolicies/{policyId}": ["200"],
  "GET /metadataPolicies/{policyId}": ["200"],
};

export function isUnexpected(
  response: MetadataRolesList200Response | MetadataRolesListDefaultResponse,
): response is MetadataRolesListDefaultResponse;
export function isUnexpected(
  response:
    | MetadataPolicyListAll200Response
    | MetadataPolicyListAllDefaultResponse,
): response is MetadataPolicyListAllDefaultResponse;
export function isUnexpected(
  response:
    | MetadataPolicyUpdate200Response
    | MetadataPolicyUpdateDefaultResponse,
): response is MetadataPolicyUpdateDefaultResponse;
export function isUnexpected(
  response: MetadataPolicyGet200Response | MetadataPolicyGetDefaultResponse,
): response is MetadataPolicyGetDefaultResponse;
export function isUnexpected(
  response:
    | MetadataRolesList200Response
    | MetadataRolesListDefaultResponse
    | MetadataPolicyListAll200Response
    | MetadataPolicyListAllDefaultResponse
    | MetadataPolicyUpdate200Response
    | MetadataPolicyUpdateDefaultResponse
    | MetadataPolicyGet200Response
    | MetadataPolicyGetDefaultResponse,
): response is
  | MetadataRolesListDefaultResponse
  | MetadataPolicyListAllDefaultResponse
  | MetadataPolicyUpdateDefaultResponse
  | MetadataPolicyGetDefaultResponse {
  const lroOriginal = response.headers["x-ms-original-url"];
  const url = new URL(lroOriginal ?? response.request.url);
  const method = response.request.method;
  let pathDetails = responseMap[`${method} ${url.pathname}`];
  if (!pathDetails) {
    pathDetails = getParametrizedPathSuccess(method, url.pathname);
  }
  return !pathDetails.includes(response.status);
}

function getParametrizedPathSuccess(method: string, path: string): string[] {
  const pathParts = path.split("/");

  // Traverse list to match the longest candidate
  // matchedLen: the length of candidate path
  // matchedValue: the matched status code array
  let matchedLen = -1,
    matchedValue: string[] = [];

  // Iterate the responseMap to find a match
  for (const [key, value] of Object.entries(responseMap)) {
    // Extracting the path from the map key which is in format
    // GET /path/foo
    if (!key.startsWith(method)) {
      continue;
    }
    const candidatePath = getPathFromMapKey(key);
    // Get each part of the url path
    const candidateParts = candidatePath.split("/");

    // track if we have found a match to return the values found.
    let found = true;
    for (
      let i = candidateParts.length - 1, j = pathParts.length - 1;
      i >= 1 && j >= 1;
      i--, j--
    ) {
      if (
        candidateParts[i]?.startsWith("{") &&
        candidateParts[i]?.indexOf("}") !== -1
      ) {
        const start = candidateParts[i]!.indexOf("}") + 1,
          end = candidateParts[i]?.length;
        // If the current part of the candidate is a "template" part
        // Try to use the suffix of pattern to match the path
        // {guid} ==> $
        // {guid}:export ==> :export$
        const isMatched = new RegExp(
          `${candidateParts[i]?.slice(start, end)}`,
        ).test(pathParts[j] || "");

        if (!isMatched) {
          found = false;
          break;
        }
        continue;
      }

      // If the candidate part is not a template and
      // the parts don't match mark the candidate as not found
      // to move on with the next candidate path.
      if (candidateParts[i] !== pathParts[j]) {
        found = false;
        break;
      }
    }

    // We finished evaluating the current candidate parts
    // Update the matched value if and only if we found the longer pattern
    if (found && candidatePath.length > matchedLen) {
      matchedLen = candidatePath.length;
      matchedValue = value;
    }
  }

  return matchedValue;
}

function getPathFromMapKey(mapKey: string): string {
  const pathStart = mapKey.indexOf("/");
  return mapKey.slice(pathStart);
}

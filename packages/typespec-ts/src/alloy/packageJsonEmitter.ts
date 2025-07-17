// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";
import { generatePackageJsonWithAlloy } from "./PackageJsonComponent.js";

export interface PackageFileOptions {
  exports?: Record<string, any>;
  dependencies?: Record<string, string>;
  clientContextPaths?: string[];
}

/**
 * Builds a package.json file using Alloy components
 * This is an alternative to the traditional buildPackageFile function
 */
export function buildPackageFileWithAlloy(
  model: RLCModel,
  options: PackageFileOptions = {}
): { path: string; content: string } | undefined {
  try {
    const result = generatePackageJsonWithAlloy(model, options);
    return result;
  } catch (error) {
    console.error("Error generating package.json with Alloy:", error);
    return undefined;
  }
}

/**
 * Feature flag to enable/disable Alloy-based package.json generation
 */
export function shouldUseAlloyPackageJson(model: RLCModel): boolean {
  // Check for explicit flag in options
  if (model.options?.useAlloyPackageJson !== undefined) {
    return model.options.useAlloyPackageJson;
  }
  
  // Check for environment variable
  if (process.env["TYPESPEC_USE_ALLOY_PACKAGE_JSON"] === "true") {
    return true;
  }
  
  // Default to false for now (opt-in)
  return false;
}
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";

/**
 * Determines if Alloy-based code generation should be used for TypeScript classes
 * @param model - The RLC model containing options
 * @returns true if Alloy code generation should be used, false otherwise
 */
export function shouldUseAlloyCodeGeneration(model: RLCModel): boolean {
  // Check model options first
  if (model.options?.useAlloyCodeGeneration !== undefined) {
    return model.options.useAlloyCodeGeneration;
  }
  
  // Check environment variable
  if (process.env["TYPESPEC_USE_ALLOY_CODE_GENERATION"] === "true") {
    return true;
  }
  
  // Default to false (traditional ts-morph approach)
  return false;
}

/**
 * Determines if Alloy-based client class generation should be used
 * @param model - The RLC model containing options
 * @returns true if Alloy client class generation should be used, false otherwise
 */
export function shouldUseAlloyClientClass(model: RLCModel): boolean {
  return shouldUseAlloyCodeGeneration(model);
}

/**
 * Determines if Alloy-based client interface generation should be used
 * @param model - The RLC model containing options
 * @returns true if Alloy client interface generation should be used, false otherwise
 */
export function shouldUseAlloyClientInterface(model: RLCModel): boolean {
  return shouldUseAlloyCodeGeneration(model);
}

/**
 * Determines if Alloy-based operation function generation should be used
 * @param model - The RLC model containing options
 * @returns true if Alloy operation function generation should be used, false otherwise
 */
export function shouldUseAlloyOperationFunction(model: RLCModel): boolean {
  return shouldUseAlloyCodeGeneration(model);
}

/**
 * Gets the feature flag status for debugging purposes
 * @param model - The RLC model containing options
 * @returns object containing all feature flag statuses
 */
export function getAlloyFeatureFlagStatus(model: RLCModel) {
  return {
    packageJson: model.options?.useAlloyPackageJson ?? false,
    codeGeneration: shouldUseAlloyCodeGeneration(model),
    clientClass: shouldUseAlloyClientClass(model),
    clientInterface: shouldUseAlloyClientInterface(model),
    operationFunction: shouldUseAlloyOperationFunction(model),
    environmentVariable: process.env["TYPESPEC_USE_ALLOY_CODE_GENERATION"] === "true"
  };
}
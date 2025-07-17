// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Demonstration of Alloy-based code generation for TypeScript clients
 * This file showcases the three main components we've implemented:
 * 1. ClientInterface - Generates client interface definitions
 * 2. ClientClass - Generates client class implementations
 * 3. OperationFunction - Generates operation functions with LRO and paging support
 */

import { demoAlloyPackageJson } from "./packageJsonEmitter.js";
import { demoAlloyClientInterface } from "./clientDefinitionsEmitter.js";
import { demoAlloyClientClass } from "./classicalClientEmitter.js";
import {
  demoAlloyOperationFunction,
  demoAlloyLroOperationFunction,
  demoAlloyPagingOperationFunction
} from "./operationEmitter.js";

/**
 * Generates a complete demonstration of all Alloy components
 * @param clientName - The name of the client to generate
 * @returns Object containing all generated code samples
 */
export function generateAlloyDemo(clientName: string = "UserManagement"): AlloyDemoResult {
  console.log(`🚀 Generating Alloy demo for ${clientName}...`);
  
  const packageJson = demoAlloyPackageJson();
  const clientInterface = demoAlloyClientInterface(clientName);
  const clientClass = demoAlloyClientClass(clientName);
  const operationFunction = demoAlloyOperationFunction("getUser");
  const lroOperationFunction = demoAlloyLroOperationFunction("createUser");
  const pagingOperationFunction = demoAlloyPagingOperationFunction("listUsers");

  return {
    packageJson,
    clientInterface,
    clientClass,
    operationFunction,
    lroOperationFunction,
    pagingOperationFunction
  };
}

/**
 * Result interface for the Alloy demo
 */
export interface AlloyDemoResult {
  packageJson: string;
  clientInterface: string;
  clientClass: string;
  operationFunction: string;
  lroOperationFunction: string;
  pagingOperationFunction: string;
}

/**
 * Prints the Alloy demo results to the console
 * @param result - The demo result to print
 */
export function printAlloyDemo(result: AlloyDemoResult): void {
  console.log("📦 Package.json (Alloy):");
  console.log("=" + "=".repeat(50));
  console.log(result.packageJson);
  console.log();

  console.log("🔧 Client Interface (Alloy):");
  console.log("=" + "=".repeat(50));
  console.log(result.clientInterface);
  console.log();

  console.log("🏗️ Client Class (Alloy):");
  console.log("=" + "=".repeat(50));
  console.log(result.clientClass);
  console.log();

  console.log("⚡ Operation Function (Alloy):");
  console.log("=" + "=".repeat(50));
  console.log(result.operationFunction);
  console.log();

  console.log("🔄 LRO Operation Function (Alloy):");
  console.log("=" + "=".repeat(50));
  console.log(result.lroOperationFunction);
  console.log();

  console.log("📄 Paging Operation Function (Alloy):");
  console.log("=" + "=".repeat(50));
  console.log(result.pagingOperationFunction);
  console.log();
}

/**
 * Runs the complete Alloy demo
 * @param clientName - The name of the client to generate
 */
export function runAlloyDemo(clientName: string = "UserManagement"): void {
  const result = generateAlloyDemo(clientName);
  printAlloyDemo(result);
  
  console.log("✅ Alloy demo completed successfully!");
  console.log("🎯 This demonstrates Alloy-based code generation for:");
  console.log("   • Package.json generation");
  console.log("   • Client interface definitions");
  console.log("   • Client class implementations");
  console.log("   • Operation functions (regular, LRO, paging)");
  console.log();
  console.log("🚀 To enable these features, use the feature flags:");
  console.log("   • useAlloyPackageJson: true");
  console.log("   • useAlloyCodeGeneration: true");
  console.log("   • TYPESPEC_USE_ALLOY_CODE_GENERATION=true");
}
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Demo script to show Alloy-based package.json generation
 * This is for demonstration purposes only
 */

import { buildPackageFileWithAlloy } from "./packageJsonEmitter.js";

// Create a simple mock model for demonstration
const demoModel = {
  libraryName: "DemoClient",
  srcPath: "src",
  paths: {},
  schemas: [],
  importInfo: {
    internalImports: {} as any,
    runtimeImports: {} as any
  },
  options: {
    packageDetails: {
      name: "@azure-rest/demo-client",
      version: "1.0.0-beta.1",
      description: "Demo client generated with Alloy components"
    },
    moduleKind: "esm" as const,
    generateTest: true,
    generateSample: true,
    azureSdkForJs: true,
    useAlloyPackageJson: true
  }
} as any;

// Demo options
const demoOptions = {
  exports: {
    ".": "./dist/index.js",
    "./models": "./dist/models/index.js"
  },
  dependencies: {
    "custom-package": "^1.0.0"
  },
  clientContextPaths: ["src/client.ts", "src/models/index.ts"]
};

export function runDemo() {
  console.log("=== Alloy Package.json Generation Demo ===");
  
  try {
    const result = buildPackageFileWithAlloy(demoModel, demoOptions);
    
    if (result) {
      console.log("\n✅ Successfully generated package.json with Alloy!");
      console.log("📄 File path:", result.path);
      console.log("📦 Content preview:");
      console.log(result.content);
    } else {
      console.log("❌ Failed to generate package.json");
    }
  } catch (error) {
    console.error("❌ Error running demo:", error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo();
}
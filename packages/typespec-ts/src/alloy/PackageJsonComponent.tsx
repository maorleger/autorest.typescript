// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { code } from "@alloy-js/core";
import { RLCModel } from "@azure-tools/rlc-common";

export interface PackageJsonProps {
  model: RLCModel;
  exports?: Record<string, any>;
  dependencies?: Record<string, string>;
  clientContextPaths?: string[];
}

export interface PackageJsonMetadata {
  name: string;
  version: string;
  description: string;
  engines: {
    node: string;
  };
  sideEffects: boolean;
  autoPublish: boolean;
}

export interface PackageJsonScripts {
  [key: string]: string;
}

export interface PackageJsonDependencies {
  [key: string]: string;
}

export function PackageJsonComponent(props: PackageJsonProps) {
  const { model, exports, dependencies, clientContextPaths } = props;
  
  const metadata = getPackageMetadata(model);
  const packageDependencies = getPackageDependencies(model, dependencies);
  const devDependencies = getPackageDevDependencies(model);
  const scripts = getPackageScripts(model);
  const config = getPackageConfig(model, clientContextPaths);
  
  const packageJson = {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
    engines: metadata.engines,
    sideEffects: metadata.sideEffects,
    autoPublish: metadata.autoPublish,
    ...(exports && { exports }),
    dependencies: packageDependencies,
    devDependencies: devDependencies,
    scripts: scripts,
    ...config
  };
  
  return code`${JSON.stringify(packageJson, null, 2)}`;
}

// Helper functions to extract package.json data from RLCModel
function getPackageMetadata(model: RLCModel): PackageJsonMetadata {
  return {
    name: model.options?.packageDetails?.name ?? model.libraryName,
    version: model.options?.packageDetails?.version ?? "1.0.0-beta.1",
    description: model.options?.packageDetails?.description ?? `A generated SDK for ${model.libraryName}.`,
    engines: {
      node: ">=20.0.0"
    },
    sideEffects: false,
    autoPublish: false
  };
}

function getPackageDependencies(
  model: RLCModel, 
  customDependencies?: Record<string, string>
): PackageJsonDependencies {
  const baseDependencies = {
    "tslib": "^2.6.2"
  };
  
  // Add Azure-specific dependencies if this is an Azure package
  if (isAzurePackage(model)) {
    return {
      ...baseDependencies,
      "@azure-rest/core-client": "^2.3.1",
      "@azure/core-auth": "^1.9.0",
      "@azure/core-rest-pipeline": "^1.20.0",
      "@azure/core-util": "^1.12.0",
      "@azure/logger": "^1.2.0",
      ...(hasLroOperations(model) && {
        "@azure/core-lro": "^3.1.0",
        "@azure/abort-controller": "^2.1.2"
      }),
      ...customDependencies
    };
  }
  
  return {
    ...baseDependencies,
    "@typespec/ts-http-runtime": "0.1.0",
    ...customDependencies
  };
}

function getPackageDevDependencies(model: RLCModel): PackageJsonDependencies {
  const baseDependencies = {
    "@types/node": "^20.0.0",
    "eslint": "^9.9.0",
    "typescript": "~5.8.2"
  };
  
  if (model.options?.generateTest) {
    return {
      ...baseDependencies,
      "@vitest/browser": "^3.0.9",
      "@vitest/coverage-istanbul": "^3.0.9",
      "vitest": "^3.0.9",
      "playwright": "^1.52.0"
    };
  }
  
  return baseDependencies;
}

function getPackageScripts(model: RLCModel): PackageJsonScripts {
  const baseScripts = {
    "clean": "rimraf --glob dist dist-browser dist-esm test-dist temp types *.tgz *.log",
    "extract-api": "rimraf review && mkdirp ./review && api-extractor run --local",
    "pack": "npm pack 2>&1",
    "lint": "eslint package.json api-extractor.json src",
    "lint:fix": "eslint package.json api-extractor.json src --fix --fix-type [problem,suggestion]"
  };
  
  const moduleScripts = model.options?.moduleKind === "esm" 
    ? { "build": "npm run clean && tshy && npm run extract-api" }
    : { "build": "npm run clean && tsc && npm run extract-api" };
  
  return {
    ...baseScripts,
    ...moduleScripts
  };
}

function getPackageConfig(
  model: RLCModel, 
  clientContextPaths?: string[]
): Record<string, any> {
  const config: Record<string, any> = {};
  
  if (isAzurePackage(model)) {
    config["sdk-type"] = model.options?.azureArm ? "mgmt" : "client";
    config["repository"] = "github:Azure/azure-sdk-for-js";
    config["bugs"] = {
      "url": "https://github.com/Azure/azure-sdk-for-js/issues"
    };
    
    if (clientContextPaths && clientContextPaths.length > 0) {
      config["//metadata"] = {
        "constantPaths": clientContextPaths.map(path => ({
          "path": path,
          "prefix": "userAgentInfo"
        }))
      };
    }
  }
  
  return config;
}

// Helper functions
function isAzurePackage(model: RLCModel): boolean {
  return model.options?.packageDetails?.name?.startsWith("@azure") ?? false;
}

function hasLroOperations(model: RLCModel): boolean {
  if (!model.paths) return false;
  
  // Convert paths object to array if needed
  const pathsArray = Array.isArray(model.paths) ? model.paths : Object.values(model.paths);
  
  return pathsArray.some((path: any) => 
    path.operations?.some((op: any) => op.isLongRunning)
  ) ?? false;
}

export function generatePackageJsonWithAlloy(
  model: RLCModel,
  options: {
    exports?: Record<string, any>;
    dependencies?: Record<string, string>;
    clientContextPaths?: string[];
  } = {}
): { path: string; content: string } {
  const component = PackageJsonComponent({ 
    model, 
    exports: options.exports,
    dependencies: options.dependencies,
    clientContextPaths: options.clientContextPaths
  });
  
  // For now, we'll use the component directly since it returns the JSON string
  const result = component;
  
  return {
    path: "package.json",
    content: String(result)
  };
}
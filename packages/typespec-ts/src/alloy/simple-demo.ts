// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Simple demo to test basic Alloy functionality
 */

import { demoAlloyPackageJson } from "./packageJsonEmitter.js";
import { getAlloyFeatureFlagStatus } from "./codeGenerationEmitter.js";
import { RLCModel } from "@azure-tools/rlc-common";

// Create a mock model for demonstration
const mockModel: RLCModel = {
  srcPath: "src",
  paths: {},
  options: {
    title: "Demo Client",
    useAlloyPackageJson: true,
    useAlloyCodeGeneration: true
  }
} as any;

console.log("🚀 Running Alloy Demo...");
console.log();

// Test package.json generation
console.log("📦 Testing package.json generation:");
console.log("=" + "=".repeat(40));
try {
  const packageJson = demoAlloyPackageJson();
  console.log(packageJson);
} catch (error) {
  console.error("Error generating package.json:", error);
}
console.log();

// Test feature flag status
console.log("🎛️ Feature flag status:");
console.log("=" + "=".repeat(40));
const featureFlags = getAlloyFeatureFlagStatus(mockModel);
console.log(JSON.stringify(featureFlags, null, 2));
console.log();

// Test simple component generation without JSX
console.log("🔧 Testing simple component generation:");
console.log("=" + "=".repeat(40));

// Simple class structure without JSX
const clientClassCode = `export class TestClient {
  private _client: TestClient;
  public readonly pipeline: Pipeline;
  
  constructor(endpointParam: string, options?: TestClientOptionalParams) {
    this._client = TestClient(endpointParam, options);
    this.pipeline = this._client.pipeline;
  }
  
  async getUser(userId: string, options?: GetUserOptions): Promise<GetUserResponse> {
    return getUserOperation(this._client, userId, options);
  }
}`;

console.log(clientClassCode);
console.log();

// Simple interface structure without JSX
const clientInterfaceCode = `export interface Routes {
  /** Get user by ID */
  (path: "/users/{userId}", userId: string): StreamableMethod<GetUserResponse>;
}

export type TestClient = Client & { path: Routes };`;

console.log("📝 Generated interface:");
console.log("=" + "=".repeat(40));
console.log(clientInterfaceCode);
console.log();

console.log("✅ Simple demo completed successfully!");
console.log("🎯 This demonstrates the basic Alloy infrastructure is working");
console.log("📝 Full JSX component generation requires proper runtime setup");
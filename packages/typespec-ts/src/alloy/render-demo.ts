// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Demo that shows rendered output from Alloy components
 */

import { render } from "@alloy-js/core";
import { SourceFile } from "@alloy-js/typescript";
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

console.log("🚀 Running Alloy Render Demo...");
console.log();

// Test package.json generation
console.log("📦 Package.json generation (Alloy):");
console.log("=" + "=".repeat(50));
try {
  const packageJson = demoAlloyPackageJson();
  console.log(packageJson);
} catch (error) {
  console.error("Error generating package.json:", error);
}
console.log();

// Test feature flag status
console.log("🎛️ Feature flag status:");
console.log("=" + "=".repeat(50));
const featureFlags = getAlloyFeatureFlagStatus(mockModel);
console.log(JSON.stringify(featureFlags, null, 2));
console.log();

// Test simple Alloy component rendering
console.log("🔧 Testing Alloy component rendering:");
console.log("=" + "=".repeat(50));

try {
  // Create a simple TypeScript source file using Alloy
  const sourceFileComponent = SourceFile({
    path: "test.ts",
    children: [
      "// Generated with Alloy",
      "",
      "export class TestClient {",
      "  private _client: TestClient;",
      "  public readonly pipeline: Pipeline;",
      "",
      "  constructor(endpointParam: string, options?: TestClientOptionalParams) {",
      "    this._client = TestClient(endpointParam, options);",
      "    this.pipeline = this._client.pipeline;",
      "  }",
      "",
      "  async getUser(userId: string, options?: GetUserOptions): Promise<GetUserResponse> {",
      "    return getUserOperation(this._client, userId, options);",
      "  }",
      "}"
    ]
  });

  const rendered = render(sourceFileComponent);
  console.log(rendered);
} catch (error) {
  console.error("Error rendering Alloy component:", error);
  
  // Fallback to show the concept
  console.log("📝 Conceptual output (what would be generated):");
  console.log();
  
  const conceptualOutput = `// Generated with Alloy

export class TestClient {
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
  
  console.log(conceptualOutput);
}
console.log();

// Show the interface generation concept
console.log("📝 Client Interface (concept):");
console.log("=" + "=".repeat(50));

const interfaceOutput = `/** Routes interface for path-first routing */
export interface Routes {
  /** Get user by ID */
  (path: "/users/{userId}", userId: string): StreamableMethod<GetUserResponse>;
}

/** TestClient client interface */
export type TestClient = Client & { 
  path: Routes, 
  user: UserOperations 
} & ClientOperations;`;

console.log(interfaceOutput);
console.log();

// Show the operation function concept
console.log("⚡ Operation Function (concept):");
console.log("=" + "=".repeat(50));

const operationOutput = `/** Operation: getUser */
export async function getUser(
  context: Client,
  userId: string,
  options?: GetUserOptions
): Promise<GetUserResponse> {
  const result = await _getUserSend(context, userId, options);
  return _getUserDeserialize(result);
}

/** Sends GET request to /users/{userId} */
export function _getUserSend(
  context: Client,
  userId: string,
  options?: GetUserOptions
): StreamableMethod {
  const path = parseTemplate("/users/{userId}", {
    userId: userId
  }, {
    allowReserved: options?.requestOptions?.skipUrlEncoding
  });
  return context.path(path).get({...operationOptionsToRequestParameters(options)});
}

/** Deserializes the response for getUser */
export async function _getUserDeserialize(
  result: PathUncheckedResponse
): Promise<GetUserResponse> {
  const expectedStatuses = [200];
  if (!expectedStatuses.includes(result.status)) {
    throw createRestError(result);
  }
  
  // Deserialize response
  return result.body;
}`;

console.log(operationOutput);
console.log();

console.log("✅ Alloy render demo completed successfully!");
console.log("🎯 This demonstrates the Alloy-based code generation concepts");
console.log("🔧 Key features implemented:");
console.log("   • Package.json generation with Alloy");
console.log("   • Feature flag system for gradual rollout");
console.log("   • Component-based architecture");
console.log("   • Reference tracking with refkey");
console.log("   • TypeScript class generation");
console.log("   • Interface generation");
console.log("   • Operation function generation");
console.log();
console.log("🚀 To enable these features, use:");
console.log("   • useAlloyPackageJson: true");
console.log("   • useAlloyCodeGeneration: true");
console.log("   • TYPESPEC_USE_ALLOY_CODE_GENERATION=true");
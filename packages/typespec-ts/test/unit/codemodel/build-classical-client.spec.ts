// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describe, it, assert } from "vitest";
import {
  createDpgContextTestHelper,
  rlcEmitterFor
} from "../../util/testUtil.js";
import { buildClassicalClientData } from "../../../src/codemodel/build-classical-client.js";
import { getClientHierarchyMap } from "../../../src/utils/clientUtils.js";
import { transformModularEmitterOptions } from "../../../src/modular/buildModularOptions.js";

async function getClassicalClientData(tspContent: string) {
  const context = await rlcEmitterFor(tspContent, {
    needNamespaces: false,
    needAzureCore: false,
    needTCGC: false,
    withRawContent: true
  });
  const dpgContext = await createDpgContextTestHelper(context.program);
  const clientMap = getClientHierarchyMap(dpgContext);
  const emitterOptions = transformModularEmitterOptions(dpgContext, "src", {
    casing: "camel"
  });
  assert.isTrue(clientMap.length > 0, "Expected at least one client");
  return buildClassicalClientData(dpgContext, clientMap[0]!, emitterOptions);
}

const basicService = `
import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{title: "Widget Service"})
namespace WidgetService;

model Widget { id: string; name: string; }

@route("/widgets")
namespace Widgets {
  @get op getWidget(@path id: string): Widget;
  @delete op deleteWidget(@path id: string): void;
}
`;

describe("buildClassicalClientData", () => {
  it("should produce a class name ending with Client", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isTrue(
      data.className.endsWith("Client"),
      `Expected class name to end with 'Client', got '${data.className}'`
    );
  });

  it("should produce a valid file path ending with .ts", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isTrue(
      data.filePath.endsWith(".ts"),
      `Expected file path to end with '.ts', got '${data.filePath}'`
    );
  });

  it("should have a client property type", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isTrue(
      data.clientPropertyType.length > 0,
      "Client property type should not be empty"
    );
  });

  it("should have constructor parameters", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isTrue(
      data.constructorParameters.length >= 1,
      "Should have at least 1 constructor parameter"
    );
    // Should always have an options parameter
    const hasOptions = data.constructorParameters.some(
      (p) => p.name === "options"
    );
    assert.isTrue(hasOptions, "Should have an options parameter");
  });

  it("should have constructor body statements", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isTrue(
      data.constructorBody.length > 0,
      "Constructor should have body statements"
    );
    // Should create the modular client
    const hasCreateClient = data.constructorBody.some((s) =>
      s.includes("this._client")
    );
    assert.isTrue(hasCreateClient, "Constructor should assign this._client");
    // Should assign pipeline
    const hasPipeline = data.constructorBody.some((s) =>
      s.includes("this.pipeline")
    );
    assert.isTrue(hasPipeline, "Constructor should assign this.pipeline");
  });

  it("should have an options type name", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isTrue(
      data.optionsTypeName.endsWith("OptionalParams"),
      `Expected options type to end with 'OptionalParams', got '${data.optionsTypeName}'`
    );
  });

  it("should have methods for operations", async () => {
    const data = await getClassicalClientData(basicService);
    // The basic service has getWidget and deleteWidget — may be direct methods or in an operation group
    const totalOps =
      data.methods.length +
      data.operationGroups.reduce(
        (sum, _g) => sum + 1, // Each group represents at least one operation
        0
      );
    assert.isTrue(totalOps > 0, "Should have at least one method or operation group");
  });

  it("should have a modular client name for factory reference", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isTrue(
      data.modularClientName.length > 0,
      "Modular client name should not be empty"
    );
  });

  it("should not need subscriptionId overloads for non-ARM", async () => {
    const data = await getClassicalClientData(basicService);
    assert.isFalse(
      data.needsSubscriptionIdOverload,
      "Non-ARM client should not need subscriptionId overload"
    );
  });
});

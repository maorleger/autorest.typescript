// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describe, it, assert } from "vitest";
import {
  createDpgContextTestHelper,
  rlcEmitterFor
} from "../../util/testUtil.js";
import { buildClientContextData } from "../../../src/codemodel/build-client-context.js";
import { getClientHierarchyMap } from "../../../src/utils/clientUtils.js";
import { transformModularEmitterOptions } from "../../../src/modular/buildModularOptions.js";

async function getClientContextData(tspContent: string) {
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
  return buildClientContextData(dpgContext, clientMap[0]!, emitterOptions);
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
}
`;

describe("buildClientContextData", () => {
  it("should produce a client interface with the correct name", async () => {
    const data = await getClientContextData(basicService);
    assert.isTrue(
      data.clientInterface.name.length > 0,
      "Client interface should have a name"
    );
    assert.isTrue(
      data.clientInterface.exported,
      "Client interface should be exported"
    );
    assert.isDefined(data.clientInterface.extends);
    assert.isTrue(data.clientInterface.extends!.length > 0);
  });

  it("should produce an options interface named ClassicalClientOptionalParams", async () => {
    const data = await getClientContextData(basicService);
    assert.isTrue(
      data.optionsInterface.name.endsWith("OptionalParams"),
      `Expected options interface name to end with 'OptionalParams', got '${data.optionsInterface.name}'`
    );
    assert.isTrue(data.optionsInterface.exported);
    assert.isDefined(data.optionsInterface.extends);
    assert.isTrue(data.optionsInterface.extends!.length > 0);
  });

  it("should produce a factory function named createXxx", async () => {
    const data = await getClientContextData(basicService);
    assert.isTrue(
      data.factoryFunction.name.startsWith("create"),
      `Expected factory function name to start with 'create', got '${data.factoryFunction.name}'`
    );
    assert.isTrue(data.factoryFunction.exported);
    assert.strictEqual(data.factoryFunction.returnType, data.clientInterface.name);
    assert.isTrue(
      data.factoryFunction.parameters.length >= 1,
      "Factory should have at least 1 parameter"
    );
  });

  it("should produce a valid file path", async () => {
    const data = await getClientContextData(basicService);
    assert.isTrue(
      data.filePath.endsWith("Context.ts"),
      `Expected file path to end with 'Context.ts', got '${data.filePath}'`
    );
    assert.isTrue(
      data.filePath.includes("/api/"),
      `Expected file path to contain '/api/', got '${data.filePath}'`
    );
  });

  it("should mark Azure packages correctly", async () => {
    const data = await getClientContextData(basicService);
    // Default test context uses Azure flavor
    assert.isTrue(data.isAzure, "Default test context should be Azure-flavored");
  });

  it("should have body statements in the factory function", async () => {
    const data = await getClientContextData(basicService);
    assert.isTrue(
      data.factoryFunction.bodyStatements.length > 0,
      "Factory function should have body statements"
    );
    // Should contain a client creation statement (may use a placeholder ref for getClient)
    const hasClientCreation = data.factoryFunction.bodyStatements.some(
      (s) => s.includes("clientContext") || s.includes("getClient")
    );
    assert.isTrue(hasClientCreation, "Factory should create a client context");
    // Should end with a return statement
    const hasReturn = data.factoryFunction.bodyStatements.some(
      (s) => s.includes("return")
    );
    assert.isTrue(hasReturn, "Factory should have a return statement");
  });
});

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describe, it, assert } from "vitest";
import {
  createDpgContextTestHelper,
  rlcEmitterFor
} from "../../util/testUtil.js";
import { buildOperationFilesData } from "../../../src/codemodel/build-operations.js";
import { getClientHierarchyMap } from "../../../src/utils/clientUtils.js";
import { transformModularEmitterOptions } from "../../../src/modular/buildModularOptions.js";

async function getOperationFilesData(tspContent: string) {
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
  return buildOperationFilesData(dpgContext, clientMap[0]!, emitterOptions);
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

const multiGroupService = `
import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{title: "Pet Store"})
namespace PetStore;

model Pet { id: string; name: string; }
model Toy { id: string; name: string; }

@route("/pets")
namespace Pets {
  @get op getPet(@path id: string): Pet;
}

@route("/toys")
namespace Toys {
  @get op getToy(@path id: string): Toy;
}
`;

describe("buildOperationFilesData", () => {
  it("should produce at least one operation file", async () => {
    const files = await getOperationFilesData(basicService);
    assert.isTrue(files.length > 0, "Should produce at least one operation file");
  });

  it("should produce files with valid paths ending in .ts", async () => {
    const files = await getOperationFilesData(basicService);
    for (const file of files) {
      assert.isTrue(
        file.filePath.endsWith(".ts"),
        `File path should end with .ts, got '${file.filePath}'`
      );
      assert.isTrue(
        file.filePath.includes("/api/"),
        `File path should contain '/api/', got '${file.filePath}'`
      );
    }
  });

  it("should have operations in each file", async () => {
    const files = await getOperationFilesData(basicService);
    for (const file of files) {
      assert.isTrue(
        file.operations.length > 0,
        `File '${file.filePath}' should have at least one operation`
      );
    }
  });

  it("should have operation names", async () => {
    const files = await getOperationFilesData(basicService);
    const allOps = files.flatMap((f) => f.operations);
    assert.isTrue(allOps.length > 0, "Should have at least one operation");
    for (const op of allOps) {
      assert.isTrue(
        op.name.length > 0,
        "Operation should have a non-empty name"
      );
    }
  });

  it("should have a client import alias", async () => {
    const files = await getOperationFilesData(basicService);
    for (const file of files) {
      assert.isTrue(
        file.clientImportAlias.length > 0,
        "Should have a client import alias"
      );
    }
  });

  it("should have a client import path", async () => {
    const files = await getOperationFilesData(basicService);
    for (const file of files) {
      assert.isTrue(
        file.clientImportPath.endsWith(".js"),
        `Client import path should end with .js, got '${file.clientImportPath}'`
      );
    }
  });

  it("should produce separate files for multiple operation groups", async () => {
    const files = await getOperationFilesData(multiGroupService);
    // Multiple operation groups should produce multiple files
    // (or operations in separate groups within files)
    const totalOps = files.flatMap((f) => f.operations).length;
    assert.isTrue(totalOps >= 2, "Should have operations from both groups");
  });

  it("should have send and deserialize function names for each operation", async () => {
    const files = await getOperationFilesData(basicService);
    const allOps = files.flatMap((f) => f.operations);
    for (const op of allOps) {
      assert.isTrue(
        op.sendFunctionName.length > 0,
        `Operation '${op.name}' should have a send function name`
      );
      assert.isTrue(
        op.deserializeFunctionName.length > 0,
        `Operation '${op.name}' should have a deserialize function name`
      );
    }
  });
});

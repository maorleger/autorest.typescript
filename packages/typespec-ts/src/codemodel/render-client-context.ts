// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Renderer for client context files.
 *
 * Takes a ClientContextDeclaration (pure data) and produces a ts-morph
 * SourceFile. This file has ZERO TCGC imports — it only knows about
 * the semantic model types and ts-morph.
 */

import { SourceFile, Project } from "ts-morph";
import type { ClientContextDeclaration } from "./types.js";

/**
 * Render a ClientContextDeclaration into a ts-morph SourceFile.
 */
export function renderClientContext(
  project: Project,
  data: ClientContextDeclaration
): SourceFile {
  const file = project.createSourceFile(data.filePath);

  // 1. Client interface
  file.addInterface({
    isExported: data.clientInterface.exported,
    name: data.clientInterface.name,
    extends: data.clientInterface.extends,
    docs: data.clientInterface.doc,
    properties: data.clientInterface.properties.map((p) => ({
      name: p.name,
      type: p.type,
      hasQuestionToken: p.optional,
      docs: p.doc
    }))
  });

  // 2. Options interface
  file.addInterface({
    isExported: data.optionsInterface.exported,
    name: data.optionsInterface.name,
    extends: data.optionsInterface.extends,
    docs: data.optionsInterface.doc,
    properties: data.optionsInterface.properties.map((p) => ({
      name: p.name,
      type: p.type,
      hasQuestionToken: p.optional,
      docs: p.doc
    }))
  });

  // 3. Logger import (Azure packages only)
  if (data.isAzure) {
    file.addImportDeclaration({
      moduleSpecifier:
        "../".repeat(data.hierarchyDepth + 1) + "logger.js",
      namedImports: ["logger"]
    });
  }

  // 4. Factory function
  const fn = file.addFunction({
    docs: data.factoryFunction.doc,
    name: data.factoryFunction.name,
    returnType: data.factoryFunction.returnType,
    isExported: data.factoryFunction.exported,
    parameters: data.factoryFunction.parameters.map((p) => ({
      name: p.name,
      type: p.type,
      hasQuestionToken: p.optional,
      initializer: p.defaultValue
    }))
  });

  // Add body statements
  for (const stmt of data.factoryFunction.bodyStatements) {
    fn.addStatements(stmt);
  }

  // 5. Fix imports and unused identifiers
  file.fixMissingImports({}, { importModuleSpecifierEnding: "js" });
  file.fixUnusedIdentifiers();

  return file;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";
import { AlloyRenderPipeline, renderWithFallback } from "../core/render.js";
import { AlloyGenerationContext } from "../core/references.js";
import { 
  shouldUseAlloyClientClass, 
  shouldUseAlloyClientInterface, 
  shouldUseAlloyOperationFunction 
} from "../codeGenerationEmitter.js";
import { 
  ClientClassSourceFile, 
  ClientClassConfig 
} from "../components/ProductionClientClass.js";
import { 
  ClientInterfaceSourceFile, 
  ClientInterfaceConfig 
} from "../components/ProductionClientInterface.js";
import { 
  OperationFunctionSourceFile, 
  OperationFunctionConfig 
} from "../components/ProductionOperationFunction.js";
import { ServiceOperation } from "../../utils/operationUtil.js";

/**
 * Production-ready integration with existing builders
 */
export class AlloyBuilderIntegration {
  private context: AlloyGenerationContext;

  constructor(model: RLCModel) {
    this.context = new AlloyGenerationContext(model);
  }

  /**
   * Build client definitions with Alloy if enabled, otherwise fallback to existing implementation
   */
  async buildClientDefinitions(): Promise<{ path: string; content: string }> {
    const model = this.context.getModel();
    
    if (!shouldUseAlloyClientInterface(model)) {
      // Import and use existing implementation
      const { buildClientDefinitions } = await import("@azure-tools/rlc-common");
      return buildClientDefinitions(model);
    }

    try {
      const config = this.createClientInterfaceConfig();
      const sourceFile = ClientInterfaceSourceFile({ config, context: this.context });
      const content = await AlloyRenderPipeline.renderComponent(sourceFile);
      
      return {
        path: `${model.srcPath}/clientDefinitions.ts`,
        content
      };
    } catch (error) {
      console.warn("Alloy client interface generation failed, falling back to traditional implementation:", error);
      const { buildClientDefinitions } = await import("@azure-tools/rlc-common");
      return buildClientDefinitions(model);
    }
  }

  /**
   * Build client class with Alloy if enabled, otherwise fallback to existing implementation
   */
  async buildClientClass(clientMap: [string[], any]): Promise<{ path: string; content: string }> {
    const model = this.context.getModel();
    
    if (!shouldUseAlloyClientClass(model)) {
      // Import and use existing implementation
      const { buildClassicalClient } = await import("../../modular/buildClassicalClient.js");
      const sourceFile = buildClassicalClient(
        this.context as any, // Type assertion for compatibility
        clientMap,
        { modularOptions: { sourceRoot: model.srcPath } } as any
      );
      return {
        path: sourceFile.getFilePath(),
        content: sourceFile.getFullText()
      };
    }

    try {
      const config = this.createClientClassConfig(clientMap);
      const sourceFile = ClientClassSourceFile({ config, context: this.context });
      const content = await AlloyRenderPipeline.renderComponent(sourceFile);
      
      return {
        path: `${model.srcPath}/${config.clientName}.ts`,
        content
      };
    } catch (error) {
      console.warn("Alloy client class generation failed, falling back to traditional implementation:", error);
      const { buildClassicalClient } = await import("../../modular/buildClassicalClient.js");
      const sourceFile = buildClassicalClient(
        this.context as any,
        clientMap,
        { modularOptions: { sourceRoot: model.srcPath } } as any
      );
      return {
        path: sourceFile.getFilePath(),
        content: sourceFile.getFullText()
      };
    }
  }

  /**
   * Build operation functions with Alloy if enabled, otherwise fallback to existing implementation
   */
  async buildOperationFunctions(operations: ServiceOperation[]): Promise<Array<{ path: string; content: string }>> {
    const model = this.context.getModel();
    
    if (!shouldUseAlloyOperationFunction(model)) {
      // Import and use existing implementation
      const { buildOperationFiles } = await import("../../modular/buildOperations.js");
      const sourceFiles = buildOperationFiles(
        this.context as any,
        [[], { operations }] as any,
        { modularOptions: { sourceRoot: model.srcPath } } as any
      );
      return sourceFiles.map(file => ({
        path: file.getFilePath(),
        content: file.getFullText()
      }));
    }

    const results: Array<{ path: string; content: string }> = [];
    
    for (const operation of operations) {
      try {
        const config = this.createOperationFunctionConfig(operation);
        const sourceFile = OperationFunctionSourceFile({ config, context: this.context });
        const content = await AlloyRenderPipeline.renderComponent(sourceFile);
        
        results.push({
          path: `${model.srcPath}/operations/${operation.name}.ts`,
          content
        });
      } catch (error) {
        console.warn(`Alloy operation function generation failed for ${operation.name}, falling back to traditional implementation:`, error);
        
        // Fallback to existing implementation for this operation
        const { buildOperationFiles } = await import("../../modular/buildOperations.js");
        const sourceFiles = buildOperationFiles(
          this.context as any,
          [[], { operations: [operation] }] as any,
          { modularOptions: { sourceRoot: model.srcPath } } as any
        );
        
        results.push(...sourceFiles.map(file => ({
          path: file.getFilePath(),
          content: file.getFullText()
        })));
      }
    }
    
    return results;
  }

  /**
   * Build complete TypeScript package with Alloy
   */
  async buildCompletePackage(): Promise<Record<string, string>> {
    const model = this.context.getModel();
    const files: Record<string, string> = {};
    
    try {
      // Build client definitions
      const clientDefinitions = await this.buildClientDefinitions();
      files[clientDefinitions.path] = clientDefinitions.content;
      
      // Build client class
      const clientClass = await this.buildClientClass([[], {}]);
      files[clientClass.path] = clientClass.content;
      
      // Build operation functions
      const operations = this.extractOperationsFromModel(model);
      const operationFiles = await this.buildOperationFunctions(operations);
      operationFiles.forEach(file => {
        files[file.path] = file.content;
      });
      
      return files;
    } catch (error) {
      console.error("Failed to build complete package with Alloy:", error);
      throw error;
    }
  }

  // Helper methods for creating configurations

  private createClientInterfaceConfig(): ClientInterfaceConfig {
    const model = this.context.getModel();
    
    return {
      clientName: model.options?.title || "Client",
      paths: model.paths || {},
      operationGroups: this.extractOperationGroups(model),
      hasShortcuts: model.options?.includeShortcuts || false,
      imports: [
        "@azure-tools/core-client",
        "@azure-tools/core-paging",
        "@azure-tools/core-lro",
        "./parameters.js",
        "./responses.js",
        "./models.js"
      ]
    };
  }

  private createClientClassConfig(clientMap: [string[], any]): ClientClassConfig {
    const model = this.context.getModel();
    const operations = this.extractOperationsFromModel(model);
    
    return {
      clientName: `${model.options?.title || "Client"}Client`,
      rlcClientName: model.options?.title || "Client",
      isMultiEndpoint: false, // Would be determined from actual model
      operations,
      imports: [
        "@azure-tools/core-client",
        "@azure-tools/core-paging",
        "@azure-tools/core-lro",
        "./api/index.js"
      ]
    };
  }

  private createOperationFunctionConfig(operation: ServiceOperation): OperationFunctionConfig {
    return {
      operation,
      clientType: "Client",
      isLroOperation: !!operation.lroMetadata,
      isPagingOperation: !!operation.paging,
      imports: [
        "@azure-tools/core-client",
        "@azure-tools/core-paging",
        "@azure-tools/core-lro",
        "../utils/urlTemplate.js",
        "../utils/requestParameters.js",
        "./index.js"
      ]
    };
  }

  private extractOperationsFromModel(model: RLCModel): ServiceOperation[] {
    const operations: ServiceOperation[] = [];
    
    Object.values(model.paths || {}).forEach(pathInfo => {
      if (pathInfo.operations) {
        operations.push(...pathInfo.operations);
      }
    });
    
    return operations;
  }

  private extractOperationGroups(model: RLCModel): string[] {
    const groups = new Set<string>();
    
    Object.values(model.paths || {}).forEach(pathInfo => {
      if (pathInfo.operationGroupName && pathInfo.operationGroupName !== "Client") {
        groups.add(pathInfo.operationGroupName);
      }
    });
    
    return Array.from(groups);
  }
}

/**
 * Convenience functions for existing builder integration
 */

export async function buildClientDefinitionsWithAlloy(model: RLCModel): Promise<{ path: string; content: string }> {
  const integration = new AlloyBuilderIntegration(model);
  return integration.buildClientDefinitions();
}

export async function buildClientClassWithAlloy(
  model: RLCModel, 
  clientMap: [string[], any]
): Promise<{ path: string; content: string }> {
  const integration = new AlloyBuilderIntegration(model);
  return integration.buildClientClass(clientMap);
}

export async function buildOperationFunctionsWithAlloy(
  model: RLCModel, 
  operations: ServiceOperation[]
): Promise<Array<{ path: string; content: string }>> {
  const integration = new AlloyBuilderIntegration(model);
  return integration.buildOperationFunctions(operations);
}

export async function buildCompletePackageWithAlloy(model: RLCModel): Promise<Record<string, string>> {
  const integration = new AlloyBuilderIntegration(model);
  return integration.buildCompletePackage();
}
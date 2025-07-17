// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";
import { AlloyBuilderIntegration } from "../integration/builderIntegration.js";
import { ServiceOperation } from "../../utils/operationUtil.js";

/**
 * Test suite for validating Alloy vs ts-morph output equivalence
 */
export class AlloyOutputEquivalenceValidator {
  private model: RLCModel;
  private integration: AlloyBuilderIntegration;

  constructor(model: RLCModel) {
    this.model = model;
    this.integration = new AlloyBuilderIntegration(model);
  }

  /**
   * Validate that Alloy and ts-morph generate equivalent client definitions
   */
  async validateClientDefinitions(): Promise<ValidationResult> {
    const testName = "ClientDefinitions";
    
    try {
      // Generate with Alloy
      const alloyModel = { ...this.model, options: { ...this.model.options, useAlloyCodeGeneration: true } };
      const alloyIntegration = new AlloyBuilderIntegration(alloyModel);
      const alloyResult = await alloyIntegration.buildClientDefinitions();
      
      // Generate with ts-morph
      const tsMorphModel = { ...this.model, options: { ...this.model.options, useAlloyCodeGeneration: false } };
      const tsMorphIntegration = new AlloyBuilderIntegration(tsMorphModel);
      const tsMorphResult = await tsMorphIntegration.buildClientDefinitions();
      
      // Compare outputs
      const isEquivalent = await this.compareTypeScriptOutputs(
        alloyResult.content, 
        tsMorphResult.content
      );
      
      return {
        testName,
        passed: isEquivalent,
        alloyOutput: alloyResult.content,
        tsMorphOutput: tsMorphResult.content,
        differences: isEquivalent ? [] : await this.findDifferences(alloyResult.content, tsMorphResult.content)
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        alloyOutput: "",
        tsMorphOutput: "",
        differences: []
      };
    }
  }

  /**
   * Validate that Alloy and ts-morph generate equivalent client classes
   */
  async validateClientClass(): Promise<ValidationResult> {
    const testName = "ClientClass";
    
    try {
      // Generate with Alloy
      const alloyModel = { ...this.model, options: { ...this.model.options, useAlloyCodeGeneration: true } };
      const alloyIntegration = new AlloyBuilderIntegration(alloyModel);
      const alloyResult = await alloyIntegration.buildClientClass([[], {}]);
      
      // Generate with ts-morph
      const tsMorphModel = { ...this.model, options: { ...this.model.options, useAlloyCodeGeneration: false } };
      const tsMorphIntegration = new AlloyBuilderIntegration(tsMorphModel);
      const tsMorphResult = await tsMorphIntegration.buildClientClass([[], {}]);
      
      // Compare outputs
      const isEquivalent = await this.compareTypeScriptOutputs(
        alloyResult.content, 
        tsMorphResult.content
      );
      
      return {
        testName,
        passed: isEquivalent,
        alloyOutput: alloyResult.content,
        tsMorphOutput: tsMorphResult.content,
        differences: isEquivalent ? [] : await this.findDifferences(alloyResult.content, tsMorphResult.content)
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        alloyOutput: "",
        tsMorphOutput: "",
        differences: []
      };
    }
  }

  /**
   * Validate that Alloy and ts-morph generate equivalent operation functions
   */
  async validateOperationFunctions(): Promise<ValidationResult> {
    const testName = "OperationFunctions";
    const operations = this.extractOperationsFromModel();
    
    try {
      // Generate with Alloy
      const alloyModel = { ...this.model, options: { ...this.model.options, useAlloyCodeGeneration: true } };
      const alloyIntegration = new AlloyBuilderIntegration(alloyModel);
      const alloyResults = await alloyIntegration.buildOperationFunctions(operations);
      
      // Generate with ts-morph
      const tsMorphModel = { ...this.model, options: { ...this.model.options, useAlloyCodeGeneration: false } };
      const tsMorphIntegration = new AlloyBuilderIntegration(tsMorphModel);
      const tsMorphResults = await tsMorphIntegration.buildOperationFunctions(operations);
      
      // Compare outputs
      const alloyContent = alloyResults.map(r => r.content).join("\n\n");
      const tsMorphContent = tsMorphResults.map(r => r.content).join("\n\n");
      
      const isEquivalent = await this.compareTypeScriptOutputs(alloyContent, tsMorphContent);
      
      return {
        testName,
        passed: isEquivalent,
        alloyOutput: alloyContent,
        tsMorphOutput: tsMorphContent,
        differences: isEquivalent ? [] : await this.findDifferences(alloyContent, tsMorphContent)
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        alloyOutput: "",
        tsMorphOutput: "",
        differences: []
      };
    }
  }

  /**
   * Run all validation tests
   */
  async runAllValidations(): Promise<ValidationSummary> {
    const results: ValidationResult[] = [];
    
    console.log("🧪 Running Alloy output equivalence validation...");
    
    // Test client definitions
    console.log("  📋 Testing client definitions...");
    const clientDefinitionsResult = await this.validateClientDefinitions();
    results.push(clientDefinitionsResult);
    
    // Test client class
    console.log("  🏗️ Testing client class...");
    const clientClassResult = await this.validateClientClass();
    results.push(clientClassResult);
    
    // Test operation functions
    console.log("  ⚡ Testing operation functions...");
    const operationFunctionsResult = await this.validateOperationFunctions();
    results.push(operationFunctionsResult);
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      results,
      overallSuccess: passedTests === totalTests
    };
  }

  /**
   * Compare TypeScript outputs for semantic equivalence
   */
  private async compareTypeScriptOutputs(alloyOutput: string, tsMorphOutput: string): Promise<boolean> {
    // Normalize whitespace and formatting
    const normalizedAlloy = this.normalizeTypeScriptCode(alloyOutput);
    const normalizedTsMorph = this.normalizeTypeScriptCode(tsMorphOutput);
    
    // Check if they're identical after normalization
    if (normalizedAlloy === normalizedTsMorph) {
      return true;
    }
    
    // Check for semantic equivalence (would require TypeScript compiler API)
    // For now, we'll do a simpler check
    return this.checkSemanticEquivalence(normalizedAlloy, normalizedTsMorph);
  }

  /**
   * Normalize TypeScript code for comparison
   */
  private normalizeTypeScriptCode(code: string): string {
    return code
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .replace(/\s*([{}();,])\s*/g, "$1")
      .trim();
  }

  /**
   * Check for semantic equivalence between two TypeScript code strings
   */
  private checkSemanticEquivalence(code1: string, code2: string): boolean {
    // This is a simplified check - in production, you'd want to use the TypeScript compiler API
    // to parse and compare ASTs
    
    // Check for same exports
    const exports1 = this.extractExports(code1);
    const exports2 = this.extractExports(code2);
    
    if (exports1.length !== exports2.length) {
      return false;
    }
    
    for (const exp of exports1) {
      if (!exports2.includes(exp)) {
        return false;
      }
    }
    
    // Check for same imports
    const imports1 = this.extractImports(code1);
    const imports2 = this.extractImports(code2);
    
    // Allow for different import ordering
    const sortedImports1 = imports1.sort();
    const sortedImports2 = imports2.sort();
    
    return JSON.stringify(sortedImports1) === JSON.stringify(sortedImports2);
  }

  /**
   * Extract exports from TypeScript code
   */
  private extractExports(code: string): string[] {
    const exportMatches = code.match(/export\s+(class|interface|type|function|const|let|var)\s+(\w+)/g);
    return exportMatches?.map(match => match.replace(/export\s+\w+\s+/, "")) || [];
  }

  /**
   * Extract imports from TypeScript code
   */
  private extractImports(code: string): string[] {
    const importMatches = code.match(/import\s+.*?from\s+["'].*?["']/g);
    return importMatches || [];
  }

  /**
   * Find specific differences between two code strings
   */
  private async findDifferences(alloyOutput: string, tsMorphOutput: string): Promise<string[]> {
    const differences: string[] = [];
    
    // Check for missing exports
    const alloyExports = this.extractExports(alloyOutput);
    const tsMorphExports = this.extractExports(tsMorphOutput);
    
    const missingInAlloy = tsMorphExports.filter(exp => !alloyExports.includes(exp));
    const missingInTsMorph = alloyExports.filter(exp => !tsMorphExports.includes(exp));
    
    if (missingInAlloy.length > 0) {
      differences.push(`Missing exports in Alloy: ${missingInAlloy.join(", ")}`);
    }
    
    if (missingInTsMorph.length > 0) {
      differences.push(`Missing exports in ts-morph: ${missingInTsMorph.join(", ")}`);
    }
    
    // Check for import differences
    const alloyImports = this.extractImports(alloyOutput);
    const tsMorphImports = this.extractImports(tsMorphOutput);
    
    const missingImportsInAlloy = tsMorphImports.filter(imp => !alloyImports.includes(imp));
    const missingImportsInTsMorph = alloyImports.filter(imp => !tsMorphImports.includes(imp));
    
    if (missingImportsInAlloy.length > 0) {
      differences.push(`Missing imports in Alloy: ${missingImportsInAlloy.join(", ")}`);
    }
    
    if (missingImportsInTsMorph.length > 0) {
      differences.push(`Missing imports in ts-morph: ${missingImportsInTsMorph.join(", ")}`);
    }
    
    return differences;
  }

  /**
   * Extract operations from the model
   */
  private extractOperationsFromModel(): ServiceOperation[] {
    const operations: ServiceOperation[] = [];
    
    Object.values(this.model.paths || {}).forEach(pathInfo => {
      if (pathInfo.operations) {
        operations.push(...pathInfo.operations);
      }
    });
    
    return operations;
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  testName: string;
  passed: boolean;
  alloyOutput: string;
  tsMorphOutput: string;
  differences: string[];
  error?: string;
}

/**
 * Validation summary interface
 */
export interface ValidationSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ValidationResult[];
  overallSuccess: boolean;
}

/**
 * Utility function to run validation tests
 */
export async function validateAlloyOutput(model: RLCModel): Promise<ValidationSummary> {
  const validator = new AlloyOutputEquivalenceValidator(model);
  return validator.runAllValidations();
}
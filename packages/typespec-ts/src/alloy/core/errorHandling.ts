// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RLCModel } from "@azure-tools/rlc-common";

/**
 * Production-ready error handling for Alloy integration
 */
export class AlloyErrorHandler {
  private static instance: AlloyErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private maxRetries: number = 3;
  private fallbackThreshold: number = 5;

  static getInstance(): AlloyErrorHandler {
    if (!AlloyErrorHandler.instance) {
      AlloyErrorHandler.instance = new AlloyErrorHandler();
    }
    return AlloyErrorHandler.instance;
  }

  /**
   * Handle Alloy rendering errors with intelligent fallback
   */
  async handleRenderError<T>(
    errorContext: string,
    alloyFn: () => Promise<T>,
    fallbackFn: () => T | Promise<T>,
    model: RLCModel
  ): Promise<T> {
    const errorCount = this.errorCounts.get(errorContext) || 0;
    
    // If we've exceeded the fallback threshold, go straight to fallback
    if (errorCount >= this.fallbackThreshold) {
      console.warn(`Alloy error threshold exceeded for ${errorContext}, using fallback`);
      return await fallbackFn();
    }

    let lastError: Error | null = null;
    
    // Try Alloy with retries
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await alloyFn();
        
        // Reset error count on success
        this.errorCounts.set(errorContext, 0);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        console.warn(`Alloy attempt ${attempt} failed for ${errorContext}:`, lastError.message);
        
        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 100);
        }
      }
    }
    
    // All retries failed, increment error count and fallback
    this.errorCounts.set(errorContext, errorCount + 1);
    
    console.error(`All Alloy attempts failed for ${errorContext}, falling back to traditional implementation`);
    this.logErrorDetails(errorContext, lastError!, model);
    
    return await fallbackFn();
  }

  /**
   * Validate Alloy prerequisites
   */
  validatePrerequisites(model: RLCModel): ValidationResult {
    const issues: string[] = [];
    
    // Check for required dependencies
    if (!this.hasDependency("@alloy-js/core")) {
      issues.push("Missing @alloy-js/core dependency");
    }
    
    if (!this.hasDependency("@alloy-js/typescript")) {
      issues.push("Missing @alloy-js/typescript dependency");
    }
    
    // Check model structure
    if (!model.paths || Object.keys(model.paths).length === 0) {
      issues.push("Model has no paths defined");
    }
    
    if (!model.options) {
      issues.push("Model has no options defined");
    }
    
    // Check for TypeScript configuration
    if (!this.hasTypeScriptConfig()) {
      issues.push("No TypeScript configuration found");
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Handle component-specific errors
   */
  handleComponentError(
    componentName: string,
    error: Error,
    context: string
  ): ComponentErrorResult {
    const errorDetails = {
      componentName,
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    // Log error details
    console.error(`Component error in ${componentName}:`, errorDetails);
    
    // Determine recovery strategy
    const recoveryStrategy = this.determineRecoveryStrategy(componentName, error);
    
    return {
      canRecover: recoveryStrategy.canRecover,
      recoveryAction: recoveryStrategy.action,
      errorDetails
    };
  }

  /**
   * Log comprehensive error details
   */
  private logErrorDetails(context: string, error: Error, model: RLCModel): void {
    const errorReport = {
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      model: {
        title: model.options?.title,
        srcPath: model.srcPath,
        pathCount: Object.keys(model.paths || {}).length,
        hasOptions: !!model.options,
        alloyFlags: {
          packageJson: model.options?.useAlloyPackageJson,
          codeGeneration: model.options?.useAlloyCodeGeneration
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        timestamp: new Date().toISOString()
      }
    };
    
    console.error("Detailed error report:", JSON.stringify(errorReport, null, 2));
  }

  /**
   * Determine recovery strategy based on error type
   */
  private determineRecoveryStrategy(componentName: string, error: Error): RecoveryStrategy {
    // JSX/React errors
    if (error.message.includes("jsx") || error.message.includes("React")) {
      return {
        canRecover: true,
        action: "retry_with_fallback_jsx"
      };
    }
    
    // Import/module errors
    if (error.message.includes("Cannot find module") || error.message.includes("import")) {
      return {
        canRecover: true,
        action: "retry_with_alternative_imports"
      };
    }
    
    // Type errors
    if (error.message.includes("Property") && error.message.includes("does not exist")) {
      return {
        canRecover: true,
        action: "retry_with_type_assertion"
      };
    }
    
    // Render errors
    if (error.message.includes("render") || error.message.includes("component")) {
      return {
        canRecover: false,
        action: "fallback_to_ts_morph"
      };
    }
    
    // Unknown errors
    return {
      canRecover: false,
      action: "fallback_to_ts_morph"
    };
  }

  /**
   * Check if a dependency is available
   */
  private hasDependency(packageName: string): boolean {
    try {
      require.resolve(packageName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if TypeScript configuration exists
   */
  private hasTypeScriptConfig(): boolean {
    const fs = require("fs");
    const path = require("path");
    
    const configFiles = ["tsconfig.json", "jsconfig.json"];
    
    for (const configFile of configFiles) {
      if (fs.existsSync(path.join(process.cwd(), configFile))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset error counts (useful for testing)
   */
  resetErrorCounts(): void {
    this.errorCounts.clear();
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): ErrorStatistics {
    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
      errorsByContext: Object.fromEntries(this.errorCounts),
      fallbackThreshold: this.fallbackThreshold,
      maxRetries: this.maxRetries
    };
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

/**
 * Component error result interface
 */
export interface ComponentErrorResult {
  canRecover: boolean;
  recoveryAction: string;
  errorDetails: {
    componentName: string;
    errorMessage: string;
    errorStack?: string;
    context: string;
    timestamp: string;
  };
}

/**
 * Recovery strategy interface
 */
interface RecoveryStrategy {
  canRecover: boolean;
  action: string;
}

/**
 * Error statistics interface
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsByContext: Record<string, number>;
  fallbackThreshold: number;
  maxRetries: number;
}

/**
 * Utility functions for error handling
 */

export async function withErrorHandling<T>(
  context: string,
  alloyFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>,
  model: RLCModel
): Promise<T> {
  const errorHandler = AlloyErrorHandler.getInstance();
  return errorHandler.handleRenderError(context, alloyFn, fallbackFn, model);
}

export function validateAlloyPrerequisites(model: RLCModel): ValidationResult {
  const errorHandler = AlloyErrorHandler.getInstance();
  return errorHandler.validatePrerequisites(model);
}

export function handleComponentError(
  componentName: string,
  error: Error,
  context: string
): ComponentErrorResult {
  const errorHandler = AlloyErrorHandler.getInstance();
  return errorHandler.handleComponentError(componentName, error, context);
}
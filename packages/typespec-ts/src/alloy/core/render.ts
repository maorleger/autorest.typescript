// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { render } from "@alloy-js/core";
import { createPackage } from "@alloy-js/typescript";

/**
 * Production-ready Alloy render pipeline
 */
export class AlloyRenderPipeline {
  /**
   * Safely render an Alloy component with proper error handling
   */
  static async renderComponent(component: any): Promise<string> {
    try {
      return await render(component);
    } catch (error) {
      console.error("Alloy render failed:", error);
      throw new AlloyRenderError("Failed to render Alloy component", error);
    }
  }

  /**
   * Render multiple components and return as a map
   */
  static async renderComponents(components: Record<string, any>): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    for (const [name, component] of Object.entries(components)) {
      try {
        results[name] = await this.renderComponent(component);
      } catch (error) {
        console.error(`Failed to render component ${name}:`, error);
        throw new AlloyRenderError(`Failed to render component ${name}`, error);
      }
    }
    
    return results;
  }

  /**
   * Create a TypeScript package with proper Alloy structure
   */
  static async createTypeScriptPackage(packageConfig: {
    name: string;
    version: string;
    files: Array<{
      path: string;
      content: any; // Alloy component
    }>;
  }): Promise<string> {
    try {
      const packageComponent = createPackage({
        name: packageConfig.name,
        version: packageConfig.version,
        files: packageConfig.files.map(file => ({
          path: file.path,
          content: file.content
        }))
      });

      return await this.renderComponent(packageComponent);
    } catch (error) {
      console.error("Failed to create TypeScript package:", error);
      throw new AlloyRenderError("Failed to create TypeScript package", error);
    }
  }
}

/**
 * Custom error class for Alloy rendering issues
 */
export class AlloyRenderError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = "AlloyRenderError";
  }
}

/**
 * Utility function to safely render with fallback
 */
export async function renderWithFallback<T>(
  alloyComponent: any,
  fallbackFn: () => T,
  errorMessage: string = "Alloy rendering failed"
): Promise<T | string> {
  try {
    return await AlloyRenderPipeline.renderComponent(alloyComponent);
  } catch (error) {
    console.warn(`${errorMessage}, falling back to traditional implementation:`, error);
    return fallbackFn();
  }
}
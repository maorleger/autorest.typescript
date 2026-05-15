// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describe, it, expect } from "vitest";

import { buildWarpConfig } from "../../src/metadata/buildWarpConfig.js";
import {
  buildTsSrcEsmConfig,
  buildTsSrcBrowserConfig,
  buildTsSrcReactNativeConfig,
  buildTsSrcCjsConfig
} from "../../src/metadata/buildTsConfig.js";
import { createMockModel } from "./mockHelper.js";

describe("warp.config.yml generation", () => {
  describe("azure monorepo", () => {
    it("should generate a self-contained config without polyfillSuffix", () => {
      const model = createMockModel({
        moduleKind: "esm",
        isMonorepo: true,
        flavor: "azure"
      });

      const result = buildWarpConfig(model);
      expect(result).toBeDefined();
      expect(result!.path).toBe("warp.config.yml");
      expect(result!.content).not.toContain("extends:");
      // polyfillSuffix is no longer used — polyfill resolution is handled
      // via package.json subpath imports instead.
      expect(result!.content).not.toContain("polyfillSuffix");
      // All four targets with tsconfig paths
      expect(result!.content).toContain("name: browser");
      expect(result!.content).toContain("name: react-native");
      expect(result!.content).toContain("name: esm");
      expect(result!.content).toContain("name: commonjs");
      expect(result!.content).toContain("tsconfig:");
      // Base exports should be included
      expect(result!.content).toContain('"./package.json"');
      expect(result!.content).toContain('"."');
    });

    it("should include custom exports alongside base exports", () => {
      const model = createMockModel({
        moduleKind: "esm",
        isMonorepo: true,
        flavor: "azure"
      });

      const result = buildWarpConfig(model, {
        exports: {
          ".": "./src/index.ts",
          "./models": "./src/models/index.ts"
        }
      });
      expect(result).toBeDefined();
      expect(result!.content).not.toContain("extends:");
      expect(result!.content).not.toContain("polyfillSuffix");
      expect(result!.content).toContain("./models");
      expect(result!.content).toContain("./package.json");
      expect(result!.content).toContain("moduleType: commonjs");
    });

    it("should not return config for non-esm module kind", () => {
      const model = createMockModel({
        moduleKind: "cjs",
        isMonorepo: true,
        flavor: "azure"
      });

      const result = buildWarpConfig(model);
      expect(result).toBeUndefined();
    });
  });

  describe("non-monorepo", () => {
    it("should generate a self-contained config without polyfillSuffix", () => {
      const model = createMockModel({
        moduleKind: "esm",
        isMonorepo: false
      });

      const result = buildWarpConfig(model);
      expect(result).toBeDefined();
      expect(result!.path).toBe("warp.config.yml");
      expect(result!.content).not.toContain("extends:");
      expect(result!.content).not.toContain("polyfillSuffix");
    });

    it("should include all target definitions", () => {
      const model = createMockModel({
        moduleKind: "esm",
        isMonorepo: false
      });

      const result = buildWarpConfig(model);
      expect(result).toBeDefined();
      expect(result!.content).toContain("name: browser");
      expect(result!.content).toContain("name: react-native");
      expect(result!.content).toContain("name: esm");
      expect(result!.content).toContain("name: commonjs");
    });
  });

  describe("tsconfig path consistency", () => {
    it("every tsconfig referenced in warp.config.yml has a matching config/ builder", () => {
      const model = createMockModel({
        moduleKind: "esm",
        isMonorepo: true,
        flavor: "azure"
      });

      const warpResult = buildWarpConfig(model);
      expect(warpResult).toBeDefined();

      // Extract all tsconfig paths from warp.config.yml
      const tsconfigRefPattern = /tsconfig:\s*"([^"]+)"/g;
      const referencedPaths: string[] = [];
      let match;
      while (
        (match = tsconfigRefPattern.exec(warpResult!.content)) !== null
      ) {
        referencedPaths.push(match[1].replace(/^\.\//, ""));
      }
      expect(referencedPaths.length).toBeGreaterThan(0);

      // These are the config/ files the builders produce
      const generatedPaths = [
        buildTsSrcEsmConfig(),
        buildTsSrcBrowserConfig(),
        buildTsSrcReactNativeConfig(),
        buildTsSrcCjsConfig()
      ].map((f) => f.path);

      for (const ref of referencedPaths) {
        expect(
          generatedPaths,
          `warp.config.yml references "${ref}" but no config/ builder generates it`
        ).toContain(ref);
      }
    });
  });
});

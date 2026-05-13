// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * TS emitter semantic model.
 *
 * These types describe the generation plan — all naming, type resolution,
 * and conditional decisions are made before rendering. The renderer just
 * materializes these into TypeScript source files.
 *
 * References use SymbolRef (symbolic), NOT concrete import paths.
 * This keeps the model renderer-agnostic (ts-morph today, Alloy later).
 */

// ---------------------------------------------------------------------------
// Symbolic References (renderer-agnostic)
// ---------------------------------------------------------------------------

/** A symbolic reference to a declaration. Renderers resolve these to imports/refkeys. */
export type SymbolRef =
  | ExternalSymbolRef
  | GeneratedSymbolRef
  | StaticHelperRef;

export interface ExternalSymbolRef {
  kind: "external";
  /** The exported name (e.g. "Pipeline", "Client") */
  name: string;
  /** npm package (e.g. "@azure-rest/core-client") */
  package: string;
  /** Whether this is a type-only import */
  typeOnly?: boolean;
}

export interface GeneratedSymbolRef {
  kind: "generated";
  /** Stable ID for the declaration (e.g. "models.Widget", "api.widgetContext") */
  declarationId: string;
  /** The name as it appears in code */
  name: string;
  typeOnly?: boolean;
}

export interface StaticHelperRef {
  kind: "static-helper";
  /** The helper name (e.g. "AzureSupportedClouds") */
  name: string;
  /** The helper group (e.g. "CloudSettingHelpers") */
  group: string;
}

// ---------------------------------------------------------------------------
// Type Expressions
// ---------------------------------------------------------------------------

export type TypeExpression =
  | { kind: "primitive"; name: string }
  | { kind: "literal"; value: string }
  | { kind: "array"; element: TypeExpression }
  | { kind: "union"; variants: TypeExpression[] }
  | { kind: "symbol"; ref: SymbolRef }
  | { kind: "generic"; target: SymbolRef; args: TypeExpression[] }
  | { kind: "raw"; text: string };

// ---------------------------------------------------------------------------
// Property / Parameter shapes
// ---------------------------------------------------------------------------

export interface PropertyShape {
  name: string;
  type: string; // Pre-resolved TS type expression string
  optional: boolean;
  readonly?: boolean;
  doc?: string[];
}

export interface ParameterShape {
  name: string;
  type: string;
  optional: boolean;
  doc?: string[];
  /** Default value expression */
  defaultValue?: string;
}

// ---------------------------------------------------------------------------
// Interface shape
// ---------------------------------------------------------------------------

export interface InterfaceShape {
  name: string;
  exported: boolean;
  extends?: string[];
  properties: PropertyShape[];
  doc?: string[];
}

// ---------------------------------------------------------------------------
// Function shape
// ---------------------------------------------------------------------------

export interface FunctionShape {
  name: string;
  exported: boolean;
  parameters: ParameterShape[];
  returnType: string;
  doc?: string[];
  /** The body as an ordered list of statements. */
  bodyStatements: string[];
  /** Symbols referenced in the body (for import resolution) */
  bodyReferences?: SymbolRef[];
}

// ---------------------------------------------------------------------------
// Client Context Declaration (output of buildClientContextData)
// ---------------------------------------------------------------------------

export interface ClientContextDeclaration {
  /** File path relative to source root */
  filePath: string;

  /** The client interface (e.g., WidgetServiceClient extends Client) */
  clientInterface: InterfaceShape;

  /** The optional params interface (e.g., WidgetClientOptionalParams extends ClientOptions) */
  optionsInterface: InterfaceShape;

  /** The factory function (e.g., createWidgetServiceClient) */
  factoryFunction: FunctionShape;

  /** Whether this is an Azure-flavored package (affects logger import) */
  isAzure: boolean;

  /** Hierarchy depth (affects relative import paths, e.g., "../logger.js") */
  hierarchyDepth: number;
}

// ---------------------------------------------------------------------------
// Method shape (for classical client methods)
// ---------------------------------------------------------------------------

export interface MethodShape {
  name: string;
  parameters: ParameterShape[];
  returnType: string;
  doc?: string[];
  bodyStatements: string[];
  isAsync?: boolean;
  /** Whether this is a deprecated compatibility method */
  isDeprecated?: boolean;
  deprecationMessage?: string;
}

// ---------------------------------------------------------------------------
// Operation Group shape
// ---------------------------------------------------------------------------

export interface OperationGroupShape {
  /** The group name (e.g., "widgets") */
  name: string;
  /** The raw PascalCase name for type references */
  rawName: string;
  /** The property name on the client class */
  propertyName: string;
  /** The getter function name */
  getterName: string;
  /** The type name for the operations interface */
  operationsTypeName: string;
}

// ---------------------------------------------------------------------------
// Classical Client Declaration (output of buildClassicalClientData)
// ---------------------------------------------------------------------------

export interface ClassicalClientDeclaration {
  /** File path relative to source root */
  filePath: string;

  /** The class name (e.g., "WidgetServiceClient") */
  className: string;

  /** The modular client name (e.g., "WidgetService") — used for factory function reference */
  modularClientName: string;

  /** Client doc string */
  doc?: string[];

  /** The type of the private _client property */
  clientPropertyType: string;

  /** The Pipeline type reference string */
  pipelineType: string;

  /** Constructor parameters */
  constructorParameters: ParameterShape[];

  /** Constructor body statements */
  constructorBody: string[];

  /** Whether the constructor needs subscriptionId overloads */
  needsSubscriptionIdOverload: boolean;

  /** Parameters for the overload (minus subscriptionId and options) */
  overloadBaseParameters?: ParameterShape[];

  /** The options type name (e.g., "WidgetServiceClientOptionalParams") */
  optionsTypeName: string;

  /** Export declaration for the options type */
  optionsTypeExportSource: string;

  /** Whether this client has child clients */
  hasChildClients: boolean;

  /** Private _clientParams property info (only if hasChildClients) */
  clientParamsType?: string;
  clientParamsInitStatement?: string;

  /** Direct operations on the client (not in a group) */
  methods: MethodShape[];

  /** Operation groups */
  operationGroups: OperationGroupShape[];

  /** Child client accessors */
  childClientAccessors: ChildClientAccessor[];
}

export interface ChildClientAccessor {
  /** Method name (e.g., "getWidgetsClient") */
  name: string;
  /** Return type (e.g., "WidgetsClient") */
  returnType: string;
  /** Doc string */
  doc?: string[];
  /** Additional parameters beyond parent params */
  additionalParameters: ParameterShape[];
  /** The body statement that constructs the child client */
  bodyStatement: string;
  /** Import info for the child client */
  childClientImportPath: string;
  childClientImportNames: string[];
}

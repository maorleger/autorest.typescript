// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Children, Refkey } from "@alloy-js/core";
import { 
  ClassDeclaration as AlloyClassDeclaration,
  ClassField,
  ClassMethod,
  FunctionDeclaration as AlloyFunctionDeclaration,
  InterfaceDeclaration as AlloyInterfaceDeclaration,
  InterfaceMember,
  ParameterDescriptor as AlloyParameterDescriptor
} from "@alloy-js/typescript";

export interface ClassDeclarationProps {
  name: string;
  refkey?: Refkey;
  export?: boolean;
  extends?: Children;
  children?: Children;
}

export interface PropertyDeclarationProps {
  name: string;
  type: Children;
  refkey?: Refkey;
  public?: boolean;
  private?: boolean;
  protected?: boolean;
  static?: boolean;
  readonly?: boolean;
  optional?: boolean;
  initializer?: Children;
  docs?: string[];
}

export interface MethodDeclarationProps {
  name: string;
  refkey?: Refkey;
  parameters?: Record<string, Children | AlloyParameterDescriptor>;
  returnType?: Children;
  public?: boolean;
  private?: boolean;
  protected?: boolean;
  static?: boolean;
  async?: boolean;
  abstract?: boolean;
  children?: Children;
}

export interface InterfaceDeclarationProps {
  name: string;
  refkey?: Refkey;
  export?: boolean;
  extends?: Children;
  children?: Children;
}

export interface FunctionDeclarationProps {
  name: string;
  refkey?: Refkey;
  parameters?: Record<string, Children | AlloyParameterDescriptor>;
  returnType?: Children;
  export?: boolean;
  async?: boolean;
  children?: Children;
}

export interface InterfaceMemberProps {
  name: string;
  type?: Children;
  optional?: boolean;
  readonly?: boolean;
  children?: Children;
}

// Wrapper components that use the proper Alloy components

export function ClassDeclaration(props: ClassDeclarationProps) {
  return (
    <AlloyClassDeclaration
      name={props.name}
      refkey={props.refkey}
      export={props.export}
      extends={props.extends}
    >
      {props.children}
    </AlloyClassDeclaration>
  );
}

export function PropertyDeclaration(props: PropertyDeclarationProps) {
  return (
    <ClassField
      name={props.name}
      refkey={props.refkey}
      type={props.type}
      public={props.public}
      private={props.private}
      protected={props.protected}
      static={props.static}
    >
      {props.initializer}
    </ClassField>
  );
}

export function MethodDeclaration(props: MethodDeclarationProps) {
  return (
    <ClassMethod
      name={props.name}
      refkey={props.refkey}
      parameters={props.parameters}
      returnType={props.returnType}
      public={props.public}
      private={props.private}
      protected={props.protected}
      static={props.static}
      async={props.async}
    >
      {props.children}
    </ClassMethod>
  );
}

export function InterfaceDeclaration(props: InterfaceDeclarationProps) {
  return (
    <AlloyInterfaceDeclaration
      name={props.name}
      refkey={props.refkey}
      export={props.export}
      extends={props.extends}
    >
      {props.children}
    </AlloyInterfaceDeclaration>
  );
}

export function FunctionDeclaration(props: FunctionDeclarationProps) {
  return (
    <AlloyFunctionDeclaration
      name={props.name}
      refkey={props.refkey}
      parameters={props.parameters}
      returnType={props.returnType}
      export={props.export}
      async={props.async}
    >
      {props.children}
    </AlloyFunctionDeclaration>
  );
}

export function InterfaceMemberDeclaration(props: InterfaceMemberProps) {
  return (
    <InterfaceMember
      name={props.name}
      type={props.type}
      optional={props.optional}
      readonly={props.readonly}
    >
      {props.children}
    </InterfaceMember>
  );
}

// Re-export the parameter descriptor type for use in other components
export type { ParameterDescriptor } from "@alloy-js/typescript";

// Helper function to create parameter descriptors
export function createParameterDescriptor(
  name: string,
  type: Children,
  optional: boolean = false,
  refkey?: Refkey
): Record<string, AlloyParameterDescriptor> {
  return {
    [name]: {
      type,
      refkey: refkey!, // TODO: Handle optional refkey properly
      optional
    }
  };
}

// Helper function to merge parameter descriptors
export function mergeParameterDescriptors(
  ...descriptors: Record<string, Children | AlloyParameterDescriptor>[]
): Record<string, Children | AlloyParameterDescriptor> {
  return Object.assign({}, ...descriptors);
}
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Children, Refkey } from "@alloy-js/core";
import { 
  ClassDeclaration, 
  PropertyDeclaration, 
  MethodDeclaration, 
  ParameterDescriptor,
  createParameterDescriptor
} from "./BaseTypeScriptComponents.js";

export interface ClientClassProps {
  className: string;
  refkey?: Refkey;
  clientType: string;
  rlcClientName: string;
  isMultiEndpoint: boolean;
  constructorParameters: Record<string, Children | ParameterDescriptor>;
  constructorBody: Children;
  methods: ClientMethodProps[];
  docs?: string[];
}

export interface ClientMethodProps {
  name: string;
  refkey?: Refkey;
  parameters: Record<string, Children | ParameterDescriptor>;
  returnType: Children;
  body: Children;
  docs?: string[];
  isAsync?: boolean;
}

export function ClientClass({
  className,
  refkey,
  clientType,
  rlcClientName,
  isMultiEndpoint,
  constructorParameters,
  constructorBody,
  methods,
  docs
}: ClientClassProps) {
  const clientPropertyType = isMultiEndpoint ? `Client.${rlcClientName}` : rlcClientName;
  
  return (
    <ClassDeclaration
      name={className}
      refkey={refkey}
      export={true}
    >
      <PropertyDeclaration
        name="_client"
        type={clientPropertyType}
        private={true}
      />
      
      <PropertyDeclaration
        name="pipeline"
        type="Pipeline"
        public={true}
        readonly={true}
      />
      
      <MethodDeclaration
        name="constructor"
        parameters={constructorParameters}
      >
        {constructorBody}
      </MethodDeclaration>
      
      {methods.map((method) => (
        <MethodDeclaration
          name={method.name}
          refkey={method.refkey}
          parameters={method.parameters}
          returnType={method.returnType}
          async={method.isAsync}
        >
          {method.body}
        </MethodDeclaration>
      ))}
    </ClassDeclaration>
  );
}

export function generateClientClass(props: ClientClassProps): string {
  const component = ClientClass(props);
  return String(component);
}

// Helper functions for generating client class data

export interface ClientClassData {
  className: string;
  refkey?: Refkey;
  clientType: string;
  rlcClientName: string;
  isMultiEndpoint: boolean;
  constructorParameters: Record<string, Children | ParameterDescriptor>;
  constructorBody: Children;
  methods: ClientMethodProps[];
  docs?: string[];
}

export function createClientClassData(
  classicalClientName: string,
  modularClientName: string,
  rlcClientName: string,
  isMultiEndpoint: boolean,
  clientParams: Array<{name: string, type: string, isOptional: boolean, docs?: string[]}>,
  operationMethods: Array<{name: string, parameters: any[], returnType: string, body: string, docs?: string[], isAsync?: boolean}>
): ClientClassData {
  const constructorParameters = clientParams.reduce((acc, param) => {
    return {
      ...acc,
      ...createParameterDescriptor(param.name, param.type, param.isOptional)
    };
  }, {});
  
  const constructorBody = generateConstructorBody(modularClientName, rlcClientName, isMultiEndpoint);
  
  const methods: ClientMethodProps[] = operationMethods.map(method => ({
    name: method.name,
    parameters: method.parameters.reduce((acc, p) => {
      return {
        ...acc,
        ...createParameterDescriptor(p.name, p.type, p.isOptional)
      };
    }, {}),
    returnType: method.returnType,
    body: method.body,
    docs: method.docs,
    isAsync: method.isAsync
  }));
  
  return {
    className: classicalClientName,
    clientType: modularClientName,
    rlcClientName,
    isMultiEndpoint,
    constructorParameters,
    constructorBody,
    methods,
    docs: [`${classicalClientName} client`]
  };
}

function generateConstructorBody(
  modularClientName: string,
  rlcClientName: string,
  isMultiEndpoint: boolean
): Children {
  const clientCreation = isMultiEndpoint 
    ? `Client.${rlcClientName}(endpointParam, options)`
    : `${rlcClientName}(endpointParam, options)`;
    
  return `this._client = ${clientCreation};
    this.pipeline = this._client.pipeline;`;
}

// Export component for use in other files
export { ClientClass as default };
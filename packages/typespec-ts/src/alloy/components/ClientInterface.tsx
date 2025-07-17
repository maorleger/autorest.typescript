// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { code } from "@alloy-js/core";
import { 
  InterfaceDeclaration, 
  CallSignature, 
  TypeAlias, 
  ParameterDeclarationProps 
} from "./BaseTypeScriptComponents.js";

export interface ClientInterfaceProps {
  clientName: string;
  routeSignatures: RouteSignatureProps[];
  shortcutGroups: ShortcutGroupProps[];
  hasClientLevelShortcuts: boolean;
  docs?: string[];
}

export interface RouteSignatureProps {
  pathTemplate: string;
  method: string;
  parameters: ParameterDeclarationProps[];
  returnType: string;
  docs?: string[];
}

export interface ShortcutGroupProps {
  name: string;
  type: string;
  docs?: string[];
}

export interface ShortcutInterfaceProps {
  name: string;
  methods: ShortcutMethodProps[];
  docs?: string[];
}

export interface ShortcutMethodProps {
  name: string;
  parameters: ParameterDeclarationProps[];
  returnType: string;
  docs?: string[];
}

export function ClientInterface({
  clientName,
  routeSignatures,
  shortcutGroups,
  hasClientLevelShortcuts,
  docs
}: ClientInterfaceProps) {
  const shortcutProperties = shortcutGroups.map(group => ({
    name: group.name,
    type: group.type,
    docs: group.docs
  }));
  
  // Build the client type definition
  const clientTypeMembers = [
    "Client",
    `{ path: Routes${shortcutProperties.length > 0 ? `, ${shortcutProperties.map(p => `${p.name}: ${p.type}`).join(", ")}` : ""} }`
  ];
  
  if (hasClientLevelShortcuts) {
    clientTypeMembers.push("ClientOperations");
  }
  
  const clientType = clientTypeMembers.join(" & ");
  
  return code`
${generateRoutesInterface(routeSignatures)}

${generateClientTypeAlias(clientName, clientType, docs)}
`;
}

export function generateRoutesInterface(routeSignatures: RouteSignatureProps[]) {
  return (
    <InterfaceDeclaration
      name="Routes"
      isExported={true}
      docs={["Routes interface for path-first routing"]}
    >
      {routeSignatures.map((signature, index) => (
        <CallSignature
          parameters={signature.parameters}
          returnType={signature.returnType}
          docs={signature.docs}
        />
      ))}
    </InterfaceDeclaration>
  );
}

export function generateClientTypeAlias(clientName: string, clientType: string, docs?: string[]) {
  return (
    <TypeAlias
      name={clientName}
      type={clientType}
      isExported={true}
      docs={docs}
    />
  );
}

export function generateShortcutInterface({
  name,
  methods,
  docs
}: ShortcutInterfaceProps) {
  return (
    <InterfaceDeclaration
      name={name}
      isExported={true}
      docs={docs}
    >
      {methods.map((method, index) => (
        <CallSignature
          parameters={method.parameters}
          returnType={method.returnType}
          docs={method.docs}
        />
      ))}
    </InterfaceDeclaration>
  );
}

export function generateClientInterface(props: ClientInterfaceProps): string {
  const component = ClientInterface(props);
  return String(component);
}

// Helper functions for generating client interface data

export interface ClientInterfaceData {
  clientName: string;
  routeSignatures: RouteSignatureProps[];
  shortcutGroups: ShortcutGroupProps[];
  hasClientLevelShortcuts: boolean;
  docs?: string[];
}

export function createClientInterfaceData(
  clientName: string,
  pathDictionary: any,
  shortcuts: any[],
  operationGroups: any[]
): ClientInterfaceData {
  const routeSignatures = createRouteSignatures(pathDictionary);
  const shortcutGroups = createShortcutGroups(shortcuts, operationGroups);
  const hasClientLevelShortcuts = shortcuts.some(s => s.name === "ClientOperations");
  
  return {
    clientName,
    routeSignatures,
    shortcutGroups,
    hasClientLevelShortcuts,
    docs: [`${clientName} client interface`]
  };
}

function createRouteSignatures(pathDictionary: any): RouteSignatureProps[] {
  const signatures: RouteSignatureProps[] = [];
  
  Object.entries(pathDictionary).forEach(([path, pathInfo]: [string, any]) => {
    pathInfo.operations?.forEach((operation: any) => {
      signatures.push({
        pathTemplate: path,
        method: operation.method,
        parameters: operation.parameters?.map((p: any) => ({
          name: p.name,
          type: p.type,
          isOptional: p.optional,
          docs: p.docs
        })) || [],
        returnType: operation.returnType || "StreamableMethod",
        docs: operation.docs
      });
    });
  });
  
  return signatures;
}

function createShortcutGroups(shortcuts: any[], operationGroups: any[]): ShortcutGroupProps[] {
  return shortcuts
    .filter(shortcut => shortcut.name !== "ClientOperations")
    .map(shortcut => ({
      name: getShortcutPropertyName(shortcut.name),
      type: shortcut.name,
      docs: [`${shortcut.name} operations`]
    }));
}

function getShortcutPropertyName(interfaceName: string): string {
  // Convert interface name to property name (e.g., "UserOperations" -> "user")
  return interfaceName.replace(/Operations$/, "").toLowerCase();
}

// Export component for use in other files
export { ClientInterface as default };
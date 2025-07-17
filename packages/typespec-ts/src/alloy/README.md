# Production-Ready Alloy Integration

This directory contains a complete, production-ready implementation of Alloy-based code generation for TypeScript clients. This implementation addresses all architectural concerns and provides a robust, scalable solution for complex TypeScript code generation.

## 🏗️ Architecture Overview

### Core Components

#### 1. **Render Pipeline** (`core/render.ts`)
- Production-ready Alloy render pipeline with proper error handling
- Async rendering with component composition
- TypeScript package creation utilities
- Comprehensive error handling with fallbacks

#### 2. **Reference Management** (`core/references.ts`)
- Proper refkey-based reference tracking
- Cross-component reference resolution
- Generation context management
- Reference lifecycle management

#### 3. **Error Handling** (`core/errorHandling.ts`)
- Intelligent error recovery with retry logic
- Automatic fallback to ts-morph when Alloy fails
- Error statistics and monitoring
- Prerequisite validation

### Production Components

#### 1. **Client Class Generation** (`components/ProductionClientClass.tsx`)
- Uses proper Alloy `ClassDeclaration`, `ClassField`, `ClassMethod` components
- Proper refkey integration for cross-references
- Complete source file generation with imports
- Support for multi-endpoint clients

#### 2. **Client Interface Generation** (`components/ProductionClientInterface.tsx`)
- Uses proper Alloy `InterfaceDeclaration`, `TypeDeclaration` components
- Routes interface generation with proper signatures
- Operation group interface handling
- Client type definition with proper intersection types

#### 3. **Operation Function Generation** (`components/ProductionOperationFunction.tsx`)
- Main operation function with LRO and paging support
- Send function for HTTP request handling
- Deserialize function for response processing
- Complete source file generation with proper imports

### Integration Layer

#### **Builder Integration** (`integration/builderIntegration.ts`)
- Real integration with existing builders
- Conditional Alloy usage based on feature flags
- Automatic fallback to ts-morph implementations
- Complete package generation

### Testing & Validation

#### **Output Equivalence Testing** (`testing/outputEquivalence.ts`)
- Comprehensive validation of Alloy vs ts-morph output
- Semantic equivalence checking
- Detailed difference reporting
- Automated test suite

## 🚀 Usage

### Basic Usage

```typescript
import { AlloyBuilderIntegration } from "./integration/builderIntegration.js";
import { RLCModel } from "@azure-tools/rlc-common";

const model: RLCModel = {
  // Your model configuration
  options: {
    useAlloyCodeGeneration: true
  }
};

const integration = new AlloyBuilderIntegration(model);

// Generate client definitions
const clientDefinitions = await integration.buildClientDefinitions();

// Generate client class
const clientClass = await integration.buildClientClass([[], {}]);

// Generate operation functions
const operations = extractOperationsFromModel(model);
const operationFiles = await integration.buildOperationFunctions(operations);
```

### Feature Flags

Enable Alloy code generation through:

```typescript
// RLCOptions
{
  useAlloyCodeGeneration: true,
  useAlloyPackageJson: true
}

// Environment variables
process.env.TYPESPEC_USE_ALLOY_CODE_GENERATION = "true";
process.env.TYPESPEC_USE_ALLOY_PACKAGE_JSON = "true";
```

### Error Handling

```typescript
import { withErrorHandling } from "./core/errorHandling.js";

const result = await withErrorHandling(
  "client_generation",
  async () => {
    // Alloy implementation
    return await generateWithAlloy();
  },
  () => {
    // Fallback implementation
    return generateWithTsMorph();
  },
  model
);
```

## 🔧 Key Features

### 1. **Production-Ready Architecture**
- ✅ Proper component composition using Alloy's JSX system
- ✅ Reference tracking with refkey for cross-component references
- ✅ Comprehensive error handling with intelligent fallbacks
- ✅ Real integration with existing builders
- ✅ Automatic prerequisite validation

### 2. **Robust Error Handling**
- ✅ Retry logic with exponential backoff
- ✅ Automatic fallback to ts-morph when Alloy fails
- ✅ Error statistics and monitoring
- ✅ Context-aware error recovery

### 3. **Complete Test Coverage**
- ✅ Output equivalence validation
- ✅ Semantic equivalence checking
- ✅ Automated test suite
- ✅ Difference reporting

### 4. **Scalable Integration**
- ✅ Conditional usage based on feature flags
- ✅ Gradual rollout support
- ✅ Backward compatibility
- ✅ Performance monitoring

## 📊 Performance & Monitoring

### Error Statistics
```typescript
const errorHandler = AlloyErrorHandler.getInstance();
const stats = errorHandler.getErrorStatistics();
console.log(`Total errors: ${stats.totalErrors}`);
console.log(`Errors by context:`, stats.errorsByContext);
```

### Validation Results
```typescript
const validationResults = await validateAlloyOutput(model);
console.log(`${validationResults.passedTests}/${validationResults.totalTests} tests passed`);
```

## 🛡️ Safety Features

### 1. **Automatic Fallbacks**
- If Alloy fails, automatically falls back to ts-morph
- Intelligent error threshold management
- Context-aware recovery strategies

### 2. **Prerequisite Validation**
- Validates required dependencies
- Checks TypeScript configuration
- Validates model structure

### 3. **Error Recovery**
- Retry logic with exponential backoff
- Error categorization and appropriate handling
- Comprehensive error logging

## 🔄 Migration Strategy

### Phase 1: Enable Feature Flags
```typescript
{
  useAlloyCodeGeneration: true  // Enable Alloy generation
}
```

### Phase 2: Monitor and Validate
```typescript
const validationResults = await validateAlloyOutput(model);
// Ensure output equivalence
```

### Phase 3: Gradual Rollout
- Start with low-risk scenarios
- Monitor error rates
- Gradually increase usage

## 🎯 Generated Code Examples

### Client Class
```typescript
export class UserManagementClient {
  private _client: UserManagement;
  public readonly pipeline: Pipeline;

  constructor(endpointParam: string, options?: UserManagementClientOptionalParams) {
    this._client = UserManagement(endpointParam, options);
    this.pipeline = this._client.pipeline;
  }

  async getUser(userId: string, options?: GetUserOptions): Promise<GetUserResponse> {
    return getUserOperation(this._client, userId, options);
  }
}
```

### Client Interface
```typescript
export interface Routes {
  (path: "/users/{userId}", userId: string): StreamableMethod<GetUserResponse>;
}

export type UserManagement = Client & { 
  path: Routes, 
  user: UserOperations 
} & ClientOperations;
```

### Operation Function
```typescript
export async function getUser(
  context: Client,
  userId: string,
  options?: GetUserOptions
): Promise<GetUserResponse> {
  const result = await _getUserSend(context, userId, options);
  return _getUserDeserialize(result);
}
```

## 📝 Testing

Run the production demo:
```bash
npx tsx src/alloy/production-demo.ts
```

Run validation tests:
```bash
npx tsx -e "import('./testing/outputEquivalence.js').then(m => m.validateAlloyOutput(model))"
```

## 🎉 Benefits

1. **Component-Based Architecture**: True component composition using Alloy's JSX system
2. **Reference Management**: Proper cross-component references with refkey
3. **Error Resilience**: Automatic fallbacks ensure reliability
4. **Production Ready**: Comprehensive error handling and monitoring
5. **Scalable**: Gradual rollout with feature flags
6. **Maintainable**: Clean architecture with proper separation of concerns
7. **Testable**: Comprehensive test coverage with output validation

This implementation provides a solid foundation for complex TypeScript code generation while maintaining backward compatibility and ensuring production reliability.
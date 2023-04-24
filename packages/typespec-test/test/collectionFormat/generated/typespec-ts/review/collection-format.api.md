## API Report File for "@azure-rest/collection-format"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Client } from '@azure-rest/core-client';
import { ClientOptions } from '@azure-rest/core-client';
import { HttpResponse } from '@azure-rest/core-client';
import { RequestParameters } from '@azure-rest/core-client';
import { StreamableMethod } from '@azure-rest/core-client';

// @public (undocumented)
export function buildMultiCollection(queryParameters: string[], parameterName: string): string;

// @public (undocumented)
export type CollectionFormatTestServiceClient = Client & {
    path: Routes;
};

// @public
function createClient(endpoint: string, options?: ClientOptions): CollectionFormatTestServiceClient;
export default createClient;

// @public (undocumented)
export interface Routes {
    (path: "/collectionFormat/multi"): TestMulti;
    (path: "/collectionFormat/csv"): TestCsv;
}

// @public (undocumented)
export interface TestCsv {
    // (undocumented)
    get(options: TestCsvParameters): StreamableMethod<TestCsv200Response>;
}

// @public
export interface TestCsv200Response extends HttpResponse {
    // (undocumented)
    body: string;
    // (undocumented)
    status: "200";
}

// @public (undocumented)
export type TestCsvParameters = TestCsvQueryParam & RequestParameters;

// @public (undocumented)
export interface TestCsvQueryParam {
    // (undocumented)
    queryParameters: TestCsvQueryParamProperties;
}

// @public (undocumented)
export interface TestCsvQueryParamProperties {
    // (undocumented)
    colors: string[];
}

// @public (undocumented)
export interface TestMulti {
    // (undocumented)
    get(options: TestMultiParameters): StreamableMethod<TestMulti200Response>;
}

// @public
export interface TestMulti200Response extends HttpResponse {
    // (undocumented)
    body: string;
    // (undocumented)
    status: "200";
}

// @public (undocumented)
export type TestMultiParameters = TestMultiQueryParam & RequestParameters;

// @public (undocumented)
export interface TestMultiQueryParam {
    // (undocumented)
    queryParameters: TestMultiQueryParamProperties;
}

// @public (undocumented)
export interface TestMultiQueryParamProperties {
    colors: string;
}

// (No @packageDocumentation comment for this package)

```
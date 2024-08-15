import { Client } from '@azure-rest/core-client';
import { ClientOptions } from '@azure-rest/core-client';
import { HttpResponse } from '@azure-rest/core-client';
import { RawHttpHeadersInput } from '@azure/core-rest-pipeline';
import { RequestParameters } from '@azure-rest/core-client';
import { StreamableMethod } from '@azure-rest/core-client';

export declare function buildCsvCollection(items: string[] | number[]): string;

export declare function buildMultiCollection(items: string[], parameterName: string): string;

export declare function buildPipeCollection(items: string[] | number[]): string;

export declare function buildSsvCollection(items: string[] | number[]): string;

export declare function buildTsvCollection(items: string[] | number[]): string;

export declare type CollectionFormatClient = Client & {
    path: Routes;
};

export declare interface CollectionFormatClientOptions extends ClientOptions {
}

declare function createClient(options?: CollectionFormatClientOptions): CollectionFormatClient;
export default createClient;

export declare interface HeaderCsv {
    get(options: HeaderCsvParameters): StreamableMethod<HeaderCsv204Response>;
}

export declare interface HeaderCsv204Response extends HttpResponse {
    status: "204";
}

export declare interface HeaderCsvHeaderParam {
    headers: RawHttpHeadersInput & HeaderCsvHeaders;
}

export declare interface HeaderCsvHeaders {
    colors: string;
}

export declare type HeaderCsvParameters = HeaderCsvHeaderParam & RequestParameters;

export declare interface QueryCsv {
    get(options: QueryCsvParameters): StreamableMethod<QueryCsv204Response>;
}

export declare interface QueryCsv204Response extends HttpResponse {
    status: "204";
}

export declare type QueryCsvParameters = QueryCsvQueryParam & RequestParameters;

export declare interface QueryCsvQueryParam {
    queryParameters: QueryCsvQueryParamProperties;
}

export declare interface QueryCsvQueryParamProperties {
    colors: string[];
}

export declare interface QueryMulti {
    get(options: QueryMultiParameters): StreamableMethod<QueryMulti204Response>;
}

export declare interface QueryMulti204Response extends HttpResponse {
    status: "204";
}

export declare type QueryMultiParameters = QueryMultiQueryParam & RequestParameters;

export declare interface QueryMultiQueryParam {
    queryParameters: QueryMultiQueryParamProperties;
}

export declare interface QueryMultiQueryParamProperties {
    colors: string;
}

export declare interface QueryPipes {
    get(options: QueryPipesParameters): StreamableMethod<QueryPipes204Response>;
}

export declare interface QueryPipes204Response extends HttpResponse {
    status: "204";
}

export declare type QueryPipesParameters = QueryPipesQueryParam & RequestParameters;

export declare interface QueryPipesQueryParam {
    queryParameters: QueryPipesQueryParamProperties;
}

export declare interface QueryPipesQueryParamProperties {
    colors: string;
}

export declare interface QuerySsv {
    get(options: QuerySsvParameters): StreamableMethod<QuerySsv204Response>;
}

export declare interface QuerySsv204Response extends HttpResponse {
    status: "204";
}

export declare type QuerySsvParameters = QuerySsvQueryParam & RequestParameters;

export declare interface QuerySsvQueryParam {
    queryParameters: QuerySsvQueryParamProperties;
}

export declare interface QuerySsvQueryParamProperties {
    colors: string;
}

export declare interface QueryTsv {
    get(options: QueryTsvParameters): StreamableMethod<QueryTsv204Response>;
}

export declare interface QueryTsv204Response extends HttpResponse {
    status: "204";
}

export declare type QueryTsvParameters = QueryTsvQueryParam & RequestParameters;

export declare interface QueryTsvQueryParam {
    queryParameters: QueryTsvQueryParamProperties;
}

export declare interface QueryTsvQueryParamProperties {
    colors: string;
}

export declare interface Routes {
    (path: "/parameters/collection-format/query/multi"): QueryMulti;
    (path: "/parameters/collection-format/query/ssv"): QuerySsv;
    (path: "/parameters/collection-format/query/tsv"): QueryTsv;
    (path: "/parameters/collection-format/query/pipes"): QueryPipes;
    (path: "/parameters/collection-format/query/csv"): QueryCsv;
    (path: "/parameters/collection-format/header/csv"): HeaderCsv;
}

export { }
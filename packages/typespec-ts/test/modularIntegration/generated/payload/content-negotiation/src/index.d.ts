import { ClientOptions } from '@typespec/ts-http-runtime';
import { OperationOptions } from '@typespec/ts-http-runtime';
import { Pipeline } from '@typespec/ts-http-runtime';

export declare class ContentNegotiationClient {
    private _client;
    readonly pipeline: Pipeline;
    constructor(options?: ContentNegotiationClientOptionalParams);
    readonly differentBody: DifferentBodyOperations;
    readonly sameBody: SameBodyOperations;
}

export declare interface ContentNegotiationClientOptionalParams extends ClientOptions {
}

export declare interface DifferentBodyGetAvatarAsJsonOptionalParams extends OperationOptions {
}

export declare interface DifferentBodyGetAvatarAsPngOptionalParams extends OperationOptions {
}

export declare interface DifferentBodyOperations {
    getAvatarAsJson: (options?: DifferentBodyGetAvatarAsJsonOptionalParams) => Promise<PngImageAsJson>;
    getAvatarAsPng: (options?: DifferentBodyGetAvatarAsPngOptionalParams) => Promise<Uint8Array>;
}

export declare interface PngImageAsJson {
    content: Uint8Array;
}

export declare interface SameBodyGetAvatarAsJpegOptionalParams extends OperationOptions {
}

export declare interface SameBodyGetAvatarAsPngOptionalParams extends OperationOptions {
}

export declare interface SameBodyOperations {
    getAvatarAsJpeg: (options?: SameBodyGetAvatarAsJpegOptionalParams) => Promise<Uint8Array>;
    getAvatarAsPng: (options?: SameBodyGetAvatarAsPngOptionalParams) => Promise<Uint8Array>;
}

export { }

/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import * as coreHttp from "@azure/core-http";

/** Known values of {@link IntEnum} that the service accepts. */
export const enum KnownIntEnum {
  TwoHundred = 200,
  FourHundredThree = 403,
  FourHundredFive = 405,
  FourHundredSix = 406,
  FourHundredTwentyNine = 429
}

/**
 * Defines values for IntEnum. \
 * {@link KnownIntEnum} can be used interchangeably with IntEnum,
 *  this enum contains the known values that the service supports.
 * ### Know values supported by the service
 * **200** \
 * **403** \
 * **405** \
 * **406** \
 * **429**
 */
export type IntEnum = number;

/** Known values of {@link FloatEnum} that the service accepts. */
export const enum KnownFloatEnum {
  TwoHundred4 = 200.4,
  FourHundredThree4 = 403.4,
  FourHundredFive3 = 405.3,
  FourHundredSix2 = 406.2,
  FourHundredTwentyNine1 = 429.1
}

/**
 * Defines values for FloatEnum. \
 * {@link KnownFloatEnum} can be used interchangeably with FloatEnum,
 *  this enum contains the known values that the service supports.
 * ### Know values supported by the service
 * **200.4** \
 * **403.4** \
 * **405.3** \
 * **406.2** \
 * **429.1**
 */
export type FloatEnum = number;

/** Optional parameters. */
export interface IntPutOptionalParams extends coreHttp.OperationOptions {
  /** Input int enum. */
  input?: IntEnum;
}

/** Contains response data for the put operation. */
export type IntPutResponse = {
  /** The parsed response body. */
  body: string;

  /** The underlying HTTP response. */
  _response: coreHttp.HttpResponse & {
    /** The response body as text (string format) */
    bodyAsText: string;

    /** The response body as parsed JSON or XML */
    parsedBody: string;
  };
};

/** Contains response data for the get operation. */
export type IntGetResponse = {
  /** The parsed response body. */
  body: IntEnum;

  /** The underlying HTTP response. */
  _response: coreHttp.HttpResponse & {
    /** The response body as text (string format) */
    bodyAsText: string;

    /** The response body as parsed JSON or XML */
    parsedBody: IntEnum;
  };
};

/** Optional parameters. */
export interface FloatPutOptionalParams extends coreHttp.OperationOptions {
  /** Input float enum. */
  input?: FloatEnum;
}

/** Contains response data for the put operation. */
export type FloatPutResponse = {
  /** The parsed response body. */
  body: string;

  /** The underlying HTTP response. */
  _response: coreHttp.HttpResponse & {
    /** The response body as text (string format) */
    bodyAsText: string;

    /** The response body as parsed JSON or XML */
    parsedBody: string;
  };
};

/** Contains response data for the get operation. */
export type FloatGetResponse = {
  /** The parsed response body. */
  body: FloatEnum;

  /** The underlying HTTP response. */
  _response: coreHttp.HttpResponse & {
    /** The response body as text (string format) */
    bodyAsText: string;

    /** The response body as parsed JSON or XML */
    parsedBody: FloatEnum;
  };
};

/** Optional parameters. */
export interface NonStringEnumClientOptionalParams
  extends coreHttp.ServiceClientOptions {
  /** server parameter */
  $host?: string;
  /** Overrides client endpoint. */
  endpoint?: string;
}
/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { Enum } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { BodyStringClient } from "../bodyStringClient";
import {
  EnumGetNotExpandableOptionalParams,
  EnumGetNotExpandableResponse,
  Colors,
  EnumPutNotExpandableOptionalParams,
  EnumGetReferencedOptionalParams,
  EnumGetReferencedResponse,
  EnumPutReferencedOptionalParams,
  EnumGetReferencedConstantOptionalParams,
  EnumGetReferencedConstantResponse,
  RefColorConstant,
  EnumPutReferencedConstantOptionalParams
} from "../models";

/** Class containing Enum operations. */
export class EnumImpl implements Enum {
  private readonly client: BodyStringClient;

  /**
   * Initialize a new instance of the class Enum class.
   * @param client Reference to the service client
   */
  constructor(client: BodyStringClient) {
    this.client = client;
  }

  /**
   * Get enum value 'red color' from enumeration of 'red color', 'green-color', 'blue_color'.
   * @param options The options parameters.
   */
  getNotExpandable(
    options?: EnumGetNotExpandableOptionalParams
  ): Promise<EnumGetNotExpandableResponse> {
    return this.client.sendOperationRequest(
      { options },
      getNotExpandableOperationSpec
    );
  }

  /**
   * Sends value 'red color' from enumeration of 'red color', 'green-color', 'blue_color'
   * @param stringBody string body
   * @param options The options parameters.
   */
  putNotExpandable(
    stringBody: Colors,
    options?: EnumPutNotExpandableOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { stringBody, options },
      putNotExpandableOperationSpec
    );
  }

  /**
   * Get enum value 'red color' from enumeration of 'red color', 'green-color', 'blue_color'.
   * @param options The options parameters.
   */
  getReferenced(
    options?: EnumGetReferencedOptionalParams
  ): Promise<EnumGetReferencedResponse> {
    return this.client.sendOperationRequest(
      { options },
      getReferencedOperationSpec
    );
  }

  /**
   * Sends value 'red color' from enumeration of 'red color', 'green-color', 'blue_color'
   * @param enumStringBody enum string body
   * @param options The options parameters.
   */
  putReferenced(
    enumStringBody: Colors,
    options?: EnumPutReferencedOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { enumStringBody, options },
      putReferencedOperationSpec
    );
  }

  /**
   * Get value 'green-color' from the constant.
   * @param options The options parameters.
   */
  getReferencedConstant(
    options?: EnumGetReferencedConstantOptionalParams
  ): Promise<EnumGetReferencedConstantResponse> {
    return this.client.sendOperationRequest(
      { options },
      getReferencedConstantOperationSpec
    );
  }

  /**
   * Sends value 'green-color' from a constant
   * @param enumStringBody enum string body
   * @param options The options parameters.
   */
  putReferencedConstant(
    enumStringBody: RefColorConstant,
    options?: EnumPutReferencedConstantOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { enumStringBody, options },
      putReferencedConstantOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getNotExpandableOperationSpec: coreClient.OperationSpec = {
  path: "/string/enum/notExpandable",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Enum",
          allowedValues: ["red color", "green-color", "blue_color"]
        }
      }
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const putNotExpandableOperationSpec: coreClient.OperationSpec = {
  path: "/string/enum/notExpandable",
  httpMethod: "PUT",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  requestBody: Parameters.stringBody5,
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getReferencedOperationSpec: coreClient.OperationSpec = {
  path: "/string/enum/Referenced",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Enum",
          allowedValues: ["red color", "green-color", "blue_color"]
        }
      }
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const putReferencedOperationSpec: coreClient.OperationSpec = {
  path: "/string/enum/Referenced",
  httpMethod: "PUT",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  requestBody: Parameters.enumStringBody,
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getReferencedConstantOperationSpec: coreClient.OperationSpec = {
  path: "/string/enum/ReferencedConstant",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.RefColorConstant
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const putReferencedConstantOperationSpec: coreClient.OperationSpec = {
  path: "/string/enum/ReferencedConstant",
  httpMethod: "PUT",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  requestBody: Parameters.enumStringBody1,
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
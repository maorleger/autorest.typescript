/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import {
  OperationParameter,
  OperationURLParameter,
  OperationQueryParameter
} from "@azure/core-client";
import { BodyParam as BodyParamMapper } from "../models/mappers";

export const accept: OperationParameter = {
  parameterPath: "accept",
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Accept",
    type: {
      name: "String"
    }
  }
};

export const $host: OperationURLParameter = {
  parameterPath: "$host",
  mapper: {
    serializedName: "$host",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const contentType: OperationParameter = {
  parameterPath: ["options", "contentType"],
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Content-Type",
    type: {
      name: "String"
    }
  }
};

export const parameters: OperationParameter = {
  parameterPath: "parameters",
  mapper: BodyParamMapper
};

export const clientRequestId: OperationParameter = {
  parameterPath: ["options", "clientRequestId"],
  mapper: {
    serializedName: "client-request-id",
    type: {
      name: "String"
    }
  }
};

export const maxresults: OperationParameter = {
  parameterPath: ["options", "pagingGetMultiplePagesOptions", "maxresults"],
  mapper: {
    serializedName: "maxresults",
    type: {
      name: "Number"
    }
  }
};

export const timeout: OperationParameter = {
  parameterPath: ["options", "pagingGetMultiplePagesOptions", "timeout"],
  mapper: {
    defaultValue: 30,
    serializedName: "timeout",
    type: {
      name: "Number"
    }
  }
};

export const requiredQueryParameter: OperationQueryParameter = {
  parameterPath: "requiredQueryParameter",
  mapper: {
    serializedName: "requiredQueryParameter",
    required: true,
    type: {
      name: "Number"
    }
  }
};

export const queryConstant: OperationQueryParameter = {
  parameterPath: "queryConstant",
  mapper: {
    defaultValue: true,
    isConstant: true,
    serializedName: "queryConstant",
    type: {
      name: "Boolean"
    }
  }
};

export const filter: OperationQueryParameter = {
  parameterPath: ["options", "filter"],
  mapper: {
    serializedName: "$filter",
    type: {
      name: "String"
    }
  }
};

export const maxpagesize: OperationQueryParameter = {
  parameterPath: ["options", "maxpagesize"],
  mapper: {
    defaultValue: "5",
    isConstant: true,
    serializedName: "$maxpagesize",
    type: {
      name: "String"
    }
  }
};

export const maxresults1: OperationParameter = {
  parameterPath: [
    "options",
    "pagingGetOdataMultiplePagesOptions",
    "maxresults"
  ],
  mapper: {
    serializedName: "maxresults",
    type: {
      name: "Number"
    }
  }
};

export const timeout1: OperationParameter = {
  parameterPath: ["options", "pagingGetOdataMultiplePagesOptions", "timeout"],
  mapper: {
    defaultValue: 30,
    serializedName: "timeout",
    type: {
      name: "Number"
    }
  }
};

export const maxresults2: OperationParameter = {
  parameterPath: ["pagingGetMultiplePagesWithOffsetOptions", "maxresults"],
  mapper: {
    serializedName: "maxresults",
    type: {
      name: "Number"
    }
  }
};

export const offset: OperationURLParameter = {
  parameterPath: ["pagingGetMultiplePagesWithOffsetOptions", "offset"],
  mapper: {
    serializedName: "offset",
    required: true,
    type: {
      name: "Number"
    }
  }
};

export const timeout2: OperationParameter = {
  parameterPath: ["pagingGetMultiplePagesWithOffsetOptions", "timeout"],
  mapper: {
    defaultValue: 30,
    serializedName: "timeout",
    type: {
      name: "Number"
    }
  }
};

export const apiVersion: OperationQueryParameter = {
  parameterPath: "apiVersion",
  mapper: {
    serializedName: "api_version",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const tenant: OperationURLParameter = {
  parameterPath: "tenant",
  mapper: {
    serializedName: "tenant",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const apiVersion1: OperationQueryParameter = {
  parameterPath: ["customParameterGroup", "apiVersion"],
  mapper: {
    serializedName: "api_version",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const tenant1: OperationURLParameter = {
  parameterPath: ["customParameterGroup", "tenant"],
  mapper: {
    serializedName: "tenant",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const maxresults3: OperationParameter = {
  parameterPath: ["options", "pagingGetMultiplePagesLroOptions", "maxresults"],
  mapper: {
    serializedName: "maxresults",
    type: {
      name: "Number"
    }
  }
};

export const timeout3: OperationParameter = {
  parameterPath: ["options", "pagingGetMultiplePagesLroOptions", "timeout"],
  mapper: {
    defaultValue: 30,
    serializedName: "timeout",
    type: {
      name: "Number"
    }
  }
};

export const apiVersion2: OperationQueryParameter = {
  parameterPath: "apiVersion",
  mapper: {
    defaultValue: "1.0.0",
    isConstant: true,
    serializedName: "api-version",
    type: {
      name: "String"
    }
  }
};

export const nextLink: OperationURLParameter = {
  parameterPath: "nextLink",
  mapper: {
    serializedName: "nextLink",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};
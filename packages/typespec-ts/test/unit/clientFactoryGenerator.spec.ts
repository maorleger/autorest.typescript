import { assert } from "chai";
import { emitClientFactoryFromCadl } from "./util/emitUtil.js";
import { assertEqualContent } from "./util/testUtil.js";

describe("Client Factory generation", () => {
  describe("should handle url parameters", () => {
    it("should handle zero parameter", async () => {
      const models = await emitClientFactoryFromCadl(`
      @server(
        "localhost",
        "Language Service"
      )
      @service( {title: "PetStoreClient"})
      namespace PetStore;
      `);
      assert.ok(models);
      assertEqualContent(
        models!.content,
        `
        import { getClient, ClientOptions } from "@azure-rest/core-client";
        import { testClient } from "./clientDefinitions";
        
        /**
         * Initialize a new instance of \`testClient\`
         * @param options type: ClientOptions, the parameter for all optional parameters
         */
        export default function createClient(options: ClientOptions = {}): testClient {
        const baseUrl = options.baseUrl ?? \`localhost\`;
        
        const userAgentInfo = \`azsdk-js--rest/1.0.0-beta.1\`;
        const userAgentPrefix =
            options.userAgentOptions && options.userAgentOptions.userAgentPrefix
            ? \`\${options.userAgentOptions.userAgentPrefix} \${userAgentInfo}\`
            : \`\${userAgentInfo}\`;
        options = {
            ...options,
            userAgentOptions: {
            userAgentPrefix,
            },
        };
        
        const client = getClient(baseUrl, options) as testClient;
        
        return client;
    }
    `
      );
    });
    it("should handle one parameter", async () => {
      const models = await emitClientFactoryFromCadl(`
          @server(
            "{Endpoint}/language",
            "Language Service",
            {
              Endpoint: Endpoint,
            }
          )
          @service( {title: "PetStoreClient"})
          namespace PetStore;
          @doc("The endpoint to use.")
          scalar Endpoint extends string;
          `);
      assert.ok(models);
      assertEqualContent(
        models!.content,
        `
          import { getClient, ClientOptions } from "@azure-rest/core-client";
          import { testClient } from "./clientDefinitions";

          /**
           * Initialize a new instance of \`testClient\`
           * @param endpoint type: string, The endpoint to use.
           * @param options type: ClientOptions, the parameter for all optional parameters
           */
          export default function createClient(
            endpoint: string,
            options: ClientOptions = {}
          ): testClient {
            const baseUrl = options.baseUrl ?? \`\${endpoint}/language\`;
          
            const userAgentInfo = \`azsdk-js--rest/1.0.0-beta.1\`;
            const userAgentPrefix =
              options.userAgentOptions && options.userAgentOptions.userAgentPrefix
                ? \`\${options.userAgentOptions.userAgentPrefix} \${userAgentInfo}\`
                : \`\${userAgentInfo}\`;
            options = {
              ...options,
              userAgentOptions: {
                userAgentPrefix,
              },
            };
          
            const client = getClient(baseUrl, options) as testClient;
          
            return client;
        }
        `
      );
    });

    it("should handle two parameters", async () => {
      const models = await emitClientFactoryFromCadl(
        `
            @server(
              "{Endpoint}/language/{Version}",
              "Language Service",
              {
                Endpoint: Endpoint,
                Version: Version
              }
            )
            @service( {title: "PetStoreClient"})
            namespace PetStore;
            @doc("The endpoint to use.")
            scalar Endpoint extends string;

            #suppress "@azure-tools/typespec-azure-core/use-extensible-enum" "for test"
            @doc("The version to use")
            @fixed
            enum Version {
              V1,
              V2
            }
            `,
        true
      );
      assert.ok(models);
      assertEqualContent(
        models!.content,
        `
            import { getClient, ClientOptions } from "@azure-rest/core-client";
            import { testClient } from "./clientDefinitions";
            
            /**
             * Initialize a new instance of \`testClient\`
             * @param endpoint type: string, The endpoint to use.
             * @param version type: "V1"|"V2", The version to use
             * @param options type: ClientOptions, the parameter for all optional parameters
             */
            export default function createClient(
              endpoint: string,
              version: "V1" | "V2",
              options: ClientOptions = {}
            ): testClient {
              const baseUrl = options.baseUrl ?? \`\${endpoint}/language/\${version}\`;
            
              const userAgentInfo = \`azsdk-js--rest/1.0.0-beta.1\`;
              const userAgentPrefix =
                options.userAgentOptions && options.userAgentOptions.userAgentPrefix
                  ? \`\${options.userAgentOptions.userAgentPrefix} \${userAgentInfo}\`
                  : \`\${userAgentInfo}\`;
              options = {
                ...options,
                userAgentOptions: {
                  userAgentPrefix,
                },
              };
            
              const client = getClient(baseUrl, options) as testClient;
            
              return client;
          }
          `
      );
    });
    it("should handle extensible enums in host parameters", async () => {
      const models = await emitClientFactoryFromCadl(
        `
            @server(
              "{Endpoint}/language/{Version}",
              "Language Service",
              {
                Endpoint: Endpoint,
                Version: Versions
              }
            )
            @service( {title: "PetStoreClient"})
            namespace PetStore;
            @doc("The endpoint to use.")
            scalar Endpoint extends string;

            @doc("The version to use.")
            enum Versions {
              v1_1: "v1.1",
            }
            `,
        true
      );
      assert.ok(models);
      assertEqualContent(
        models!.content,
        `
            import { getClient, ClientOptions } from "@azure-rest/core-client";
            import { testClient } from "./clientDefinitions";
            
            /**
             * Initialize a new instance of \`testClient\`
             * @param endpoint type: string, The endpoint to use.
             * @param version type: string, The version to use. Possible values: v1.1
             * @param options type: ClientOptions, the parameter for all optional parameters
             */
            export default function createClient(
              endpoint: string,
              version: string,
              options: ClientOptions = {}
            ): testClient {
              const baseUrl = options.baseUrl ?? \`\${endpoint}/language/\${version}\`;
            
              const userAgentInfo = \`azsdk-js--rest/1.0.0-beta.1\`;
              const userAgentPrefix =
                options.userAgentOptions && options.userAgentOptions.userAgentPrefix
                  ? \`\${options.userAgentOptions.userAgentPrefix} \${userAgentInfo}\`
                  : \`\${userAgentInfo}\`;
              options = {
                ...options,
                userAgentOptions: {
                  userAgentPrefix,
                },
              };
            
              const client = getClient(baseUrl, options) as testClient;
            
              return client;
          }
          `
      );
    });
  });

  describe("should handle no @server definition", () => {
    it("should set default endpoint parameter when no @server", async () => {
      const models = await emitClientFactoryFromCadl(`
      @service( {title: "PetStoreClient"})
      namespace PetStore;
      `);
      assert.ok(models);
      assertEqualContent(
        models!.content,
        `
        import { getClient, ClientOptions } from "@azure-rest/core-client";
        import { testClient } from "./clientDefinitions";
        
        /**
         * Initialize a new instance of \`testClient\`
         * @param endpoint type: string, The parameter endpoint
         * @param options type: ClientOptions, the parameter for all optional parameters
         */
        export default function createClient(endpoint: string, options: ClientOptions = {}): testClient {
        const baseUrl = options.baseUrl ?? \`\${endpoint}\`;
        
        const userAgentInfo = \`azsdk-js--rest/1.0.0-beta.1\`;
        const userAgentPrefix =
            options.userAgentOptions && options.userAgentOptions.userAgentPrefix
            ? \`\${options.userAgentOptions.userAgentPrefix} \${userAgentInfo}\`
            : \`\${userAgentInfo}\`;
        options = {
            ...options,
            userAgentOptions: {
            userAgentPrefix,
            },
        };
        
        const client = getClient(baseUrl, options) as testClient;
        
        return client;
    }
    `
      );
    });
  });

  describe("should handle different auth options", () => {
    it("should not generate credential if scope is empty", async () => {
      const models = await emitClientFactoryFromCadl(`
      @useAuth(
        OAuth2Auth<[{
          type: OAuth2FlowType.implicit,
          authorizationUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
          scopes: []
        }]>)
      @service( {title: "PetStoreClient"})
      namespace PetStore;
      `);
      assert.ok(models);
      assertEqualContent(
        models!.content,
        `
        import { getClient, ClientOptions } from "@azure-rest/core-client";
        import { testClient } from "./clientDefinitions";
        
        /**
         * Initialize a new instance of \`testClient\`
         * @param endpoint type: string, The parameter endpoint
         * @param options type: ClientOptions, the parameter for all optional parameters
         */
        export default function createClient(endpoint: string, options: ClientOptions = {}): testClient {
        const baseUrl = options.baseUrl ?? \`\${endpoint}\`;
        
        const userAgentInfo = \`azsdk-js--rest/1.0.0-beta.1\`;
        const userAgentPrefix =
            options.userAgentOptions && options.userAgentOptions.userAgentPrefix
            ? \`\${options.userAgentOptions.userAgentPrefix} \${userAgentInfo}\`
            : \`\${userAgentInfo}\`;
        options = {
            ...options,
            userAgentOptions: {
            userAgentPrefix,
            },
        };
        
        const client = getClient(baseUrl, options) as testClient;
        
        return client;
    }
    `
      );
    });

    it("should generate both credentials if both defined", async () => {
      const models = await emitClientFactoryFromCadl(`
      @useAuth(
        ApiKeyAuth<ApiKeyLocation.header, "apiKey"> |
          OAuth2Auth<[{
            type: OAuth2FlowType.implicit,
            authorizationUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            scopes: ["https://petstor.com/default"]
          }]>)
      @service( {title: "PetStoreClient"})
      namespace PetStore;
      `);
      assert.ok(models);
      assertEqualContent(
        models!.content,
        `
        import { getClient, ClientOptions } from "@azure-rest/core-client";
        import { TokenCredential, KeyCredential } from "@azure/core-auth";
        import { testClient } from "./clientDefinitions";
        
        /**
         * Initialize a new instance of \`testClient\`
         * @param endpoint type: string, The parameter endpoint
         * @param credentials type: TokenCredential|KeyCredential, uniquely identify client credential
         * @param options type: ClientOptions, the parameter for all optional parameters
         */
        export default function createClient(endpoint: string, credentials: TokenCredential | KeyCredential, options: ClientOptions = {}): testClient {
        const baseUrl = options.baseUrl ?? \`\${endpoint}\`;

        options = {
            ...options,
            credentials: {
              scopes: ["https://petstor.com/default"],
              apiKeyHeaderName: "apiKey",
            },
          };
        
        const userAgentInfo = \`azsdk-js--rest/1.0.0-beta.1\`;
        const userAgentPrefix =
            options.userAgentOptions && options.userAgentOptions.userAgentPrefix
            ? \`\${options.userAgentOptions.userAgentPrefix} \${userAgentInfo}\`
            : \`\${userAgentInfo}\`;
        options = {
            ...options,
            userAgentOptions: {
            userAgentPrefix,
            },
        };
        
        const client = getClient(baseUrl, credentials, options) as testClient;
        
        return client;
    }
    `
      );
    });
  });
});
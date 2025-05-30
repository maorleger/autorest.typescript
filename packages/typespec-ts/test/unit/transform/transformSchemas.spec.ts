import { ObjectSchema } from "@azure-tools/rlc-common";
import { emitSchemasFromTypeSpec } from "../../util/emitUtil.js";
import { assert } from "chai";

describe("#transformSchemas", () => {
  async function verifyFirstProperty(tspType: string) {
    const schemaOutput = await emitSchemasFromTypeSpec(`
      model Test {
          prop: ${tspType};
      }
      @route("/models")
      @get
      op getModel(@body input: Test): Test;
    `);
    assert.isNotNull(schemaOutput);
    const first = schemaOutput?.[0] as ObjectSchema;
    assert.deepEqual(first.usage, ["input", "output"]);
    assert.strictEqual(first.name, "Test");
    assert.strictEqual(first.type, "object");
    return first.properties![`"prop"`];
  }
  describe("verify general property", () => {
    it("generate string type", async () => {
      const property = await verifyFirstProperty("string");
      assert.isNotNull(property);
      assert.deepEqual(property, {
        type: "string",
        description: undefined,
        required: true,
        usage: ["output", "input"]
      } as any);
    });

    it("generate number type", async () => {
      const property = await verifyFirstProperty("int32");
      assert.isNotNull(property);
      assert.deepEqual(property, {
        type: "number",
        format: "int32",
        description: undefined,
        required: true,
        usage: ["output", "input"]
      } as any);
    });

    it("generate boolean type", async () => {
      const property = await verifyFirstProperty("boolean");
      assert.isNotNull(property);
      assert.strictEqual(property!.type, "boolean");
    });

    it("generate date type", async () => {
      const property = await verifyFirstProperty("utcDateTime");
      assert.isNotNull(property);
      assert.strictEqual(property!.type, "string");
      assert.strictEqual(property!.typeName, "Date | string");
      assert.strictEqual(property!.outputTypeName, "string");
    });

    it("generate string array", async () => {
      const property = await verifyFirstProperty(`string[]`);
      assert.isNotNull(property);
      // console.log(property);
      assert.deepEqual(property, {
        type: "array",
        items: {
          type: "string",
          description: "A sequence of textual characters."
        },
        description: undefined,
        typeName: "string[]",
        usage: ["output", "input"],
        required: true
      } as any);
    });

    it("generate string literal array", async () => {
      const property = await verifyFirstProperty(`"sss"[]`);
      assert.isNotNull(property);
      // console.log(property);
      assert.deepEqual(property, {
        type: "array",
        items: {
          type: `"sss"`,
          isConstant: true
        },
        description: undefined,
        typeName: `"sss"[]`,
        usage: ["output", "input"],
        required: true
      } as any);
    });

    it("generate string literal record", async () => {
      const property = await verifyFirstProperty(`Record<"sss">`);
      assert.isNotNull(property);
      // console.log(property);
      assert.deepEqual(property, {
        type: "dictionary",
        outputTypeName: "Record<string, undefined>",
        outputValueTypeName: "undefined",
        valueTypeName: undefined,
        additionalProperties: {
          type: `"sss"`,
          isConstant: true
        },
        description: undefined,
        typeName: "Record<string, undefined>",
        usage: ["output", "input"],
        required: true
      } as any);
    });

    it("generate string literal", async () => {
      const property = await verifyFirstProperty(`"foo"`);
      assert.isNotNull(property);
      assert.strictEqual(property!.type, `"foo"`);
      assert.isUndefined(property!.typeName);
      assert.isUndefined(property!.outputTypeName);
      assert.strictEqual(property!.isConstant, true);
    });

    it("generate number literal", async () => {
      const property = await verifyFirstProperty(`1`);
      assert.isNotNull(property);
      assert.strictEqual(property!.type, `1`);
      assert.isUndefined(property!.typeName);
      assert.isUndefined(property!.outputTypeName);
      assert.strictEqual(property!.isConstant, true);
    });

    it("generate boolean literal", async () => {
      const property = await verifyFirstProperty(`true`);
      assert.isNotNull(property);
      assert.strictEqual(property!.type, `true`);
      assert.isUndefined(property!.typeName);
      assert.isUndefined(property!.outputTypeName);
      assert.strictEqual(property!.isConstant, true);
    });

    describe("union", () => {
      describe("named union", () => {
        it("should generate a name for union", async () => {
          const schemaOutput = await emitSchemasFromTypeSpec(
            `
            @doc("Translation Language Values")
            union TranslationLanguageValues {
              @doc("English descriptions")
              English: "English",

              @doc("Chinese descriptions")
              Chinese: "Chinese",
            }
            model Test {
              prop: TranslationLanguageValues;
            }
            @route("/models")
            @get
            op getModel(@body input: Test): Test;
          `,
            {
              needAzureCore: true
            }
          );
          assert.isNotNull(schemaOutput);
          const first = schemaOutput?.[0] as ObjectSchema;
          const property = first.properties![`"prop"`];
          // console.log(first, property, property?.enum);
          assert.isNotNull(property);
          assert.deepEqual(property, {
            name: "TranslationLanguageValues",
            type: "object",
            typeName: "TranslationLanguageValues",
            outputTypeName: "TranslationLanguageValuesOutput",
            alias: '"English" | "Chinese"',
            outputAlias: '"English" | "Chinese"',
            required: true,
            usage: ["output", "input"],
            description: undefined,
            enum: [
              {
                isConstant: true,
                type: '"English"'
              },
              {
                isConstant: true,
                type: '"Chinese"'
              }
            ]
          } as any);
        });

        it("union of union should be generated correctly", async () => {
          const schemaOutput = await emitSchemasFromTypeSpec(
            `
            @doc("Translation Language Values")
            union TranslationLanguageValues {
              @doc("English descriptions")
              English: "English",

              @doc("Chinese descriptions")
              Chinese: "Chinese",

              Others: OtherValues
            }

            union OtherValues {
              "Japanese"
            }
            model Test {
              prop: TranslationLanguageValues;
            }
            @route("/models")
            @get
            op getModel(@body input: Test): Test;
          `,
            {
              needAzureCore: true
            }
          );
          assert.isNotNull(schemaOutput);
          const first = schemaOutput?.[0] as ObjectSchema;
          const property = first.properties![`"prop"`];
          // console.log(first, property, property?.enum);
          assert.isNotNull(property);
          assert.deepEqual(property, {
            name: "TranslationLanguageValues",
            type: "object",
            typeName: "TranslationLanguageValues",
            outputTypeName: "TranslationLanguageValuesOutput",
            alias: '"English" | "Chinese" | OtherValues',
            outputAlias: '"English" | "Chinese" | OtherValuesOutput',
            required: true,
            usage: ["output", "input"],
            description: undefined,
            enum: [
              {
                isConstant: true,
                type: '"English"'
              },
              {
                isConstant: true,
                type: '"Chinese"'
              },
              {
                enum: [
                  {
                    isConstant: true,
                    type: '"Japanese"'
                  }
                ],
                name: "OtherValues",
                type: "object",
                typeName: "OtherValues",
                outputTypeName: "OtherValuesOutput",
                alias: '"Japanese"',
                outputAlias: '"Japanese"'
              }
            ]
          } as any);
        });
      });
      describe("anonymous union", () => {
        it("generate literal union", async () => {
          const property = await verifyFirstProperty(`true | "test" | 1`);
          assert.isNotNull(property);
          assert.strictEqual(property!.type, `union`);
          assert.strictEqual(property!.typeName, 'true | "test" | 1');
          assert.strictEqual(property!.outputTypeName, 'true | "test" | 1');
          assert.isUndefined(property!.isConstant);
          assert.strictEqual(property!.enum!.length, 3);
          assert.strictEqual(property!.enum![0].type, "true");
          assert.strictEqual(property!.enum![0].isConstant, true);
        });

        it("generate string literal union", async () => {
          const property = await verifyFirstProperty(`"a" | "test"`);
          assert.isNotNull(property);
          assert.deepEqual(property, {
            enum: [
              { type: '"a"', isConstant: true },
              { type: '"test"', isConstant: true }
            ],
            type: "union",
            typeName: '"a" | "test"',
            outputTypeName: '"a" | "test"',
            required: true,
            usage: ["output", "input"],
            description: undefined
          } as any);
        });

        it("generate primitive union", async () => {
          const property = await verifyFirstProperty(
            `string | int32 | boolean | utcDateTime`
          );
          assert.isNotNull(property);
          // console.log(property);
          assert.deepEqual(property, {
            enum: [
              {
                type: "string",
                description: "A sequence of textual characters."
              },
              { type: "number", format: "int32" },
              { type: "boolean", description: undefined },
              {
                type: "string",
                format: undefined,
                description: undefined,
                typeName: "Date | string",
                outputTypeName: "string"
              }
            ],
            type: "union",
            typeName: "string | number | boolean | Date | string",
            outputTypeName: "string | number | boolean | string",
            required: true,
            usage: ["output", "input"],
            description: undefined
          } as any);
        });
      });
    });

    describe("enum", () => {
      it("should generate enum name", async () => {
        const schemaOutput = await emitSchemasFromTypeSpec(
          `
          #suppress "@azure-tools/typespec-azure-core/use-extensible-enum" "for test"
          @fixed
          @doc("Translation Language Values")
          enum TranslationLanguageValues {
            @doc("English descriptions")
            English,
            @doc("Chinese descriptions")
            Chinese,
          }
          model Test {
              prop: TranslationLanguageValues;
          }
          @route("/models")
          @get
          op getModel(@body input: Test): Test;
        `,
          {
            needAzureCore: true
          }
        );
        assert.isNotNull(schemaOutput);
        const first = schemaOutput?.[0] as ObjectSchema;
        const property = first.properties![`"prop"`];
        // console.log(first, property, property?.enum);
        assert.isNotNull(property);
        assert.deepEqual(property, {
          type: "object",
          name: "TranslationLanguageValues",
          typeName: "TranslationLanguageValues",
          outputTypeName: "TranslationLanguageValuesOutput",
          description: undefined,
          memberType: "string",
          enum: [
            {
              description: "English descriptions",
              isConstant: true,
              type: '"English"'
            },
            {
              description: "Chinese descriptions",
              isConstant: true,
              type: '"Chinese"'
            }
          ],
          alias: '"English" | "Chinese"',
          outputAlias: '"English" | "Chinese"',
          required: true,
          usage: ["output", "input"]
        } as any);
      });

      it("generate enum member", async () => {
        const schemaOutput = await emitSchemasFromTypeSpec(
          `
          @doc("Translation Language Values")
          enum TranslationLanguageValues {
            @doc("English descriptions")
            English,
            @doc("Chinese descriptions")
            Chinese,
          }
          model Test {
              prop: TranslationLanguageValues.English;
          }
          @route("/models")
          @get
          op getModel(@body input: Test): Test;
        `,
          {
            needAzureCore: true
          }
        );
        assert.isNotNull(schemaOutput);
        const first = schemaOutput?.[0] as ObjectSchema;
        const property = first.properties![`"prop"`];
        assert.isNotNull(property);
        assert.deepEqual(property, {
          type: '"English"',
          description: undefined,
          isConstant: true,
          required: true,
          usage: ["output", "input"]
        } as any);
      });
    });

    it("generate union model", async () => {
      const schemaOutput = await emitSchemasFromTypeSpec(
        `
        model A {
          foo: string;
        }
        model B {
          bar: string;
        }
        model Test {
            prop: A | B;
        }
        @route("/models")
        @get
        op getModel(@body input: Test): Test;
      `,
        {
          needAzureCore: true
        }
      );
      assert.isNotNull(schemaOutput);
      const first = schemaOutput?.[0] as ObjectSchema;
      const property = first.properties![`"prop"`];
      // console.log(first, property, property?.enum);
      assert.isNotNull(property);
      assert.deepEqual(property, {
        type: "union",
        outputTypeName: "AOutput | BOutput",
        typeName: "A | B",
        description: undefined,
        enum: [
          {
            name: "A",
            type: "object",
            description: "",
            fromCore: false,
            isMultipartBody: false,
            typeName: "A",
            properties: {},
            outputTypeName: "AOutput",
            usage: ["input", "output"]
          },
          {
            name: "B",
            type: "object",
            description: "",
            fromCore: false,
            isMultipartBody: false,
            typeName: "B",
            properties: {},
            outputTypeName: "BOutput",
            usage: ["input", "output"]
          }
        ],
        required: true,
        usage: ["output", "input"]
      } as any);
    });

    it("generate array model", async () => {
      const schemaOutput = await emitSchemasFromTypeSpec(
        `
        model A {
          foo: string;
        }
        model Test {
            prop: A[];
        }
        @route("/models")
        @get
        op getModel(@body input: Test): Test;
      `,
        {
          needAzureCore: true
        }
      );
      assert.isNotNull(schemaOutput);
      const first = schemaOutput?.[0] as ObjectSchema;
      const property = first.properties![`"prop"`];
      // console.log(first, property, property?.enum);
      assert.isNotNull(property);
      assert.deepEqual(property, {
        type: "array",
        outputTypeName: "Array<AOutput>",
        typeName: "Array<A>",
        description: undefined,
        items: {
          name: "A",
          type: "object",
          description: "",
          fromCore: false,
          isMultipartBody: false,
          typeName: "A",
          properties: {},
          outputTypeName: "AOutput",
          usage: ["input", "output"]
        },
        required: true,
        usage: ["output", "input"]
      } as any);
    });

    it("generate record model", async () => {
      const schemaOutput = await emitSchemasFromTypeSpec(
        `
        model A {
          foo: string;
        }
        model Test {
            prop: Record<A>;
        }
        @route("/models")
        @get
        op getModel(@body input: Test): Test;
      `,
        { needAzureCore: true }
      );
      assert.isNotNull(schemaOutput);
      const first = schemaOutput?.[0] as ObjectSchema;
      const property = first.properties![`"prop"`];
      // console.log(first, property, property?.enum);
      assert.isNotNull(property);
      assert.deepEqual(property, {
        type: "dictionary",
        outputTypeName: "Record<string, AOutput>",
        outputValueTypeName: "AOutput",
        typeName: "Record<string, A>",
        valueTypeName: "A",
        description: undefined,
        additionalProperties: {
          name: "A",
          type: "object",
          description: "",
          fromCore: false,
          isMultipartBody: false,
          typeName: "A",
          properties: {},
          outputTypeName: "AOutput",
          usage: ["input", "output"]
        },
        required: true,
        usage: ["output", "input"]
      } as any);
    });

    it("generate record <union model>", async () => {
      const schemaOutput = await emitSchemasFromTypeSpec(
        `
        model A {
          foo: string;
        }
        model B {
          baz: string;
        }
        model Test {
            prop: Record<A | B>;
        }
        @route("/models")
        @get
        op getModel(@body input: Test): Test;
      `,
        {
          needAzureCore: true
        }
      );
      assert.isNotNull(schemaOutput);
      const first = schemaOutput?.[0] as ObjectSchema;
      const property = first.properties![`"prop"`];
      // console.log(first, property, (property as any)?.additionalProperties);
      assert.isNotNull(property);
      assert.deepEqual(property, {
        type: "dictionary",
        outputTypeName: "Record<string, AOutput | BOutput>",
        typeName: "Record<string, A | B>",
        description: undefined,
        additionalProperties: {
          enum: [
            {
              name: "A",
              type: "object",
              description: "",
              fromCore: false,
              isMultipartBody: false,
              typeName: "A",
              properties: {},
              outputTypeName: "AOutput",
              usage: ["input", "output"]
            },
            {
              name: "B",
              type: "object",
              description: "",
              fromCore: false,
              isMultipartBody: false,
              typeName: "B",
              properties: {},
              outputTypeName: "BOutput",
              usage: ["input", "output"]
            }
          ],
          type: "union",
          typeName: "A | B",
          outputTypeName: "AOutput | BOutput"
        },
        required: true,
        usage: ["output", "input"]
      } as any);
    });
  });

  describe("verify anonymous model", () => {
    it("empty anonymous model", async () => {
      const property = await verifyFirstProperty("{}");
      // console.log(property);
      assert.deepEqual(property, {
        name: "",
        type: "unknown",
        description: undefined,
        fromCore: false,
        isMultipartBody: false,
        typeName: "Record<string, unknown>",
        outputTypeName: "Record<string, any>",
        properties: {},
        usage: ["output", "input"],
        required: true
      } as any);
    });

    it("with simple types", async () => {
      const property = await verifyFirstProperty(`
      {
        /** Description for name */
        name: string;
    
        /** Description for arguments */
        arguments: string;
      }`);
      // console.log(property);
      assert.deepEqual(property, {
        name: "",
        type: "object",
        description: undefined,
        fromCore: false,
        isMultipartBody: false,
        typeName: '{"name": string;"arguments": string;}',
        outputTypeName: '{"name": string;"arguments": string;}',
        properties: {
          '"name"': {
            type: "string",
            description: "Description for name",
            required: true,
            usage: ["output", "input"]
          },
          '"arguments"': {
            type: "string",
            description: "Description for arguments",
            required: true,
            usage: ["output", "input"]
          }
        },
        usage: ["output", "input"],
        required: true
      } as any);
    });

    it("with nested anonymous", async () => {
      const property = await verifyFirstProperty(`
      {
        name:  { foo: { bar: string; } };
      }`);
      // console.log(property);
      assert.deepEqual(property, {
        name: "",
        type: "object",
        description: undefined,
        fromCore: false,
        isMultipartBody: false,
        typeName: '{"name": {"foo": {"bar": string;};};}',
        outputTypeName: '{"name": {"foo": {"bar": string;};};}',
        properties: {
          '"name"': {
            name: "",
            type: "object",
            description: undefined,
            fromCore: false,
            isMultipartBody: false,
            typeName: '{"foo": {"bar": string;};}',
            outputTypeName: '{"foo": {"bar": string;};}',
            required: true,
            usage: ["output", "input"],
            properties: {
              '"foo"': {
                name: "",
                type: "object",
                fromCore: false,
                isMultipartBody: false,
                description: undefined,
                typeName: '{"bar": string;}',
                outputTypeName: '{"bar": string;}',
                required: true,
                usage: ["output", "input"],
                properties: {
                  '"bar"': {
                    type: "string",
                    description: undefined,
                    required: true,
                    usage: ["output", "input"]
                  }
                }
              }
            }
          }
        },
        usage: ["output", "input"],
        required: true
      } as any);
    });

    it("with other models", async () => {
      const property = await verifyFirstProperty(`
      {
        name: Test;
      }`);
      // console.log(property);
      assert.deepEqual(property, {
        name: "",
        type: "object",
        description: undefined,
        fromCore: false,
        isMultipartBody: false,
        typeName: '{"name": Test;}',
        outputTypeName: '{"name": TestOutput;}',
        properties: {
          '"name"': {
            name: "Test",
            type: "object",
            description: undefined,
            fromCore: false,
            isMultipartBody: false,
            typeName: "Test",
            outputTypeName: "TestOutput",
            properties: {},
            usage: ["output", "input"],
            required: true
          }
        },
        usage: ["output", "input"],
        required: true
      } as any);
    });

    it("anonymous model array", async () => {
      const property = await verifyFirstProperty(`
      {
        /** Description for name */
        name: string;
      }[]`);
      // console.log(property);
      assert.deepEqual(property, {
        type: "array",
        description: undefined,
        typeName: '{"name": string;}[]',
        outputTypeName: '{"name": string;}[]',
        usage: ["output", "input"],
        required: true,
        items: {
          name: "",
          type: "object",
          description: "",
          fromCore: false,
          isMultipartBody: false,
          typeName: '{"name": string;}',
          outputTypeName: '{"name": string;}',
          properties: {
            '"name"': {
              type: "string",
              description: "Description for name",
              required: true,
              usage: ["output", "input"]
            }
          },
          usage: ["input", "output"]
        }
      } as any);
    });

    it("anonymous model record", async () => {
      const property = await verifyFirstProperty(`
      Record<{
        /** Description for name */
        name: string;
      }>`);
      // console.log(property);
      assert.deepEqual(property, {
        type: "dictionary",
        description: undefined,
        typeName: 'Record<string, {"name": string;}>',
        valueTypeName: "",
        outputTypeName: 'Record<string, {"name": string;}>',
        outputValueTypeName: '{"name": string;}',
        usage: ["output", "input"],
        required: true,
        additionalProperties: {
          name: "",
          type: "object",
          description: "",
          fromCore: false,
          isMultipartBody: false,
          typeName: '{"name": string;}',
          outputTypeName: '{"name": string;}',
          properties: {
            '"name"': {
              type: "string",
              description: "Description for name",
              required: true,
              usage: ["output", "input"]
            }
          },
          usage: ["input", "output"]
        }
      } as any);
    });

    it("anonymous model union", async () => {
      const property = await verifyFirstProperty(`
      {
        /** Description for name */
        name: string;
      } | null`);
      // console.log(property);
      assert.deepEqual(property, {
        type: "union",
        typeName: '{"name": string;} | null',
        outputTypeName: '{"name": string;} | null',
        required: true,
        usage: ["output", "input"],
        description: undefined,
        enum: [
          {
            name: "",
            type: "object",
            description: "",
            fromCore: false,
            isMultipartBody: false,
            typeName: '{"name": string;}',
            outputTypeName: '{"name": string;}',
            properties: {
              '"name"': {
                type: "string",
                description: "Description for name",
                required: true,
                usage: ["output", "input"]
              }
            },
            usage: ["input", "output"]
          },
          { name: "null", type: "null" }
        ]
      } as any);
    });
  });
});

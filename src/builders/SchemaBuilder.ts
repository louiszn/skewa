import type { SchemaData } from "../types/schema.js";
import { validateSchema } from "../utils/index.js";
import { type AdvancedFieldData, BaseFieldBuilder } from "./FieldBuilder.js";

export interface SchemaBuilderData {
	[x: string]: AdvancedFieldData;
}

export default class SchemaBuilder {
	public data: SchemaData;

	public constructor(data: SchemaBuilderData = {}) {
		this.data = {};
		this.addFields(data);
	}

	public addField(name: string, data: AdvancedFieldData) {
		this.data[name] = BaseFieldBuilder.getRawData(data);
		return this;
	}

	public addFields(data: SchemaBuilderData) {
		for (const [fieldName, fieldData] of Object.entries(data)) {
			this.addField(fieldName, fieldData);
		}

		return this;
	}

	public setFields(data: SchemaBuilderData) {
		this.data = {};
		this.addFields(data);
		return this;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public validate(data: any) {
		validateSchema(this.data, data);
	}
}

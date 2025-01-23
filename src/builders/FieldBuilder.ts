import type {
	ArrayFieldData,
	FieldData,
	MultipleTypesFieldData,
	NumberFieldData,
	ObjectFieldData,
	ObjectWithField,
	StringFieldData,
} from "../types/field.js";

export const BASIC_FIELD_TYPES = ["string", "number"] as const;

export type BasicFieldType = (typeof BASIC_FIELD_TYPES)[number];
export type FieldBuilder =
	| BaseFieldBuilder
	| NumberFieldBuilder
	| StringFieldBuilder
	| ObjectFieldBuilder
	| ArrayFieldBuilder;

export type CreateFieldFunction = (builder: FieldBuilder) => FieldBuilder;
export type AdvancedFieldData = FieldData | FieldBuilder | CreateFieldFunction;

export interface ObjectWithAdvancedField {
	[x: string]: AdvancedFieldData;
}

export interface ObjectFieldBuilderData {
	type: ObjectWithAdvancedField;
	required?: boolean;
}

export interface ArrayFieldBuilderData {
	type: AdvancedFieldData[];
	required?: boolean;
}

export class BaseFieldBuilder<T extends FieldData = FieldData> {
	public data: T;

	public constructor(data?: T) {
		if (data) {
			if (!("type" in data) && !("types" in data)) {
				throw new Error("Missing field type.");
			}

			this.data = data;
		} else {
			this.data = {} as T;
		}
	}

	public setType(type: "number"): NumberFieldBuilder;
	public setType(type: "string"): StringFieldBuilder;
	public setType(type: ObjectWithAdvancedField): ObjectFieldBuilder;
	public setType(type: AdvancedFieldData[]): ArrayFieldBuilder;
	public setType(type: BasicFieldType | ObjectWithAdvancedField | AdvancedFieldData[]): FieldBuilder {
		if (typeof type === "string") {
			switch (type) {
				case "number":
					return new NumberFieldBuilder({
						...this.data,
						type,
					});
				case "string":
					return new StringFieldBuilder({
						...this.data,
						type,
					});
			}
		}

		if (typeof type === "object") {
			if (Array.isArray(type)) {
				return new ArrayFieldBuilder({
					...this.data,
					type,
				});
			}

			return new ObjectFieldBuilder({
				...this.data,
				type,
			});
		}

		throw new TypeError("Invalid field type.");
	}

	public setRequired(required = true) {
		this.data.required = Boolean(required);
		return this;
	}

	public static getBuilder(data: AdvancedFieldData): BaseFieldBuilder {
		if (data instanceof BaseFieldBuilder) {
			return data;
		}

		if (typeof data === "function") {
			return data(new BaseFieldBuilder());
		}

		return new BaseFieldBuilder(data);
	}

	public static getRawData(data: AdvancedFieldData) {
		return BaseFieldBuilder.getBuilder(data).data;
	}
}

export class StringFieldBuilder extends BaseFieldBuilder<StringFieldData> {
	public setMaxLength(length: number): StringFieldBuilder {
		if (this.data.minLength && length < this.data.minLength) {
			throw new Error("'maxLength' cannot be smaller than 'minLength'.");
		}

		this.data.maxLength = length;

		return this;
	}

	public setMinLength(length: number): StringFieldBuilder {
		if (this.data.maxLength && length > this.data.maxLength) {
			throw new Error("'minLength' cannot be bigger than 'maxLength'.");
		}

		if (length < 0) {
			throw new Error("String length cannot be smaller than 0.");
		}

		this.data.minLength = length;

		return this;
	}
}

export class NumberFieldBuilder extends BaseFieldBuilder<NumberFieldData> {
	public setMaxValue(value: number): NumberFieldBuilder {
		if (this.data.minValue && value < this.data.minValue) {
			throw new Error("'maxLength' cannot be smaller than 'minLength'.");
		}

		this.data.maxValue = value;

		return this;
	}

	public setMinLength(value: number): NumberFieldBuilder {
		if (this.data.maxValue && value > this.data.maxValue) {
			throw new Error("'minLength' cannot be bigger than 'maxLength'.");
		}

		this.data.minValue = value;

		return this;
	}
}

export class ObjectFieldBuilder extends BaseFieldBuilder<ObjectFieldData> {
	public constructor(data?: ObjectFieldBuilderData) {
		super();

		if (data) {
			this.data = data as ObjectFieldData;
			this.setTypeFields(data.type);
		}
	}

	public addTypeField(name: string, data: AdvancedFieldData) {
		this.data.type[name] = BaseFieldBuilder.getRawData(data);
		return this;
	}

	public addTypeFields(data: ObjectWithAdvancedField) {
		for (const [fieldName, fieldData] of Object.entries(data)) {
			this.addTypeField(fieldName, fieldData);
		}

		return this;
	}

	public setTypeFields(data: ObjectWithAdvancedField) {
		this.data.type = {};
		this.addTypeFields(data);
		return this;
	}
}

export class ArrayFieldBuilder extends BaseFieldBuilder<ArrayFieldData> {
	public constructor(data?: ArrayFieldBuilderData) {
		super();

		if (data) {
			this.data = data as ArrayFieldData;
			this.setTypeEntries(...data.type);
		}
	}

	public addTypeEntry(data: AdvancedFieldData) {
		this.data.type.push(BaseFieldBuilder.getRawData(data));
		return this;
	}

	public addTypeEntries(...entries: AdvancedFieldData[]) {
		for (const entry of entries) {
			this.addTypeEntry(entry);
		}

		return this;
	}

	public setTypeEntries(...entries: AdvancedFieldData[]) {
		this.data.type = [];
		this.addTypeEntries(...entries);
		return this;
	}

	public setTuple(tuple = true) {
		this.data.tuple = tuple;
		return this;
	}
}

export class MultipleTypesFieldBuilder extends BaseFieldBuilder<MultipleTypesFieldData> {

}

export interface ObjectWithField {
	[x: string]: FieldData;
}

export interface BaseFieldData {
	type?: "string" | "number" | ObjectWithField | ObjectWithField[];
	required?: boolean;
}

export interface StringFieldData extends BaseFieldData {
	type: "string";
	minLength?: number;
	maxLength?: number;
}

export interface NumberFieldData extends BaseFieldData {
	type: "number";
	minValue?: number;
	maxValue?: number;
}

export interface ObjectFieldData extends BaseFieldData {
	type: ObjectWithField;
}

export interface ArrayFieldData extends BaseFieldData {
	type: FieldData[];
	tuple?: boolean;
}

export interface MultipleTypesFieldData extends Omit<BaseFieldData, "type"> {
	types: FieldData[];
}

export type FieldData =
	| NumberFieldData
	| StringFieldData
	| ObjectFieldData
	| ArrayFieldData
	| MultipleTypesFieldData;

// import SchemaBuilder from "../builders/SchemaBuilder.js";
import ValidationError from "../errors/ValidationError.js";
import type { ArrayFieldData, FieldData } from "../types/field.js";
import type { SchemaData } from "../types/schema.js";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getTypeName(value: any) {
	const type = typeof value;

	if (Array.isArray(value)) {
		return "array";
	}

	return type;
}

export function getFieldTypeName(field: FieldData) {
	if ("types" in field) {
		return "multiple";
	}

	if (typeof field.type === "string") {
		return field.type;
	}

	if (Array.isArray(field.type)) {
		return "array";
	}

	return "object";
}

// biome-ignore lint/suspicious/noExplicitAny: Accept any data
export function validateSchema(schema: SchemaData, data: any) {
	for (const [fieldName, fieldType] of Object.entries(schema)) {
		validateField(fieldType, fieldName, data[fieldName]);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function validateField(field: FieldData, baseName: string, data: any) {
	const fieldTypeName = getFieldTypeName(field);
	const dataTypeName = getTypeName(data);

	if (!data && !field.required) {
		return;
	}

	if ("types" in field) {
	} else {
		if (dataTypeName !== fieldTypeName) {
			throw new ValidationError(
				baseName,
				`Required ${fieldTypeName}, received ${dataTypeName}.\n>>  ${baseName.split(".").at(-1)}: ${JSON.stringify(data, null, 4)?.split("\n").join("\n>>  ")}`,
			);
		}

		if (typeof field.type === "string") {
			if (field.type === "string") {
				field;
			}
		} else if (typeof field.type === "object") {
			if (Array.isArray(field.type)) {
				validateArrayField(field as ArrayFieldData, baseName, data);
			} else {
				for (const [fieldName, fieldType] of Object.entries(field.type)) {
					validateField(fieldType, `${baseName}.${fieldName}`, data[fieldName]);
				}
			}
		}
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function validateArrayField(field: ArrayFieldData, baseName: string, data: any) {
	if (field.tuple) {
		for (const [index, entry] of field.type.entries()) {
			if (!data?.[index] || !Array.isArray(data[index])) {
				throw new Error(`Field '${baseName}' must be an array.`);
			}

			validateField(entry, `${baseName}[${index}]`, data[index]);
		}

		return;
	}

	let error: TypeError | null = null;

	for (const [index, entry] of data.entries()) {
		for (const fieldType of field.type) {
			try {
				validateField(fieldType, `${baseName}[${index}]`, entry);
				error = null;
			} catch (err) {
				if (err instanceof ValidationError && !error) {
					error = err;
				}
			}

			if (!error) {
				break;
			}
		}
	}

	if (error) {
		throw error;
	}
}

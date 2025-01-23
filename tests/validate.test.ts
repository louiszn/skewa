import { test } from "vitest";
import { SchemaBuilder } from "../src/index.js";

test("validate", () => {
	const schema = new SchemaBuilder({
		field: (field) =>
			field.setType([
				(field) => field.setType("number").setRequired(),
				(field) => field.setType("string").setRequired(),
			]),
	});

	schema.validate({
		field: [
			{}
		],
	});
});

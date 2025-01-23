export default class ValidationError extends Error {
	public constructor(baseName: string, message: string) {
		super(message);
		this.name = `${this.constructor.name} <${baseName}>`;
	}
}

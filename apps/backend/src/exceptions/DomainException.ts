export class DomainException extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super();
		this.name = 'DomainException';
		this.message = message;
		if (options?.cause) {
			this.cause = options.cause;
		}
	}
}

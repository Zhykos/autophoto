import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { CLIAction } from "./CLIAction.ts";

export class BlueskyPublisherAction extends CLIAction implements ValueObject {
  constructor(
    public readonly host: URL,
    public readonly login: string,
    public readonly password: string,
  ) {
    super();
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (!this.login || this.login.length === 0) {
      throw new DomainError("Login is required");
    }

    if (!this.password || this.password.length === 0) {
      throw new DomainError("Password is required");
    }
  }

  equals(other: unknown): boolean {
    if (other instanceof BlueskyPublisherAction) {
      return (
        this.login === other.login &&
        this.password === other.password &&
        this.host.toString() === other.host.toString()
      );
    }
    return false;
  }
}

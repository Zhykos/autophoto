import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { Action } from "./Action.ts";

export class BlueskyCredentials implements ValueObject, Action {
  constructor(
    public readonly host: URL,
    public readonly login: string,
    public readonly password: string,
  ) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    if (!this.host || this.host.toString().length === 0) {
      throw new DomainError("Host is required");
    }

    if (!this.login || this.login.length === 0) {
      throw new DomainError("Login is required");
    }

    if (!this.password || this.password.length === 0) {
      throw new DomainError("Password is required");
    }
  }

  equals(other: unknown): boolean {
    if (other instanceof BlueskyCredentials) {
      return (
        this.login === other.login &&
        this.password === other.password &&
        this.host.toString() === other.host.toString()
      );
    }
    return false;
  }

  isScan(): boolean {
    return false;
  }
}

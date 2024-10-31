import { DomainError } from "../../../common/domain/DomainError.ts";
import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import { type Action, ActionType } from "./Action.ts";

export class BlueskyPublisherAction implements ValueObject, Action {
  constructor(
    public readonly host: URL,
    public readonly login: string,
    public readonly password: string,
  ) {
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

  type(): ActionType {
    return ActionType.PUBLISHER;
  }
}

import type { ValueObject } from "../../../common/domain/ValueObject.ts";

export class ConfigurationDataPattern implements ValueObject {
  constructor(
    public readonly regex: RegExp,
    public readonly groups: string[],
  ) {
    this.validateObjectProperties();
  }

  validateObjectProperties(): void {
    // DO NOTHING
  }

  public equals(other: unknown): boolean {
    if (other instanceof ConfigurationDataPattern) {
      return (
        this.regex.source === other.regex.source &&
        this.groups.join() === other.groups.join()
      );
    }
    return false;
  }
}

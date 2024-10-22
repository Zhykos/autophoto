import { crypto } from "@std/crypto/crypto";

export abstract class Entity {
  public readonly id: string;

  constructor(id?: string) {
    this.id = id || crypto.randomUUID();
  }

  /* NOT USED
public equals(other: unknown): boolean {
    if (other instanceof Entity) {
      return this.id === other.id;
    }
    return false;
  }*/
}

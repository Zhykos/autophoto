import { crypto } from "@std/crypto/crypto";

export abstract class Entity {
  public readonly uuid: string;

  constructor(uuid?: string) {
    this.uuid = uuid || crypto.randomUUID();
  }

  /* XXX Why not use this method?
  public equals(other: unknown): boolean {
    if (other instanceof Entity) {
      return this.uuid === other.uuid;
    }
    return false;
  }*/
}

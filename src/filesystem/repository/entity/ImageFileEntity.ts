export class ImageFileEntity {
  public constructor(
    public readonly path: string,
    public readonly checksum: string,
  ) {}

  public static async fromPath(path: string): Promise<ImageFileEntity> {
    return new ImageFileEntity(path, await ImageFileEntity.checksum(path));
  }
}

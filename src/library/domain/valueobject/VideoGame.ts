import type { ValueObject } from "../../../common/domain/ValueObject.ts";
import type { VideoGamePlatform } from "./VideoGamePlatform.ts";
import type { VideoGameReleaseYear } from "./VideoGameReleaseYear.ts";
import type { VideoGameTitle } from "./VideoGameTitle.ts";

export class VideoGame implements ValueObject {
  public constructor(
    public readonly title: VideoGameTitle,
    public readonly platform: VideoGamePlatform,
    public readonly releaseYear: VideoGameReleaseYear,
  ) {}

  public validateObjectProperties(): void {
    // DO NOTHING
  }

  public equals(anotherObject: unknown): boolean {
    if (anotherObject instanceof VideoGame) {
      return (
        this.title.equals(anotherObject.title) &&
        this.platform.equals(anotherObject.platform) &&
        this.releaseYear.equals(anotherObject.releaseYear)
      );
    }
    return false;
  }
}

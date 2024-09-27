import { DomainError } from "../../../common/domain/DomainError.ts";
import type { LibraryObject } from "./LibraryObject.ts";
import { VideoGamePlatform } from "./VideoGamePlatform.ts";
import { VideoGameReleaseYear } from "./VideoGameReleaseYear.ts";
import { VideoGameTitle } from "./VideoGameTitle.ts";

export class VideoGame implements LibraryObject {
  public constructor(
    public readonly title: VideoGameTitle,
    public readonly platform: VideoGamePlatform,
    public readonly releaseYear: VideoGameReleaseYear,
  ) {
    this.validateObjectProperties();
  }

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

  static builder() {
    return new VideoGameBuilder();
  }
}

export class VideoGameBuilder {
  private title: string | undefined;
  private platform: string | undefined;
  private releaseYear: number | undefined;

  withTitle(title: string): VideoGameBuilder {
    this.title = title;
    return this;
  }

  withPlatform(platform: string): VideoGameBuilder {
    this.platform = platform;
    return this;
  }

  withReleaseYear(releaseYear: number): VideoGameBuilder {
    this.releaseYear = releaseYear;
    return this;
  }

  build(): VideoGame {
    if (!this.title || !this.platform || !this.releaseYear) {
      throw new DomainError(
        `Title (${this.title}), platform (${this.platform}) and release year (${this.releaseYear}) are required`,
      );
    }

    return new VideoGame(
      new VideoGameTitle(this.title),
      new VideoGamePlatform(this.platform),
      new VideoGameReleaseYear(this.releaseYear),
    );
  }
}

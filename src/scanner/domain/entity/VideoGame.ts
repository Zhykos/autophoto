import { DomainError } from "../../../common/domain/DomainError.ts";
import { Entity } from "../../../common/domain/Entity.ts";
import { VideoGameReleaseYear } from "../valueobject/VideoGameReleaseYear.ts";
import { VideoGameTitle } from "../valueobject/VideoGameTitle.ts";

export class VideoGame extends Entity {
  public constructor(
    public readonly title: VideoGameTitle,
    public readonly releaseYear: VideoGameReleaseYear,
    uuid?: string,
  ) {
    super(uuid);
  }

  static builder() {
    return new VideoGameBuilder();
  }
}

export class VideoGameBuilder {
  private title: string | undefined;
  private releaseYear: number | undefined;

  withTitle(title: string): VideoGameBuilder {
    this.title = title;
    return this;
  }

  withReleaseYear(releaseYear: number): VideoGameBuilder {
    this.releaseYear = releaseYear;
    return this;
  }

  build(): VideoGame {
    if (!this.title || !this.releaseYear) {
      throw new DomainError(
        `Title (${this.title}) and release year (${this.releaseYear}) are required`,
      );
    }

    return new VideoGame(
      new VideoGameTitle(this.title),
      new VideoGameReleaseYear(this.releaseYear),
    );
  }
}

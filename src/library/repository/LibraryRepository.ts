import { crypto } from "@std/crypto/crypto";
import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { Library } from "../domain/aggregate/Library.ts";
import type { VideoGameEntity } from "./entity/VideoGameEntity.ts";

export interface LibraryRepository {
  saveLibrary(library: Library): Promise<void>;
}

export class KvLibraryRepository implements LibraryRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveLibrary(library: Library): Promise<void> {
    const videoGameEntities: VideoGameEntity[] = library
      .getVideoGames()
      .map((videoGame) => {
        return {
          uuid: crypto.randomUUID(),
          title: videoGame.title.value,
          releaseYear: videoGame.releaseYear.year,
        } satisfies VideoGameEntity;
      });

    for (const videoGameEntity of videoGameEntities) {
      await this.kvDriver.save(
        ["library", "video-game", videoGameEntity.uuid],
        videoGameEntity,
      );
    }
  }
}

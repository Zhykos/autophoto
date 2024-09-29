import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import type { VideoGameFileLinkEntity } from "../domain/entity/VideoGameFileLinkEntity.ts";
import type { VideoGameFileLinkEntity as VideoGameFileLinkRepositoryEntity } from "./entity/VideoGameFileLinkEntity.ts";

export interface LinksRepository {
  saveVideoGamesLinks(links: VideoGameFileLinkEntity[]): Promise<void>;
  getAllVideoGamesLinks(): Promise<VideoGameFileLinkRepositoryEntity[]>;
}

export class KvLinksRepository implements LinksRepository {
  constructor(private readonly kvDriver: KvDriver) {}

  async saveVideoGamesLinks(links: VideoGameFileLinkEntity[]): Promise<void> {
    const entities: VideoGameFileLinkRepositoryEntity[] = links.map((link) => {
      return {
        uuid: link.uuid,
        videoGameUUID: link.videoGameEntity.uuid,
        platform: link.platform.value,
        fileUUID: link.fileEntity.uuid,
      } satisfies VideoGameFileLinkRepositoryEntity;
    });

    for (const entity of entities) {
      await this.kvDriver.save(["link", entity.uuid], entity);
    }
  }

  async getAllVideoGamesLinks(): Promise<VideoGameFileLinkRepositoryEntity[]> {
    return await this.kvDriver.list(
      ["link"],
      {} as VideoGameFileLinkRepositoryEntity,
    );
  }
}

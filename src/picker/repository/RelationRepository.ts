import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "../../common/repository/CommonKvRelationRepository.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { Image } from "../domain/entity/Image.ts";
import { UnpublishedVideoGameScreenshotRelation } from "../domain/entity/UnpublishedVideoGameScreenshotRelation.ts";

export interface RelationRepository {
  getUnpublishedVideoGameRelations(): Promise<
    UnpublishedVideoGameScreenshotRelation[]
  >;

  updatePublishedStatuses(updatedImages: Image[]): Promise<void>;
}

export class KvRelationRepository implements RelationRepository {
  private readonly commonRepository: CommonKvRelationRepository;

  constructor(kvDriver: KvDriver) {
    this.commonRepository = new CommonKvRelationRepository(kvDriver);
  }

  async getUnpublishedVideoGameRelations(): Promise<
    UnpublishedVideoGameScreenshotRelation[]
  > {
    const allRelations: VideoGameRelationImageRepositoryEntity[] =
      await this.commonRepository.getAllVideoGameRelations();

    return allRelations
      .filter((relation) => !relation.published)
      .map(
        (relation) =>
          new UnpublishedVideoGameScreenshotRelation(
            relation.uuid,
            relation.imageID,
            relation.videoGameID,
            relation.platform,
          ),
      );
  }

  async updatePublishedStatuses(updatedImages: Image[]): Promise<void> {
    for (const updatedImage of updatedImages) {
      await this.commonRepository.updatePublishedStatus(updatedImage.id);
    }
  }
}

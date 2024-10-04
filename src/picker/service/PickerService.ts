import type { VideoGameRelationImageRepositoryEntity } from "../../common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import { VideoGameScreeshotsToShare } from "../domain/aggregate/VideoGameScreeshotsToShare.ts";
import type { RelationRepository } from "../repository/RelationRepository.ts";

export class PickerService {
  constructor(private readonly relationRepository: RelationRepository) {}

  public async pick(): Promise<VideoGameScreeshotsToShare | undefined> {
    const unpublishedRelations: VideoGameRelationImageRepositoryEntity[] =
      await this.relationRepository.getUnpublishedVideoGameRelations();
    return new VideoGameScreeshotsToShare("8-Bit Bayonetta", "PC", ["1", "2"]);
  }
}

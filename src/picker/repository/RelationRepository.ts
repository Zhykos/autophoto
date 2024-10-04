import type { KvDriver } from "../../common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "../../common/repository/CommonKvRelationRepository.ts";
import type { VideoGameRelationImageRepositoryEntity } from "../../common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";

export interface RelationRepository {
  getUnpublishedVideoGameRelations(): Promise<
    VideoGameRelationImageRepositoryEntity[]
  >;
}

export class KvRelationRepository implements RelationRepository {
  private readonly commonRepository: CommonKvRelationRepository;

  constructor(kvDriver: KvDriver) {
    this.commonRepository = new CommonKvRelationRepository(kvDriver);
  }

  async getUnpublishedVideoGameRelations(): Promise<
    VideoGameRelationImageRepositoryEntity[]
  > {
    const allRelations: VideoGameRelationImageRepositoryEntity[] =
      await this.commonRepository.getAllVideoGameRelations();
    return allRelations.filter((relation) => !relation.published); // TODO map to entity
  }
}

import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { Configuration } from "./configuration/domain/aggregate/Configuration.ts";
import type { VideoGameScreeshotsToShare } from "./picker/domain/aggregate/VideoGameScreeshotsToShare.ts";
import { KvImageRepository } from "./picker/repository/ImageRepository.ts";
import { KvRelationRepository } from "./picker/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "./picker/repository/VideoGameRepository.ts";
import { PickerService } from "./picker/service/PickerService.ts";

export const publish = async (
  configuration: Configuration,
  kvDriver: KvDriver,
): Promise<void> => {
  const pickerService = new PickerService(
    new KvRelationRepository(kvDriver),
    new KvVideoGameRepository(kvDriver),
    new KvImageRepository(kvDriver),
  );

  const pick: VideoGameScreeshotsToShare | undefined =
    await pickerService.pick();
};

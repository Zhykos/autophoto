import { AtpAgent } from "@atproto/api";
import type { BlueskyCredentials } from "./cli/domain/valueobject/BlueskyCredentials.ts";
import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import { File } from "./common/domain/valueobject/File.ts";
import { Path } from "./common/domain/valueobject/Path.ts";
import type { VideoGameScreeshotsToShare } from "./picker/domain/aggregate/VideoGameScreeshotsToShare.ts";
import type { UnpublishedVideoGameScreenshotRelation } from "./picker/domain/entity/UnpublishedVideoGameScreenshotRelation.ts";
import { KvImageRepository } from "./picker/repository/ImageRepository.ts";
import {
  KvRelationRepository,
  type RelationRepository,
} from "./picker/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "./picker/repository/VideoGameRepository.ts";
import { PickerService } from "./picker/service/PickerService.ts";
import { BlueskyPublication } from "./publisher/domain/aggregate/BlueskyPublication.ts";
import { Credentials } from "./publisher/domain/valueobject/Credentials.ts";
import { Publication } from "./publisher/domain/valueobject/Publication.ts";
import { BlueskyPublisherService } from "./publisher/service/BlueskyPublisherService.ts";
import { pluralFinalS } from "./utils/plural-final-s.ts";

export const publish = async (
  blueskyCredentials: BlueskyCredentials,
  kvDriver: KvDriver,
  debugDatabase: boolean,
): Promise<string | undefined> => {
  const relationRepository = new KvRelationRepository(kvDriver);

  const pickerService = new PickerService(
    relationRepository,
    new KvVideoGameRepository(kvDriver),
    new KvImageRepository(kvDriver),
  );

  const pickedVideoGameScreeshots: VideoGameScreeshotsToShare | undefined =
    await pickerService.pick();

  if (!pickedVideoGameScreeshots) {
    return undefined;
  }

  const resultPublication: string = await new BlueskyPublisherService().publish(
    new BlueskyPublication(
      new AtpAgent({
        service: blueskyCredentials.host.toString(),
      }),
      new Credentials(blueskyCredentials.login, blueskyCredentials.password),
      new Publication(
        `Screenshots from video game "${pickedVideoGameScreeshots.title}" (${pickedVideoGameScreeshots.releaseYear}) taken on ${pickedVideoGameScreeshots.platform}`,
        pickedVideoGameScreeshots.screenshots.map(
          (s) => new File(new Path(s.path)),
        ),
        pickedVideoGameScreeshots.screenshots.map(
          (_) =>
            `Screenshot from video game ${pickedVideoGameScreeshots.title} (no more details given by the bot)`, // TODO
        ),
      ),
    ),
  );

  await updatePublishedStatuses(pickedVideoGameScreeshots, relationRepository);

  if (debugDatabase) {
    const debug: string = await debugDatabaseInformation(
      pickedVideoGameScreeshots,
      relationRepository,
    );
    console.log("Debug database information:", debug);
  }

  return resultPublication;
};

async function updatePublishedStatuses(
  publishedVideoGameScreeshots: VideoGameScreeshotsToShare,
  relationRepository: RelationRepository,
): Promise<void> {
  await relationRepository.updatePublishedStatuses(
    publishedVideoGameScreeshots.screenshots,
  );
}

export async function debugDatabaseInformation(
  publishedVideoGameScreeshots: VideoGameScreeshotsToShare,
  relationRepository: RelationRepository,
): Promise<string> {
  const unpublishedVideoGameRelations: UnpublishedVideoGameScreenshotRelation[] =
    await relationRepository.getUnpublishedVideoGameRelations();

  const possibleRemainingDays: number = Math.ceil(
    unpublishedVideoGameRelations.length / 4,
  );

  return `Publication done for video game "${publishedVideoGameScreeshots.title}" (${publishedVideoGameScreeshots.releaseYear} - ${publishedVideoGameScreeshots.platform}).

${pluralFinalS(publishedVideoGameScreeshots.screenshots.length, "image")} published:
${publishedVideoGameScreeshots.screenshots
  .map((s) => `  - ${s.path}`)
  .sort()
  .join("\n")}

${pluralFinalS(unpublishedVideoGameRelations.length, "image")} not published yet: it may take another ${pluralFinalS(possibleRemainingDays, "publication")} to publish them (if 1 publication per day).`;
}

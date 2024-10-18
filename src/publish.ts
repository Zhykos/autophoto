import { AtpAgent } from "@atproto/api";
import type { BlueskyCredentials } from "./cli/domain/valueobject/BlueskyCredentials.ts";
import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import { File } from "./common/domain/valueobject/File.ts";
import { Path } from "./common/domain/valueobject/Path.ts";
import type { VideoGameScreeshotsToShare } from "./picker/domain/aggregate/VideoGameScreeshotsToShare.ts";
import { KvImageRepository } from "./picker/repository/ImageRepository.ts";
import { KvRelationRepository } from "./picker/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "./picker/repository/VideoGameRepository.ts";
import { PickerService } from "./picker/service/PickerService.ts";
import { BlueskyPublication } from "./publisher/domain/aggregate/BlueskyPublication.ts";
import { Credentials } from "./publisher/domain/valueobject/Credentials.ts";
import { Publication } from "./publisher/domain/valueobject/Publication.ts";
import { BlueskyPublisherService } from "./publisher/service/BlueskyPublisherService.ts";

export const publish = async (
  blueskyCredentials: BlueskyCredentials,
  kvDriver: KvDriver,
  debugDatabase: boolean,
): Promise<string | undefined> => {
  const pickerService = new PickerService(
    new KvRelationRepository(kvDriver),
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

  if (debugDatabase) {
    const debug: string = await debugDatabaseInformation();
    console.log("Debug database information:", debug);
  }

  return resultPublication;
};

export async function debugDatabaseInformation(): Promise<string> {
  // TODO
  return "TODO";
}

import { AtpAgent } from "@atproto/api";
import type { Log } from "@cross/log";
import type { BlueskyStatsPublisherAction } from "./cli/domain/valueobject/BlueskyStatsPublisherAction.ts";
import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import type { UnpublishedVideoGameScreenshotRelation } from "./picker/domain/entity/UnpublishedVideoGameScreenshotRelation.ts";
import { KvImageRepository } from "./picker/repository/ImageRepository.ts";
import { KvRelationRepository } from "./picker/repository/RelationRepository.ts";
import { KvVideoGameRepository } from "./picker/repository/VideoGameRepository.ts";
import { BlueskyPublication } from "./publisher/domain/aggregate/BlueskyPublication.ts";
import { Credentials } from "./publisher/domain/valueobject/Credentials.ts";
import { Publication } from "./publisher/domain/valueobject/Publication.ts";
import { BlueskyPublisherService } from "./publisher/service/BlueskyPublisherService.ts";
import { pluralFinalS } from "./utils/plural-final-s.ts";

export const publishStats = async (
  blueskyAction: BlueskyStatsPublisherAction,
  kvDriver: KvDriver,
  logger: Log,
): Promise<string | undefined> => {
  const relationRepository = new KvRelationRepository(kvDriver);

  const unpublishedVideoGameRelations: UnpublishedVideoGameScreenshotRelation[] =
    await relationRepository.getUnpublishedVideoGameRelations();

  const publicationMessage: string = await statsMessage(
    kvDriver,
    unpublishedVideoGameRelations,
  );

  const resultPublication: string = await new BlueskyPublisherService().publish(
    new BlueskyPublication(
      new AtpAgent({
        service: blueskyAction.host.toString(),
      }),
      new Credentials(blueskyAction.login, blueskyAction.password),
      new Publication(publicationMessage.substring(0, 300)),
    ),
  );

  if (blueskyAction.debug) {
    logger.log(
      "Debug database information:",
      publicationMessage,
      `Message length: ${publicationMessage.length}`,
    );
  }

  return unpublishedVideoGameRelations.length > 0
    ? resultPublication
    : undefined;
};

export async function statsMessage(
  kvDriver: KvDriver,
  unpublishedVideoGameRelations: UnpublishedVideoGameScreenshotRelation[],
): Promise<string> {
  const imageRepository = new KvImageRepository(kvDriver);
  const videoGameRepository = new KvVideoGameRepository(kvDriver);

  const allImagesCount: number = await imageRepository.count();

  const allImagesPhrase: string = pluralFinalS(allImagesCount, "image", true);

  const allVideoGamesCount: number = await videoGameRepository.count();

  const allVideoGamesPhrase: string = pluralFinalS(
    allVideoGamesCount,
    "video game",
    true,
  );

  // 4 publications with 4 images per day
  const nbPublicationsPerDay = 4;
  const possibleRemainingDays: number = Math.ceil(
    unpublishedVideoGameRelations.length / 4 / nbPublicationsPerDay,
  );

  const unpublishedImagesPhrase: string = pluralFinalS(
    unpublishedVideoGameRelations.length,
    "image",
    true,
  );

  const daysWord: string = pluralFinalS(possibleRemainingDays, "day", true);

  if (unpublishedVideoGameRelations.length === 0) {
    return `Hi! ✨ Here are some statistics about the gallery.
No more images to publish for now.
See you soon 💫

(automatic message)`;
  }

  return `Hi! ✨ Here are some statistics about the gallery:
  - ${allImagesPhrase}
  - ${allVideoGamesPhrase}.

${unpublishedImagesPhrase} not published yet: it may take more ${daysWord} to publish them.

(automatic message)`;
}

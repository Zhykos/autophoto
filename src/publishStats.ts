import puppeteer, { type Browser } from "npm:puppeteer";
import { AtpAgent } from "@atproto/api";
import type { Log } from "@cross/log";
import { renderMermaid } from "@mermaid-js/mermaid-cli";
import { distinct } from "@std/collections";
import type { BlueskyStatsPublisherAction } from "./cli/domain/valueobject/BlueskyStatsPublisherAction.ts";
import type { KvDriver } from "./common/dbdriver/KvDriver.ts";
import { CommonKvRelationRepository } from "./common/repository/CommonKvRelationRepository.ts";
import type { VideoGameRelationImageRepositoryEntity } from "./common/repository/entity/VideoGameRelationImageRepositoryEntity.ts";
import type { UnpublishedVideoGameScreenshotRelation } from "./picker/domain/entity/UnpublishedVideoGameScreenshotRelation.ts";
import {
  type ImageRepository,
  KvImageRepository,
} from "./picker/repository/ImageRepository.ts";
import { KvRelationRepository } from "./picker/repository/RelationRepository.ts";
import {
  KvVideoGameRepository,
  type VideoGameRepository,
} from "./picker/repository/VideoGameRepository.ts";
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
  const imageRepository = new KvImageRepository(kvDriver);
  const videoGameRepository = new KvVideoGameRepository(kvDriver);
  const relationRepository = new KvRelationRepository(kvDriver);
  const relationCommonRepository = new CommonKvRelationRepository(kvDriver);

  const unpublishedVideoGameRelations:
    UnpublishedVideoGameScreenshotRelation[] = await relationRepository
      .getUnpublishedVideoGameRelations();

  const publicationMessage: string = await statsMessage(
    imageRepository,
    videoGameRepository,
    unpublishedVideoGameRelations,
  );

  const diagrams: { images: Uint8Array[]; alts: string[] } =
    await statsDiagrams(relationCommonRepository);

  const resultPublication: string = await new BlueskyPublisherService().publish(
    new BlueskyPublication(
      new AtpAgent({
        service: blueskyAction.host.toString(),
      }),
      new Credentials(blueskyAction.login, blueskyAction.password),
      new Publication(
        publicationMessage.substring(0, 300),
        diagrams.images,
        diagrams.alts,
      ),
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
  imageRepository: ImageRepository,
  videoGameRepository: VideoGameRepository,
  unpublishedVideoGameRelations: UnpublishedVideoGameScreenshotRelation[],
): Promise<string> {
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

export async function statsDiagrams(
  relationRepository: CommonKvRelationRepository,
): Promise<{ images: Uint8Array[]; alts: string[] }> {
  const diagramVideoGamePlatform: { image: Uint8Array; alt: string } =
    await statsDiagramVideoGameByPlatform(relationRepository);
  const diagramScreenshotsPlatform: { image: Uint8Array; alt: string } =
    await statsDiagramScreenshotsByPlatform(relationRepository);
  return {
    images: [diagramVideoGamePlatform.image, diagramScreenshotsPlatform.image],
    alts: [diagramVideoGamePlatform.alt, diagramScreenshotsPlatform.alt],
  };
}

async function statsDiagramVideoGameByPlatform(
  relationRepository: CommonKvRelationRepository,
): Promise<{ image: Uint8Array; alt: string }> {
  const allRelations: VideoGameRelationImageRepositoryEntity[] =
    await relationRepository.getAllVideoGameRelations();

  const mapPlatformVideoGameIds = new Map<string, string[]>();
  for (const rel of allRelations) {
    const platform: string = rel.platform.replace(/\(.+\)/, "").trim();
    const videoGameIds: string[] = mapPlatformVideoGameIds.get(platform) ?? [];
    videoGameIds.push(rel.videoGameID);
    mapPlatformVideoGameIds.set(platform, videoGameIds);
  }

  const graphDefinition = `pie showData title Video games by platform
${
    mapPlatformVideoGameIds
      .keys()
      .map(
        (k) =>
          `"${k}" : ${
            distinct(mapPlatformVideoGameIds.get(k) as string[]).length
          }`,
      )
      .toArray()
      .join("\n")
  }`;

  const image: Uint8Array = await statsDiagramImage(graphDefinition);

  let videoGamesCount = 0;
  for (const k of mapPlatformVideoGameIds.keys()) {
    videoGamesCount += distinct(
      mapPlatformVideoGameIds.get(k) as string[],
    ).length;
  }

  const alt = `Statistics about this gallery. Video games by platform are:
${
    mapPlatformVideoGameIds
      .keys()
      .map((k) => {
        const countByPlatform: number = distinct(
          mapPlatformVideoGameIds.get(k) as string[],
        ).length;
        return `  - ${k}: ${pluralFinalS(countByPlatform, "game", true)} (or ${
          (100 * countByPlatform) / videoGamesCount
        }%)`;
      })
      .toArray()
      .join("\n")
  }`;

  return { image, alt };
}

async function statsDiagramScreenshotsByPlatform(
  relationRepository: CommonKvRelationRepository,
): Promise<{ image: Uint8Array; alt: string }> {
  const allRelations: VideoGameRelationImageRepositoryEntity[] =
    await relationRepository.getAllVideoGameRelations();

  const mapPlaformCount = new Map<string, number>();
  for (const rel of allRelations) {
    const platform: string = rel.platform.replace(/\(.+\)/, "").trim();
    const count: number = mapPlaformCount.get(platform) ?? 0;
    mapPlaformCount.set(platform, count + 1);
  }

  const graphDefinition =
    `pie showData title Video games screenshots by platform
${
      mapPlaformCount
        .keys()
        .map((k) => `"${k}" : ${mapPlaformCount.get(k)}`)
        .toArray()
        .join("\n")
    }`;

  const image: Uint8Array = await statsDiagramImage(graphDefinition);

  const alt =
    `Statistics about this gallery. Video games screenshots by platform are:
${
      mapPlaformCount
        .keys()
        .map(
          (k) =>
            `  - ${k}: ${
              pluralFinalS(mapPlaformCount.get(k) as number, "image", true)
            } (or ${
              (100 * (mapPlaformCount.get(k) as number)) / allRelations.length
            }%)`,
        )
        .toArray()
        .join("\n")
    }`;

  return { image, alt };
}

async function statsDiagramImage(
  diagramDefinition: string,
): Promise<Uint8Array> {
  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch();
    const { data } = await renderMermaid(browser, diagramDefinition, "png");
    return data;
  } finally {
    browser?.close();
  }
}

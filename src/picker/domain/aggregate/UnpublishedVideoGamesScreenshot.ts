import type { Image } from "../entity/Image.ts";
import type { UnpublishedVideoGameScreenshotRelation } from "../entity/UnpublishedVideoGameScreenshotRelation.ts";
import type { VideoGame } from "../entity/VideoGame.ts";

export class UnpublishedVideoGamesScreenshot {
  private constructor(
    public readonly videoGame: VideoGame,
    public readonly platform: string,
    public readonly images: Image[],
  ) {}

  static buildAll(
    unpublishedScreenshotRelations: UnpublishedVideoGameScreenshotRelation[],
    unpublishedVideoGames: VideoGame[],
    unpublishedImages: Image[],
  ): UnpublishedVideoGamesScreenshot[] {
    const vgMap = new Map<string, VideoGame>(
      unpublishedVideoGames.map((vg) => [vg.id, vg]),
    );

    const imgMap = new Map<string, Image>(
      unpublishedImages.map((img) => [img.id, img]),
    );

    const resultMap = new Map<string, UnpublishedVideoGamesScreenshot>();
    for (const rel of unpublishedScreenshotRelations) {
      const vg: VideoGame | undefined = vgMap.get(rel.videoGameID);
      const img: Image | undefined = imgMap.get(rel.imageID);
      if (vg && img) {
        const key: string = vg.id + rel.platform;
        if (!resultMap.has(key)) {
          resultMap.set(
            key,
            new UnpublishedVideoGamesScreenshot(vg, rel.platform, []),
          );
        }
        resultMap.get(key)?.images.push(img);
      } else {
        throw new Error(`Missing video game or image for relation: ${rel.id}`);
      }
    }

    return Array.from(resultMap.values());
  }
}

import type {
  AtpAgent,
  BlobRef,
  ComAtprotoServerCreateSession,
} from "@atproto/api";
import type { File } from "../../common/domain/valueobject/File.ts";
import type { BlueskyPublication } from "../domain/aggregate/BlueskyPublication.ts";
import { BlueskyImage } from "../domain/valueobject/BlueskyImage.ts";
import type { PublisherService } from "./PublisherService.ts";

export class BlueskyPublisherService implements PublisherService {
  async publish(
    blueskyPublication: BlueskyPublication,
  ): Promise<string | undefined> {
    const loginResponse: ComAtprotoServerCreateSession.Response =
      await blueskyPublication.agent.login({
        identifier: blueskyPublication.credentials.identifier,
        password: blueskyPublication.credentials.password,
      });

    if (!loginResponse.success) {
      throw new Error("Failed to login!");
    }

    const imagesMap = new Map<BlueskyImage, BlobRef>();

    const imagesPromises: Promise<BlueskyImage>[] =
      blueskyPublication.publication.images.map(async (image) => {
        const blob: BlobRef = await this.uploadImage(
          blueskyPublication.agent,
          image,
        );
        const blueskyImage = BlueskyImage.fromFile(image, blob);
        imagesMap.set(blueskyImage, blob);
        return blueskyImage;
      });

    const images: BlueskyImage[] = await Promise.all(imagesPromises);

    const postResponse: {
      uri: string;
      cid: string;
    } = await blueskyPublication.agent.post({
      text: blueskyPublication.publication.message,
      embed: {
        $type: "app.bsky.embed.images",
        images: images.map((image) => {
          return {
            alt: image.alt,
            image: image.imageBlobRef,
          };
        }),
      },
    });

    return postResponse.uri;
  }

  private async uploadImage(agent: AtpAgent, file: File): Promise<BlobRef> {
    const { data } = await agent.uploadBlob(this.convertFileToUint8Array(file));
    return data.blob;
  }

  private convertFileToUint8Array(file: File): Uint8Array {
    const fileStr = Deno.readFileSync(file.path.value);
    return new Uint8Array(fileStr);
  }
}
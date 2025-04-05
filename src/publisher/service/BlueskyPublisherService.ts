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
  async publish(blueskyPublication: BlueskyPublication): Promise<string> {
    const loginResponse: ComAtprotoServerCreateSession.Response =
      await blueskyPublication.agent.login({
        identifier: blueskyPublication.credentials.identifier,
        password: blueskyPublication.credentials.password,
      });

    if (!loginResponse.success) {
      throw new Error("Failed to login!");
    }

    const images: BlueskyImage[] = [];

    for (
      let index = 0;
      index < (blueskyPublication.publication.images?.length as number);
      index++
    ) {
      const image: File | Uint8Array =
        blueskyPublication.publication?.images?.at(index) as File | Uint8Array;

      const alt: string | undefined =
        blueskyPublication.publication.alts?.at(index);

      const blob: BlobRef = await this.uploadImage(
        blueskyPublication.agent,
        image,
      );

      const blueskyImage = BlueskyImage.fromFile(blob, alt);
      images.push(blueskyImage);
    }

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

  private async uploadImage(
    agent: AtpAgent,
    image: File | Uint8Array,
  ): Promise<BlobRef> {
    const { data } = await agent.uploadBlob(this.convertToUint8Array(image));
    return data.blob;
  }

  private convertToUint8Array(image: File | Uint8Array): Uint8Array {
    if (image instanceof Uint8Array) {
      return image;
    }

    const fileStr = Deno.readFileSync(image.path.value);
    return new Uint8Array(fileStr);
  }
}

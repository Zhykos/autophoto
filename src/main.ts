import { VideoGame } from "./library/domain/valueobject/VideoGame.ts";
import { KvAccessor } from "./library/repository/KvAccessor/KvAccessor.ts";
import { LibraryRepository } from "./library/repository/LibraryRepository.ts";

export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}

VideoGame.builder()
  .withTitle("Super Mario Bros.")
  .withPlatform("NES")
  .withReleaseYear(1900)
  .build();

new LibraryRepository(new KvAccessor()).loadLibrary();

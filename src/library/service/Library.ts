import type { Library as LibraryDomain } from "../domain/aggregate/Library.ts";
import type { LibraryRepository } from "../repository/LibraryRepository.ts";

export class Library {
  constructor(private readonly repository: LibraryRepository) {}

  public async save(library: LibraryDomain): Promise<void> {
    console.log("Saving library...");
    await this.repository.saveLibrary(library);
  }
}

export class VideoGameScreeshotsToShare {
  constructor(
    public readonly title: string,
    public readonly platform: string,
    public readonly screenshotsFilesIDs: string[],
  ) {}
}

import { VideoGameScreeshotsToShare } from "../../../test/picker/domain/aggregate/VideoGameScreeshotsToShare.ts";

export class PickerService {
  public pick(): VideoGameScreeshotsToShare {
    return new VideoGameScreeshotsToShare("8-Bit Bayonetta", "PC", ["1", "2"]);
  }
}

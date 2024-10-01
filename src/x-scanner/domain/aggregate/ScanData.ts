import { File } from "../valueobject/File.ts";
import { Path } from "../valueobject/Path.ts";

export class ScanData {
  constructor(
    public readonly configurationFilePath: File,
    /**
     * Path to the SQLite3 database file.
     * TODO: This should be a File, but it may not exist (maybe just validate the path).
     */
    public readonly databaseFilePath: string,
  ) {}

  static builder(): ScanDataBuilder {
    return new ScanDataBuilder();
  }
}

export class ScanDataBuilder {
  private databaseFilePath = "./db.autophoto.sqlite3";
  private configurationFilePath = new File(new Path("./config.yml"));

  public withDatabaseFilePath(databaseFilePath: string): ScanDataBuilder {
    this.databaseFilePath = databaseFilePath;
    return this;
  }

  public withConfigurationFilePath(
    configurationFilePath: File,
  ): ScanDataBuilder {
    this.configurationFilePath = configurationFilePath;
    return this;
  }

  public build(): ScanData {
    return new ScanData(this.configurationFilePath, this.databaseFilePath);
  }
}

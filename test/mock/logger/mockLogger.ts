import { Log } from "@cross/log";
import { MockLoggerTransport } from "./MockLoggerTransport.ts";

export class MockLogger {
  private readonly transport = new MockLoggerTransport();

  logger(): Log {
    return new Log([this.transport]);
  }

  get infoMessages(): string[] {
    return this.transport.infoMessages;
  }

  get errorMessages(): string[] {
    return this.transport.errorMessages;
  }

  get warningMessages(): string[] {
    return this.transport.warningMessages;
  }
}

export const mockLogger = (): Log => {
  return new Log([new MockLoggerTransport()]);
};

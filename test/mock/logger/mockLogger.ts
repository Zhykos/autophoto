import { Log } from "@cross/log";
import { MockLoggerTransport } from "./MockLoggerTransport.ts";

export class MockLogger {
  private readonly transport = new MockLoggerTransport();

  logger(): Log {
    return new Log([this.transport]);
  }

  get logMessages(): string[] {
    return this.transport.logMessages;
  }

  get errorMessages(): string[] {
    return this.transport.errorMessages;
  }
}

export const mockLogger = (): Log => {
  return new Log([new MockLoggerTransport()]);
};

import { LogTransportBase, Severity } from "@cross/log";

export class MockLoggerTransport extends LogTransportBase {
  errorMessages: string[] = [];
  logMessages: string[] = [];

  log(level: Severity, scope: string, data: unknown[], timestamp: Date) {
    if (super.shouldLog(level)) {
      const formattedMessage = `${timestamp.toISOString()} ${level} ${scope} ${data.join(
        " ",
      )}`;

      if (level === Severity.Error) {
        this.errorMessages.push(formattedMessage);
        console.error(formattedMessage);
      } else {
        this.logMessages.push(formattedMessage);
        console.log(formattedMessage);
      }
    }
  }
}

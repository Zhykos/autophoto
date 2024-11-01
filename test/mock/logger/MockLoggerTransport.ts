import { LogTransportBase, Severity } from "@cross/log";

export class MockLoggerTransport extends LogTransportBase {
  errorMessages: string[] = [];
  warningMessages: string[] = [];
  infoMessages: string[] = [];

  log(level: Severity, scope: string, data: unknown[], timestamp: Date) {
    if (super.shouldLog(level)) {
      const message: string = data.join(" ");
      const formattedMessage = `${timestamp.toISOString()} ${level} ${scope} ${message}`;

      if (level === Severity.Error) {
        this.errorMessages.push(message);
        console.error(formattedMessage);
      } else if (level === Severity.Warn) {
        this.warningMessages.push(message);
        console.warn(formattedMessage);
      } else {
        this.infoMessages.push(message);
        console.log(formattedMessage);
      }
    }
  }
}

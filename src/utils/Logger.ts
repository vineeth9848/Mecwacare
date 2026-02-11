type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'STEP' | 'PASS' | 'FAIL';

export class Logger {
  private static format(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  static info(message: string): void {
    console.log(this.format('INFO', message));
  }

  static warn(message: string): void {
    console.warn(this.format('WARN', message));
  }

  static error(message: string, error?: Error): void {
    const details = error ? ` | ${error.message}` : '';
    console.error(this.format('ERROR', `${message}${details}`));
  }

  static step(message: string): void {
    console.log(this.format('STEP', message));
  }

  static pass(message: string): void {
    console.log(this.format('PASS', message));
  }

  static fail(message: string): void {
    console.error(this.format('FAIL', message));
  }
}

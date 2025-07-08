export class Logger {
  static log(...args: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
       
      console.log(...args);
    }
  }

  static warn(...args: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn(...args);
    }
  }

  static error(...args: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
       
      console.error(...args);
    }
  }
}

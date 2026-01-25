declare module 'bun:sqlite' {
  export class Database {
    constructor(filename: string);
    run(sql: string, ...params: any[]): this;
    prepare(sql: string): {
      get<T = any>(...params: any[]): T | undefined;
      all<T = any>(...params: any[]): T[];
      run(...params: any[]): void;
    };
    close(): void;
  }
}



declare module 'lowdb' {
  import { AdapterSync } from 'lowdb/adapters/FileSync';

  export interface LowdbSync<T> {
    get<K extends keyof T>(key: K): Chain<T, T[K]>;
    set<K extends keyof T>(key: K, value: T[K]): LowdbSync<T>;
    write(): LowdbSync<T>;
    read(): LowdbSync<T>;
    has<K extends keyof T>(key: K): boolean;
    setState(state: T): LowdbSync<T>;
  }

  export interface Chain<T, V> {
    value(): V;
    write(): Chain<T, V>;
  }

  export interface LowdbSyncOptions {
    write?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue?: any;
  }

  export default function lowdb<T>(
    adapter: AdapterSync<T>,
    options?: LowdbSyncOptions,
  ): LowdbSync<T>;
}

declare module 'lowdb/adapters/FileSync' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface AdapterSync<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    read(): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    write(data: any): void;
  }

  export class FileSync<T> implements AdapterSync<T> {
    constructor(source: string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    read(): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    write(data: any): void;
  }

  export default FileSync;
}

declare module 'dockerode' {
  import { EventEmitter } from 'events';
  import { Readable, Writable } from 'stream';

  export interface ContainerCreateOptions {
    Image: string;
    Cmd?: string[];
    WorkingDir?: string;
    Env?: string[];
    HostConfig?: {
      Binds?: string[];
      Memory?: number;
      CpuQuota?: number;
      NetworkMode?: string;
      AutoRemove?: boolean;
      [key: string]: any;
    };
    AttachStdout?: boolean;
    AttachStderr?: boolean;
    [key: string]: any;
  }

  export interface ContainerAttachOptions {
    stream?: boolean;
    stdout?: boolean;
    stderr?: boolean;
    [key: string]: any;
  }

  export interface ContainerWaitResult {
    StatusCode: number;
    [key: string]: any;
  }

  export class Container extends EventEmitter {
    id?: string;
    start(): Promise<void>;
    kill(): Promise<void>;
    attach(options: ContainerAttachOptions): Promise<Readable>;
    wait(callback: (err: Error | null, data: ContainerWaitResult | null) => void): void;
    [key: string]: any;
  }

  export default class Docker {
    ping(): Promise<void>;
    pull(image: string): Promise<any>;
    createContainer(options: ContainerCreateOptions): Promise<Container>;
    getContainer(id: string): Container;
    [key: string]: any;
  }
}


















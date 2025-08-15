import { Provider } from '@nestjs/common';

export interface ModuleOpts<
  C,
  S extends object,
  A extends unknown[] = unknown[],
> {
  controller: new (...args: A) => C;
  service: new (...args: A) => S;
  serviceMethods: (keyof S)[];
  extraProviders?: Provider[];
}

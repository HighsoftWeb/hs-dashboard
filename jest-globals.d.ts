declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function expect<T>(actual: T): {
    toBe(expected: T): void;
    toBeNull(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toEqual(expected: T): void;
    toContain(item: unknown): void;
    toMatch(regex: RegExp | string): void;
    toThrow(error?: string | Error | RegExp): void;
    not: {
      toBe(expected: T): void;
      toBeNull(): void;
      toEqual(expected: T): void;
    };
  };
}

export {};

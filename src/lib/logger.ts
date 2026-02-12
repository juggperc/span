import { dev } from '$app/environment';

const PREFIX = '[Span]';

type LogArgs = unknown[];

function withPrefix(args: LogArgs): LogArgs {
  return [PREFIX, ...args];
}

export function log(...args: LogArgs): void {
  if (dev) {
    console.log(...withPrefix(args));
  }
}

export function warn(...args: LogArgs): void {
  if (dev) {
    console.warn(...withPrefix(args));
  }
}

export function error(...args: LogArgs): void {
  console.error(...withPrefix(args));
}

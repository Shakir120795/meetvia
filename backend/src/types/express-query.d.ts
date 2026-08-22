import 'qs';

declare module 'qs' {
  interface ParsedQs {
    [key: string]: string | undefined;
  }
}

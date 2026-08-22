import 'express';
import 'express-serve-static-core';

declare module 'express' {
  interface Request {
    params: Record<string, string>;
    query: Record<string, string | undefined>;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    params: Record<string, string>;
    query: Record<string, string | undefined>;
  }
}

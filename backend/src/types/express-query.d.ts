import 'express-serve-static-core';
import type { RequestHandler, RequestHandlerParams, RouteParameters } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    query: any;
  }

  interface IRouterMatcher<T, Method extends 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'query' = any> {
    <Route extends string | RegExp, P = RouteParameters<Route>, ResBody = any, ReqBody = any, LocalsObj extends Record<string, any> = Record<string, any>>(
      path: Route,
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, any, LocalsObj>>
    ): T;
    <P = Record<string, string>, ResBody = any, ReqBody = any, LocalsObj extends Record<string, any> = Record<string, any>>(
      path: string | RegExp,
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, any, LocalsObj> | RequestHandlerParams<P, ResBody, ReqBody, any, LocalsObj>>
    ): T;
  }
}

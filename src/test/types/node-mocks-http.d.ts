/**
 * node-mocks-http 패키지에 대한 타입 정의
 */

declare module 'node-mocks-http' {
  import { IncomingMessage, ServerResponse } from 'http';
  import { NextApiRequest, NextApiResponse } from 'next';

  interface RequestOptions {
    method?: string;
    url?: string;
    originalUrl?: string;
    path?: string;
    query?: {
      [key: string]: string | string[] | undefined;
    };
    headers?: {
      [key: string]: string;
    };
    body?: any;
    session?: any;
    cookies?: {
      [key: string]: string;
    };
    [key: string]: any;
  }

  interface ResponseOptions {
    statusCode?: number;
    headers?: {
      [key: string]: string;
    };
    cookies?: {
      [key: string]: string;
    };
    locals?: {
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface MockResponse extends ServerResponse {
    _isEndCalled(): boolean;
    _getHeaders(): { [key: string]: string };
    _getData(): string;
    _getStatusCode(): number;
    _getStatusMessage(): string;
    _isJSON(): boolean;
    _isUTF8(): boolean;
    _getRedirectUrl(): string;
    _getRenderView(): string;
    _getRenderData(): any;
  }

  export function createRequest(options?: RequestOptions): NextApiRequest;
  export function createResponse(options?: ResponseOptions): NextApiResponse & MockResponse;
  export function createMocks(reqOpts?: RequestOptions, resOpts?: ResponseOptions): {
    req: NextApiRequest;
    res: NextApiResponse & MockResponse;
  };
} 
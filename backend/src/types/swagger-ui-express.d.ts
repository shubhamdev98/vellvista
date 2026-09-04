declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  export function setup(swaggerDoc?: any, options?: any, optionsProcessed?: any, customCss?: any, customfavIcon?: any, swaggerUrl?: any, customeSiteTitle?: any): RequestHandler;
  export function serve(req: any, res: any, next: any): any;
  export const serveFiles: (swaggerDoc?: any, options?: any) => RequestHandler[];
}

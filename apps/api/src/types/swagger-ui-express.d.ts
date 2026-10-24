declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  export const serve: RequestHandler[];
  export function setup(swaggerDoc?: object, opts?: object): RequestHandler;
  const swaggerUi: {
    serve: RequestHandler[];
    setup: (swaggerDoc?: object, opts?: object) => RequestHandler;
  };
  export default swaggerUi;
}

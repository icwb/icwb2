import express from 'express';
import cors from 'cors';

class WebService {
  app: express.Application;
  port: number;

  routes: ExpressAppRoute[] = [];

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;

    this.app.use(cors());
  }

  setRoutes(routes: ExpressAppRoute[]) {
    routes.forEach(route => {
      if(['GET', 'POST', 'PUT', 'DELETE'].includes(route.mode)) {
        switch (route.mode) {
          case 'GET':
            this.app.get(route.path, route.handler);
            break;
          case 'POST':
            if(route.parser === 'JSON') {
              this.app.post(route.path, express.json(), route.handler);
            }
            else if(route.parser === 'URLENCODED') {
              this.app.post(route.path, express.urlencoded(), route.handler);
            }
            else {
              this.app.post(route.path, route.handler);
            }
            break;
          case 'PUT':
            if(route.parser === 'JSON') {
              this.app.put(route.path, express.json(), route.handler);
            }
            else if(route.parser === 'URLENCODED') {
              this.app.put(route.path, express.urlencoded(), route.handler);
            }
            else {
              this.app.put(route.path, route.handler);
            }
            break;
          case 'DELETE':
            this.app.delete(route.path, route.handler);
            break;
        }

        this.routes.push(route);
      }
    });
  }

  listen() {
    if(this.routes.length > 0) {
      this.app.listen(this.port, () => {
        console.log(`%c[web]: %cListening on port ${this.port}`, 'color: orange', 'color: unset');
      });
    }
    else {
      console.error(`[web]: Please at least have one route before start listening.`);
    }
  }
}

export default WebService;

export interface ExpressAppRoute {
  path: string;
  mode: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parser?: 'JSON' | 'URLENCODED';
  handler: (request: express.Request, response: express.Response) => void
}

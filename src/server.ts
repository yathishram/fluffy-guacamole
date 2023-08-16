import express, { Express } from 'express';
import { AppConfig } from './config/appConfig';
import { Routes } from './router/routes';

require('dotenv').config();

export class Server {
  app: Express;
  server: any;

  constructor() {
    this.app = express();
  }

  appConfig = () => {
    new AppConfig(this.app).includeConfig();
  };

  routeConfig = () => { 
    new Routes(this.app).routesConfig();
  }

  startServer = () => {
    this.appConfig();
    this.routeConfig();

    //We can connect to the database here. Since am using Supabase, I'll create the object in config and call it where I need it.

    this.server = this.app.listen(process.env.PORT, () => {
      console.log(`Server listening on port ${process.env.PORT}`);
    });
  };

  stopServer = () => {
    process.on('SIGINT', () => {
      console.info('SIGINT signal received.');
      console.log('Closing http server.');
      this.server.close(async () => {
        console.log('Http server closed.');
        process.exit(0);
      });
    });
  };
}

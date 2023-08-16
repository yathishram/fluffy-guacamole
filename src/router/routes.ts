import express, { Express, Router } from 'express';
import { IdentityController } from '../controllers/identityController';

export class Routes {
    app: Express;

    identityRouter: Router;
    identityController: IdentityController


    constructor(app: Express) { 
        this.app = app;
        this.identityRouter = express.Router();
        this.identityController = new IdentityController();
    }

    identityRoutes = () => { 
        this.identityRouter.post('/', this.identityController.handleContacts);
        this.app.use('/identity', this.identityRouter);
    }

    routesConfig = () => { 
        this.identityRoutes();

        this.app.get('/healthcheck', (req, res) => {
            res.status(200).send('I am healthy');
        })

        this.app.get('*', (req, res) => {
            res.send({ message: 'Page not found' });
          });
    }

}
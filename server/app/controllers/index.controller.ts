import { TYPES } from '@app/types';
import { Drawing } from '@common/drawing.interface';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IndexService } from '../services/index.service';

const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_OK = 200;

@injectable()
export class IndexController {
    router: Router;

    constructor(@inject(TYPES.IndexService) private indexService: IndexService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Index
         *     description: Default cadriciel endpoint
         *   - name: Message
         *     description: Messages functions
         */

        /**
         * @swagger
         *
         * /api/index:
         *   get:
         *     description: Return current time with hello world
         *     tags:
         *       - Index
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         *
         */

        /**
         * @swagger
         *
         * /api/index/about:
         *   get:
         *     description: Return information about http api
         *     tags:
         *       - Index
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */

        /**
         * @swagger
         *
         * /api/index/send:
         *   post:
         *     description: Send a message
         *     tags:
         *       - Index
         *       - Message
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Message'
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/send', (req: Request, res: Response, next: NextFunction) => {
            const message: Drawing = req.body;
            this.indexService.saveDrawing(message).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        /**
         * @swagger
         *
         * /api/index/savedDrawings:
         *   post:
         *     description: Save image posted
         *     tags:
         *       - Index
         *       - Message
         *     requestBody:
         *         description:
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Message'
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/savedDrawings', (req: Request, res: Response, next: NextFunction) => {
            res.sendStatus(HTTP_STATUS_CREATED);
        });

        /**
         * @swagger
         *
         * /api/index/all:
         *   get:
         *     description: Return all messages
         *     tags:
         *       - Index
         *       - Message
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: messages
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.get('/drawing', async (req: Request, res: Response, next: NextFunction) => {
            const drawings = await this.indexService.getDrawings();
            res.json(drawings);
        });

        this.router.delete('/drawing/:id', async (req: Request, res: Response, next: NextFunction) => {
            this.indexService.deleteDoc(req.params.id).then(() => res.sendStatus(HTTP_STATUS_OK));
            this.indexService.deleteDrawingFromServer(req.params.id);
        });
    }
}

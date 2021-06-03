import { Application } from '@app/app';
import { TYPES } from '@app/types';
import { Drawing } from '@common/drawing.interface';
import { expect } from 'chai';
import * as supertest from 'supertest';
import { testingContainer } from '../../test/test-utils';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_ERROR_CODE = 500;

describe('IndexController', () => {
    const baseDrawing = { _id: '', name: 'myName', tags: ['firstTag', 'secondTag'] } as Drawing;
    let app: Express.Application;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.IndexService).toConstantValue({
            saveDrawing: sandbox.stub().resolves(),
            deleteDoc: sandbox.stub().resolves(),
            getDrawings: sandbox.stub().resolves([baseDrawing, baseDrawing]),
            deleteDrawingFromServer: sandbox.stub().resolves(),
        });
        app = container.get<Application>(TYPES.Application).app;
        // tslint:disable
    });

    it('should return an array of all the drawings from index service on valid get request to root', async () => {
        return supertest(app)
            .get('/api/index/drawing')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([baseDrawing, baseDrawing]);
            });
    });

    it('should return the 500 status code for an invalid get route and a error body', async () => {
        return supertest(app)
            .get('/api/index/falseRoute')
            .expect(HTTP_ERROR_CODE)
            .then((response: any) => {
                expect(response.body).to.deep.equal({ message: 'Not Found', error: {} });
            });
    });

    it('should return the 200 status code for a valid delete route', async () => {
        return supertest(app).delete('/api/index/drawing/testID').expect(HTTP_STATUS_OK);
    });

    it('should return the 500 status code for an invalid delete route', async () => {
        return supertest(app).delete('/api/index/falseRoute/testID').expect(HTTP_ERROR_CODE);
    });

    it('should return the 201 status code for a valid post route', async () => {
        return supertest(app).post('/api/index/send').expect(HTTP_STATUS_CREATED);
    });

    it('should return the 500 status code for an invalid post route', async () => {
        return supertest(app).post('/api/index/falseRoute').expect(HTTP_ERROR_CODE);
    });
});

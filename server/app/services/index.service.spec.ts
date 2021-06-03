// import { TYPES } from '@app/types';
import { Drawing } from '@app/interface/drawing.interface';
import { expect } from 'chai';
import * as fs from 'fs';
// import { testingContainer } from '../../test/test-utils';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import * as sinon from 'sinon';
import { DatabaseServiceMock } from './database.mock.service';
import { IndexService } from './index.service';

describe('Index service', () => {
    let indexService: IndexService;
    let dataBase: DatabaseServiceMock;
    let client: MongoClient;
    let testDrawing: Drawing;
    beforeEach(async () => {
        dataBase = new DatabaseServiceMock();
        await dataBase.start();
        // tslint:disable
        indexService = new IndexService(dataBase as any);
        client = (await dataBase.start()) as MongoClient;
        testDrawing = { _id: 'myFakeID1234', name: 'myName', tags: ['tags1'] };
        await indexService['db'].db.collection('drawing').insertOne(testDrawing);
    });

    afterEach(async () => {
        await dataBase.closeConnection();
    });

    it(' getDrawings should return an array with the right size', (done: Mocha.Done) => {
        indexService.getDrawings().then((data: Drawing[]) => expect(data.length).to.equal(1));
        done();
    });

    it(' getDrawings should return an array with the right drawing', async () => {
        const drawings = await indexService.getDrawings();
        dataBase.database;
        expect(drawings[0].name).to.equals('myName');
    });

    it('An error should be thrown the connexion is closed() before a get', async () => {
        await client.close();
        expect(indexService.getDrawings()).to.eventually.be.rejectedWith(Error);
    });

    it('An error should be thrown the connexion is closed() before a post', async () => {
        await client.close();
        const secondDrawing = { _id: '012345678910', name: 'myName', tags: ['tags2'] };
        expect(indexService.saveDrawing(secondDrawing)).to.eventually.be.rejectedWith(Error);
    });

    it('An error should be thrown the connexion is closed() before a delete', async () => {
        await client.close();
        expect(indexService.deleteDoc(testDrawing._id)).to.eventually.be.rejectedWith(Error);
    });

    it('saveDrawing should add a drawing to the dataBase', async () => {
        const secondDrawing = { _id: '012345678910', name: 'myName', tags: ['tags2'] };
        await indexService.saveDrawing(secondDrawing);
        const drawings = await indexService.getDrawings();
        for (let i = 0; i < drawings.length; i++) {
            expect(drawings[i].name).to.equals('myName');
        }
        expect(drawings.length).to.equals(2);
    });

    it('DeleteDoc should delete a drawing by its id', async () => {
        const secondDrawing = { _id: '012345678910', name: 'myName', tags: ['tags2'] };
        await indexService.saveDrawing(secondDrawing);
        let drawings = await indexService.getDrawings();
        expect(drawings.length).to.equals(2);
        await indexService.deleteDoc(secondDrawing._id);
        drawings = await indexService.getDrawings();
        expect(drawings.length).to.equals(1);
        expect(drawings[0]._id).to.equals(testDrawing._id);
    });

    it('An error should be thrown for deleteDrawingFromServer when a file does not exist', async () => {
        const unlinkStub = sinon.stub(fs, 'unlink');
        indexService.deleteDrawingFromServer('test');
        expect(unlinkStub.calledOnce).to.be.true;
    });
});

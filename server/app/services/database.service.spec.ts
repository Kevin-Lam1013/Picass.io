import { fail } from 'assert';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    // Start a local test server
    // tslint:disable-no-duplicate-imports
        // tslint:disable
        // @ts-ignore

    beforeEach(async () => {
        databaseService = new DatabaseService();

        

    mongoServer = new MongoMemoryServer();
  });

  afterEach(async () => {
    if (databaseService["client"] && databaseService["client"].isConnected()) {
      await databaseService["client"].close();
    }
  });

  // NB : We dont test the case when DATABASE_URL is used in order to not connect to the real database
  it("should connect to the database when start is called", async () => {
    // Reconnect to local server
    const mongoUri = await mongoServer.getUri();
    await databaseService.start(mongoUri);
    chai.expect(databaseService["client"]).to.not.be.undefined;
    chai.expect(databaseService.db.databaseName).to.equal("database");
  });

  it("should not connect to the database when start is called with wrong URL", async () => {
    // Try to reconnect to local server
    try {
      await databaseService.start("WRONG URL");
      fail();
    } catch {
      chai.expect(databaseService["client"]).to.be.undefined;
    }
  });

  it("should no longer be connected if close is called", async () => {
    const mongoUri = await mongoServer.getUri();
    await databaseService.start(mongoUri);
    await databaseService.closeConnection();
    chai.expect(databaseService["client"].isConnected()).to.be.false;
  });

});

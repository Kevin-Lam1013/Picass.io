import { injectable } from 'inversify';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';

const DATABASE_URL = 'mongodb+srv://Admin:admin@cluster0.0qg4g.mongodb.net/database?retryWrites=true&w=majority';
const DATABASE_NAME = 'database';

@injectable()
export class DatabaseService {
    private database: Db;
    private client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            this.client = await MongoClient.connect(url, this.options);
            this.database = this.client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database not connected');
        }

        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    get db(): Db {
        return this.database;
    }
}

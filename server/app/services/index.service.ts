import { HttpException } from '@app/http.exception';
import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { Drawing } from '@common/drawing.interface';
import { ObjectID } from 'bson';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

const ERROR_CODE = 500;
@injectable()
export class IndexService {
    constructor(@inject(TYPES.DatabaseService) private db: DatabaseService) {}

    async saveDrawing(drawing: Drawing): Promise<void> {
        const id = new ObjectID(drawing._id);
        await this.db.db
            .collection('drawing')
            .insertOne({ _id: id, name: drawing.name, tags: drawing.tags })
            .catch((error: Error) => {
                throw new HttpException(ERROR_CODE, 'Failed to insert drawing');
            });
    }

    async deleteDoc(id: string): Promise<void> {
        await this.db.db
            .collection('drawing')
            .deleteOne({ _id: new ObjectID(id) })
            .catch((error: Error) => {
                throw new HttpException(ERROR_CODE, 'Failed to delete drawing');
            });
    }

    async getDrawings(): Promise<Drawing[]> {
        const drawings = await this.db.db.collection('drawing').find({}).toArray();
        return drawings;
    }

    async deleteDrawingFromServer(id: string): Promise<void> {
        // source : https://nodejs.org/docs/latest/api/fs.html#fs_fs_unlink_path_callback
        fs.unlink('uploads/' + id + '.png', (err) => {
            if (err) {
                throw err;
            }
        });
    }
}

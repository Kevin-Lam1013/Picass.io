import { StatusCodes } from 'http-status-codes';
export class HttpException extends Error {
    constructor(public status: number = StatusCodes.INTERNAL_SERVER_ERROR, message: string) {
        super(message);
        this.name = 'HttpException';
    }
}

import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    copy: ImageData;
    alreadyCopied: boolean = false;

    deleteImageDataRectangle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.fillStyle = 'white';
        ctx.fillRect(path[0].x, path[0].y, path[1].x - path[0].x, path[1].y - path[0].y);
    }
}

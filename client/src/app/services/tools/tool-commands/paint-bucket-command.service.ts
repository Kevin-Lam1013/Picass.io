import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PaintBucketCommandService extends UndoRedoCommand {
    imageData: ImageData;
    drawingService: DrawingService;
    constructor(drawingService: DrawingService) {
        super();
        this.toolStyle = {
            primaryColor: 'rgba(255, 0, 0, 1)',
            lineWidth: 1,
            fill: false,
            secondaryColor: 'black',
        };
        this.drawingService = drawingService;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.putImageData(this.imageData, 0, 0);
    }
}

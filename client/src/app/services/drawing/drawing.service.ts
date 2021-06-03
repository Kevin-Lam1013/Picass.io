import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Constant } from '@app/constants/general-constants-store';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    resizeActive: boolean = false;
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    backgroundMediatorCtx: CanvasRenderingContext2D;
    backgroundCtx: CanvasRenderingContext2D;
    gridCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    drawingStarted: boolean = false;
    canvasSize: Vec2 = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT };

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    clearBackground(): void {
        this.backgroundCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
}

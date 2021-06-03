import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Constant } from '@app/constants/general-constants-store';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class AutoSaveService {
    constructor(public drawingService: DrawingService) {}
    localStorage: Storage = window.localStorage;
    savedCanvasSize: Vec2 = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT };

    saveDrawingDefault(): void {
        this.localStorage.setItem('savedDrawing', this.drawingService.canvas.toDataURL('image/png', 1.0));
        this.localStorage.setItem('canvasWidth', this.drawingService.canvasSize.x.toString());
        this.localStorage.setItem('canvasHeight', this.drawingService.canvasSize.y.toString());
    }

    saveDrawing(canvasSize: Vec2, canvas: HTMLCanvasElement): void {
        this.localStorage.setItem('savedDrawing', canvas.toDataURL('image/png', 1.0));
        this.localStorage.setItem('canvasWidth', canvasSize.x.toString());
        this.localStorage.setItem('canvasHeight', canvasSize.y.toString());
    }

    restoreOldDrawing(): void {
        if (this.localStorage.getItem('savedDrawing') !== null) {
            this.localStorage.setItem('oldDrawing', this.localStorage.getItem('savedDrawing') as string);
            this.localStorage.setItem('oldCanvasWidth', this.localStorage.getItem('canvasWidth') as string);
            this.localStorage.setItem('oldCanvasHeight', this.localStorage.getItem('canvasHeight') as string);
        }
    }

    clearLocalStorage(): void {
        this.localStorage.clear();
    }

    checkIfDrawingStarted(): void {
        if (this.localStorage.getItem('savedDrawing') === null) {
            this.drawingService.drawingStarted = false;
        } else {
            this.drawingService.drawingStarted = true;
        }
    }

    getSavedCanvasSize(): Vec2 {
        if (this.drawingService.drawingStarted) {
            this.savedCanvasSize = {
                x: Number(this.localStorage.getItem('canvasWidth' as string)),
                y: Number(this.localStorage.getItem('canvasHeight' as string)),
            };
        }
        return this.savedCanvasSize;
    }
}

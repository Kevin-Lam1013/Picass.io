import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    constructor(public drawingService: DrawingService) {}

    origin: Vec2 = { x: 0, y: 0 };
    lineOpacity: number = 0.5; // between 0 and 1
    squareSize: number = 50; // in pixels
    canvasWidth: number;
    canvasHeight: number;
    nbOfColumns: number;
    isGridVisible: boolean = false;

    drawGrid(): void {
        this.eraseGrid();
        this.setUpGrid();
        this.drawingService.gridCtx.beginPath();
        for (let column = this.origin.x; column < this.canvasHeight; column += this.squareSize) {
            this.drawingService.gridCtx.moveTo(this.origin.x, column);
            this.drawingService.gridCtx.lineTo(this.canvasWidth, column);
        }
        for (let line = this.origin.y; line < this.canvasWidth; line += this.squareSize) {
            this.drawingService.gridCtx.moveTo(line, this.origin.y);
            this.drawingService.gridCtx.lineTo(line, this.canvasHeight);
        }
        this.drawingService.gridCtx.stroke();
    }

    eraseGrid(): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }

    setUpGrid(): void {
        this.canvasWidth = this.drawingService.canvas.width;
        this.canvasHeight = this.drawingService.canvas.height;
        this.drawingService.gridCtx.strokeStyle = 'rgba(0,0,0,' + this.lineOpacity + ')';
    }

    showGrid(): void {
        this.isGridVisible = !this.isGridVisible;
        if (this.isGridVisible) {
            this.drawGrid();
        } else {
            this.eraseGrid();
        }
    }

    changeGridOpacity(opacity: number): void {
        this.lineOpacity = opacity;
        this.drawGrid();
    }

    changeSquareSize(size: number): void {
        this.squareSize = size;
        this.drawGrid();
    }

    increaseSquareSizebyByFactor(): void {
        const increaseFactor = 5;
        const maxSquareSize = 100;
        if (this.squareSize < maxSquareSize) {
            this.changeSquareSize(this.squareSize + increaseFactor);
        }
    }
    decreaseSquareSizebyByFactor(): void {
        const decreaseFactor = 5;
        const minSquareSize = 5;
        if (this.squareSize > minSquareSize) {
            this.changeSquareSize(this.squareSize - decreaseFactor);
        }
    }
}

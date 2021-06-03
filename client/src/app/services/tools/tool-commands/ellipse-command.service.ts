import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';
import { SquareHelperService } from '@app/services/tools/square-helper.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseCommandService extends UndoRedoCommand {
    startingPoint: Vec2;
    endPoint: Vec2;
    shiftIsPressed: boolean;
    currentLine: Vec2[] = [];
    border: boolean = true;
    isShiftPressed: boolean;
    squareHelperService: SquareHelperService;

    constructor(squareHelperService: SquareHelperService) {
        super();
        this.toolStyle = {
            primaryColor: 'white',
            lineWidth: 1,
            fill: false,
            secondaryColor: 'black',
        };
        this.squareHelperService = squareHelperService;
    }

    setToolStyles(primaryColor: string, lineWidth: number, fill: boolean, secondaryColor: string): void {
        this.toolStyle.primaryColor = primaryColor;
        this.toolStyle.lineWidth = lineWidth;
        this.toolStyle.fill = fill;
        this.toolStyle.secondaryColor = secondaryColor;
    }

    setBorderAndShiftBools(border: boolean, shiftIsPressed: boolean): void {
        this.border = border;
        this.shiftIsPressed = shiftIsPressed;
    }

    setCoordinates(startingPoint: Vec2, endPoint: Vec2, currentLine: Vec2[]): void {
        this.startingPoint = startingPoint;
        this.endPoint = endPoint;
        this.currentLine = currentLine;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        if (!this.border) {
            ctx.strokeStyle = this.toolStyle.primaryColor;
        } else {
            ctx.strokeStyle = this.toolStyle.secondaryColor as string;
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = this.toolStyle.lineWidth;
        const width = this.endPoint.y - this.startingPoint.y;
        const height = this.endPoint.x - this.startingPoint.x;
        const radiusX = width / 2;
        const radiusY = height / 2;

        ctx.beginPath();
        ctx.setLineDash([]);

        if (this.shiftIsPressed) {
            const squareCornerPos = this.squareHelperService.closestSquare([this.startingPoint, this.endPoint]);
            ctx.arc(
                (this.startingPoint.x + squareCornerPos.x) / 2,
                (this.startingPoint.y + squareCornerPos.y) / 2,
                Math.abs((this.startingPoint.x - squareCornerPos.x) / 2),
                0,
                2 * Math.PI,
            );
        } else {
            ctx.ellipse(
                this.startingPoint.x + radiusY,
                this.startingPoint.y + radiusX,
                Math.abs(radiusX),
                Math.abs(radiusY),
                Math.PI / 2,
                0,
                2 * Math.PI,
            );
        }

        if (this.toolStyle.fill) {
            ctx.fillStyle = this.toolStyle.primaryColor;
            ctx.setLineDash([]);
            ctx.fill();
        }
        ctx.stroke();
    }
}

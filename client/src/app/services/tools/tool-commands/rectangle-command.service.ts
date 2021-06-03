import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';
import { SquareHelperService } from '@app/services/tools/square-helper.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleCommandService extends UndoRedoCommand {
    shiftIsPressed: boolean;
    currentLine: Vec2[] = [];
    eventListenerIsSet: boolean;
    contour: boolean = true;
    squareHelperService: SquareHelperService;
    constructor(squareHelperService: SquareHelperService) {
        super();
        this.currentLine = [];
        this.toolStyle = {
            primaryColor: 'rgba(255, 0, 0, 1)',
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

    setContourAndShiftBools(contour: boolean, shiftIsPressed: boolean): void {
        this.contour = contour;
        this.shiftIsPressed = shiftIsPressed;
    }

    setCoordinates(currentLine: Vec2[]): void {
        this.currentLine = currentLine;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        if (!this.contour) {
            ctx.strokeStyle = this.toolStyle.primaryColor;
        } else {
            ctx.strokeStyle = this.toolStyle.secondaryColor as string;
        }

        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = this.toolStyle.lineWidth;
        ctx.lineCap = 'square';

        ctx.moveTo(this.currentLine[0].x, this.currentLine[0].y);
        ctx.lineTo(this.currentLine[1].x, this.currentLine[0].y);

        ctx.moveTo(this.currentLine[0].x, this.currentLine[0].y);
        ctx.lineTo(this.currentLine[0].x, this.currentLine[1].y);

        ctx.moveTo(this.currentLine[0].x, this.currentLine[1].y);
        ctx.lineTo(this.currentLine[1].x, this.currentLine[1].y);

        ctx.moveTo(this.currentLine[1].x, this.currentLine[0].y);
        ctx.lineTo(this.currentLine[1].x, this.currentLine[1].y);
        ctx.stroke();
        if (this.toolStyle.fill) {
            ctx.fillStyle = this.toolStyle.primaryColor;
            ctx.fillRect(
                this.currentLine[0].x,
                this.currentLine[0].y,
                this.currentLine[1].x - this.currentLine[0].x,
                this.currentLine[1].y - this.currentLine[0].y,
            );
        }
    }
}

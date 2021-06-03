import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class EraserCommandService extends UndoRedoCommand {
    private pathData: Vec2[];

    constructor() {
        super();
        this.toolStyle = {
            primaryColor: 'black',
            lineWidth: 5,
            secondaryColor: 'white',
        };
    }

    setStyles(lineWidth: number): void {
        this.toolStyle.lineWidth = lineWidth;
    }

    setCoordinates(pathData: Vec2[]): void {
        this.pathData = pathData;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = this.toolStyle.primaryColor;
        ctx.lineWidth = this.toolStyle.lineWidth;
        ctx.lineCap = 'square';
        ctx.globalCompositeOperation = 'destination-out';
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

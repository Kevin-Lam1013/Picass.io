import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class PencilCommandService extends UndoRedoCommand {
    laspoint: Vec2;
    nexpoint: Vec2;
    pathData: Vec2[];
    canvas: HTMLCanvasElement;

    constructor() {
        super();
        this.toolStyle = {
            primaryColor: 'black',
            lineWidth: 1,
        };
    }

    setPathData(pathData: Vec2[]): void {
        this.pathData = pathData;
    }

    setStyles(primaryColor: string, lineWidth: number): void {
        this.toolStyle.primaryColor = primaryColor;
        this.toolStyle.lineWidth = lineWidth;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = this.toolStyle.primaryColor;
        ctx.lineWidth = this.toolStyle.lineWidth;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'source-over';
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

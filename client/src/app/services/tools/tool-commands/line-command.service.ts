import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class LineCommandService extends UndoRedoCommand {
    hasJunction: boolean = true;
    currentLine: Vec2[][] = [];
    junctions: Vec2[] = [];
    junctionsRadius: number[] = [];

    constructor() {
        super();
        this.toolStyle = { primaryColor: 'black', lineWidth: 5 };
    }

    setCurrentLine(currentLine: Vec2[][]): void {
        this.currentLine = currentLine;
    }

    setJunctions(junctions: Vec2[], junctionsRadius: number[]): void {
        this.junctions = junctions;
        this.junctionsRadius = junctionsRadius;
    }

    setStyles(primaryColor: string, lineWidth: number, hasJunction: boolean): void {
        this.toolStyle.primaryColor = primaryColor;
        this.toolStyle.lineWidth = lineWidth;
        this.hasJunction = hasJunction;
    }

    drawJunction(ctx: CanvasRenderingContext2D, center: Vec2, radius: number): void {
        if (this.hasJunction) {
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = this.toolStyle.lineWidth;
        ctx.strokeStyle = this.toolStyle.primaryColor;

        ctx.moveTo(path[0].x, path[0].y);
        ctx.lineTo(path[1].x, path[1].y);
        ctx.stroke();
    }

    execute(ctx: CanvasRenderingContext2D): void {
        for (const line of this.currentLine) {
            this.drawLine(ctx, line);
        }
        if (this.junctions.length > 0) {
            for (const [index, junction] of this.junctions.entries()) {
                this.drawJunction(ctx, junction, this.junctionsRadius[index]);
            }
        }
    }
}

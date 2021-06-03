import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';

@Injectable({
    providedIn: 'root',
})
export class PolygonCommandService extends UndoRedoCommand {
    contour: boolean = true;
    centerX: number;
    centerY: number;
    angle: number;
    radius: number;
    sides: number = 3;

    constructor() {
        super();
        this.toolStyle = {
            primaryColor: 'rgba(255, 0, 0, 1)',
            lineWidth: 1,
            fill: false,
            secondaryColor: 'black',
        };
    }

    setToolStyles(primaryColor: string, lineWidth: number, fill: boolean, secondaryColor: string): void {
        this.toolStyle.primaryColor = primaryColor;
        this.toolStyle.lineWidth = lineWidth;
        this.toolStyle.fill = fill;
        this.toolStyle.secondaryColor = secondaryColor;
    }

    setPolygoneAttributes(contour: boolean, centerX: number, centerY: number, angle: number, radius: number, sides: number): void {
        this.contour = contour;
        this.centerX = centerX;
        this.centerY = centerY;
        this.angle = angle;
        this.radius = radius;
        this.sides = sides;
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

        ctx.beginPath();
        ctx.setLineDash([]);

        ctx.moveTo(this.centerX + this.radius * Math.cos(0), this.centerY);

        for (let i = 1; i <= this.sides; i++) {
            ctx.lineTo(this.centerX + this.radius * Math.cos(i * this.angle), this.centerY + this.radius * Math.sin(i * this.angle));
        }

        ctx.stroke();

        if (this.toolStyle.fill) {
            ctx.fillStyle = this.toolStyle.primaryColor;
            ctx.fill();
        }
    }
}

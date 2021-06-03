import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';

const EMISSION_TIME = 100; // ms
const CONVERSION_MS_TO_S = 1000;

@Injectable({
    providedIn: 'root',
})
export class AirbrushCommandService extends UndoRedoCommand {
    private pathData: Vec2[];
    jetDiameter: number;
    dropletDiameter: number;
    emissionRate: number;
    emissionsNb: number = 0;
    point: Vec2;
    mouseup: boolean = false;

    constructor() {
        super();
        this.toolStyle = {
            primaryColor: 'black',
            lineWidth: this.jetDiameter,
            fill: true,
        };
    }

    setStyles(
        primaryColor: string,
        lineWidth: number,
        fill: boolean,
        jetDiameter: number,
        dropletDiameter: number,
        emissionRate: number,
        emissionsNb: number,
    ): void {
        this.toolStyle.primaryColor = primaryColor;
        this.toolStyle.lineWidth = lineWidth;
        this.toolStyle.fill = fill;
        this.jetDiameter = jetDiameter;
        this.dropletDiameter = dropletDiameter;
        this.emissionRate = emissionRate;
        this.emissionsNb = emissionsNb;
    }

    setCoordinatesAndPathData(point: Vec2, pathData: Vec2[]): void {
        this.point = point;
        this.pathData = pathData;
    }

    getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';

        this.emitDroplets(ctx, this.point);
        this.createSprayPath(ctx);
    }

    emitDroplets(ctx: CanvasRenderingContext2D, point: Vec2): void {
        const dropletRadius = this.dropletDiameter / 2;
        this.emissionsNb = (this.emissionRate * EMISSION_TIME) / CONVERSION_MS_TO_S;
        for (let i = this.emissionsNb; i--; ) {
            if (!this.mouseup) {
                // random position of each droplet
                const randomAngle = this.getRandomNumber(0, Math.PI * 2);
                const randomRadius = this.getRandomNumber(0, this.jetDiameter / 2);
                const dropletCoord: Vec2 = { x: point.x + randomRadius * Math.cos(randomAngle), y: point.y + randomRadius * Math.sin(randomAngle) };
                ctx.fillStyle = this.toolStyle.primaryColor as string;
                ctx.beginPath();
                ctx.arc(dropletCoord.x, dropletCoord.y, dropletRadius, randomAngle, randomAngle + 2 * Math.PI);
                ctx.fill();
                this.pathData.push(dropletCoord);
            }
        }
    }

    createSprayPath(ctx: CanvasRenderingContext2D): void {
        const dropletRadius = this.dropletDiameter / 2;
        for (const coord of this.pathData) {
            ctx.beginPath();
            ctx.fillStyle = this.toolStyle.primaryColor as string;
            ctx.arc(coord.x, coord.y, dropletRadius / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

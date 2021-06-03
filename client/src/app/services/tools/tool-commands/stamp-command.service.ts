import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';

const ONE_HUNDRED_EIGHTY_DEGREES = 180;
@Injectable({
    providedIn: 'root',
})
export class StampCommandService extends UndoRedoCommand {
    rotationAngle: number = 0;
    stamp: HTMLImageElement;
    stampName: string;
    stampSize: number = 50;
    mouseDownCoord: Vec2 = { x: 0, y: 0 };

    constructor() {
        super();
        this.toolStyle = {
            primaryColor: 'rgba(0,0,0,1)',
            lineWidth: 30,
        };
    }

    setAttributes(rotationAngle: number, stamp: string, stampSize: number, mouseDownCoord: Vec2): void {
        this.rotationAngle = rotationAngle;
        this.stampName = stamp;
        this.stampSize = stampSize;
        this.mouseDownCoord = { x: mouseDownCoord.x, y: mouseDownCoord.y };
    }

    execute(ctx: CanvasRenderingContext2D): void {
        this.stamp = new Image();
        this.stamp.src = this.stampName;
        ctx.globalCompositeOperation = 'source-over';

        // rotation logic: https://stackoverflow.com/questions/17411991/html5-canvas-rotate-image
        ctx.save();
        ctx.translate(this.mouseDownCoord.x, this.mouseDownCoord.y);
        ctx.rotate((this.rotationAngle * Math.PI) / ONE_HUNDRED_EIGHTY_DEGREES);
        ctx.drawImage(this.stamp, -this.stampSize / 2, -this.stampSize / 2, this.stampSize, this.stampSize);
        ctx.restore();
    }
}

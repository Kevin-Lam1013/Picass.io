import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { LineHelperService } from './line-helper.service';

const ANCHOR_RADIUS = 5;
const INDEX_ANCHOR_INIT = 0;
const INDEX_ANCHOR_MH = 1;
const INDEX_ANCHOR_IH = 2;
const INDEX_ANCHOR_MVI = 3;
const INDEX_ANCHOR_FIN = 4;
const INDEX_ANCHOR_MHI = 5;
const INDEX_ANCHOR_IV = 6;
const INDEX_ANCHOR_MV = 7;
const PIXEL_TOLERANCE = 10;
const DISTANCE_ADJUSTEMENT = 5;

@Injectable({
    providedIn: 'root',
})
export class AnchorService {
    currentLine: Vec2[] = [];
    anchorPoints: Vec2[] = [];
    currentAnchor: number;
    shiftIsPressed: boolean;
    lastOffset: Vec2 = { x: 0, y: 0 };
    lineHelper: LineHelperService;
    constructor(public linehelper: LineHelperService) {
        this.lineHelper = linehelper;
    }

    getSelectionData(currentLine: Vec2[], anchorPoints: Vec2[], currentAnchor: number, shiftIsPressed: boolean, lastOffset: Vec2): void {
        this.currentLine = currentLine;
        this.anchorPoints = anchorPoints;
        this.currentAnchor = currentAnchor;
        this.shiftIsPressed = shiftIsPressed;
        this.lastOffset = lastOffset;
    }

    setAnchorPoints(path: Vec2[]): void {
        this.anchorPoints = [];
        this.anchorPoints.push({ x: path[0].x, y: path[0].y });
        this.anchorPoints.push({ x: (path[0].x + path[1].x) / 2, y: path[0].y });
        this.anchorPoints.push({ x: path[1].x, y: path[0].y });
        this.anchorPoints.push({ x: path[1].x, y: (path[0].y + path[1].y) / 2 });
        this.anchorPoints.push({ x: path[1].x, y: path[1].y });
        this.anchorPoints.push({ x: (path[0].x + path[1].x) / 2, y: path[1].y });
        this.anchorPoints.push({ x: path[0].x, y: path[1].y });
        this.anchorPoints.push({ x: path[0].x, y: (path[0].y + path[1].y) / 2 });
    }

    drawAnchorPoints(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.anchorPoints = [];

        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';

        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, ANCHOR_RADIUS, 0, Math.PI * 2); // initial

        ctx.fill();

        ctx.beginPath();
        ctx.arc((path[0].x + path[1].x) / 2, path[0].y, ANCHOR_RADIUS, 0, Math.PI * 2); // milieu horizontal
        ctx.fill();

        ctx.beginPath();
        ctx.arc(path[1].x, path[0].y, ANCHOR_RADIUS, 0, Math.PI * 2); // inverse horizontal
        ctx.fill();

        ctx.beginPath();
        ctx.arc(path[1].x, (path[0].y + path[1].y) / 2, ANCHOR_RADIUS, 0, Math.PI * 2); // milieu vertical inverse
        ctx.fill();

        ctx.beginPath();
        ctx.arc(path[1].x, path[1].y, ANCHOR_RADIUS, 0, Math.PI * 2); // fin
        ctx.fill();

        ctx.beginPath();
        ctx.arc((path[0].x + path[1].x) / 2, path[1].y, ANCHOR_RADIUS, 0, Math.PI * 2); // milieu horizontal inverse
        ctx.fill();

        ctx.beginPath();
        ctx.arc(path[0].x, path[1].y, ANCHOR_RADIUS, 0, Math.PI * 2); // inverse vertical
        ctx.fill();

        ctx.beginPath();
        ctx.arc(path[0].x, (path[0].y + path[1].y) / 2, ANCHOR_RADIUS, 0, Math.PI * 2); // milieu vertical
        ctx.fill();

        this.setAnchorPoints(path);
    }

    moveAnchor(event: MouseEvent): void {
        switch (this.currentAnchor) {
            case INDEX_ANCHOR_INIT: {
                this.initAnchorHandler(event);
                break;
            }
            case INDEX_ANCHOR_MH: {
                this.currentLine[0].y = event.offsetY;
                break;
            }
            case INDEX_ANCHOR_IH: {
                this.IHAnchorHandler(event);
                break;
            }
            case INDEX_ANCHOR_MVI: {
                this.currentLine[1].x = event.offsetX;
                break;
            }
            case INDEX_ANCHOR_FIN: {
                this.finAnchorHandler(event);
                break;
            }
            case INDEX_ANCHOR_MHI: {
                this.currentLine[1].y = event.offsetY;
                break;
            }
            case INDEX_ANCHOR_IV: {
                this.ivAnchorHandler(event);
                break;
            }
            case INDEX_ANCHOR_MV: {
                this.currentLine[0].x = event.offsetX;
                break;
            }
            default:
                return;
        }
    }

    initAnchorHandler(event: MouseEvent): void {
        if (this.shiftIsPressed) {
            const averageDistance: number = (event.offsetX - this.currentLine[0].x + event.offsetY - this.currentLine[0].y) / 2;
            this.currentLine[0].x += averageDistance;
            this.currentLine[0].y += averageDistance;
            return;
        }
        this.currentLine[0].x = event.offsetX;
        this.currentLine[0].y = event.offsetY;
        return;
    }

    IHAnchorHandler(event: MouseEvent): void {
        if (this.shiftIsPressed) {
            const averageDistance: number =
                Math.abs(event.offsetX - this.currentLine[1].x + event.offsetY - this.currentLine[0].y) / DISTANCE_ADJUSTEMENT;
            // tslint:disable-next-line:no-magic-numbers
            const factor: number = event.offsetX < this.lastOffset.x || event.offsetY > this.lastOffset.y ? 1 : -1;
            this.currentLine[1].x -= averageDistance * factor;
            this.currentLine[0].y += averageDistance * factor;
            return;
        }
        this.currentLine[0].y = event.offsetY;
        this.currentLine[1].x = event.offsetX;
        return;
    }

    finAnchorHandler(event: MouseEvent): void {
        if (this.shiftIsPressed) {
            const averageDistance: number = (event.offsetX - this.currentLine[1].x + (event.offsetY - this.currentLine[1].y)) / 2;
            this.currentLine[1].x += averageDistance;
            this.currentLine[1].y += averageDistance;
            return;
        }
        this.currentLine[1].x = event.offsetX;
        this.currentLine[1].y = event.offsetY;
        return;
    }

    ivAnchorHandler(event: MouseEvent): void {
        if (this.shiftIsPressed) {
            const averageDistance: number =
                Math.abs(event.offsetX - this.currentLine[0].x + event.offsetY - this.currentLine[1].y) / DISTANCE_ADJUSTEMENT;
            // tslint:disable-next-line:no-magic-numbers
            const factor: number = event.offsetX < this.lastOffset.x || event.offsetY > this.lastOffset.y ? 1 : -1;
            this.currentLine[0].x -= averageDistance * factor;
            this.currentLine[1].y += averageDistance * factor;
            return;
        }
        this.currentLine[0].x = event.offsetX;
        this.currentLine[1].y = event.offsetY;

        return;
    }

    checkIfClickOnAnchor(event: MouseEvent): boolean {
        const clickCoords: Vec2 = { x: event.offsetX, y: event.offsetY };
        for (const [index, anchor] of this.anchorPoints.entries()) {
            if (this.lineHelper.distanceUtil(clickCoords, anchor) <= PIXEL_TOLERANCE) {
                this.currentAnchor = index;
                return true;
            }
        }
        return false;
    }
}

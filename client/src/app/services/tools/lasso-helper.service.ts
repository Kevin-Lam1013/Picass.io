import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

const INDEXES_PER_PIXEL = 4;
const MINUS_ONE = -1;

@Injectable({
    providedIn: 'root',
})
export class LassoHelperService {
    // source :https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function?answertab=oldest#tab-top
    detectIntersection(newSegment: Vec2[], currentLine: Vec2[][]): boolean {
        for (const line of currentLine) {
            const determinant =
                (line[1].x - line[0].x) * (newSegment[1].y - newSegment[0].y) - (newSegment[1].x - newSegment[0].x) * (line[1].y - line[0].y);
            if (determinant === 0) {
                continue;
            }
            const lambda =
                ((newSegment[1].y - newSegment[0].y) * (newSegment[1].x - line[0].x) +
                    (newSegment[0].x - newSegment[1].x) * (newSegment[1].y - line[0].y)) /
                determinant;
            const gamma =
                ((line[0].y - line[1].y) * (newSegment[1].x - line[0].x) + (line[1].x - line[0].x) * (newSegment[1].y - line[0].y)) / determinant;
            if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1) {
                return true;
            }
        }
        return false;
    }

    // source : https://stackoverflow.com/questions/22521982/check-if-point-is-inside-a-polygon
    isInsidePolygon(point: Vec2, currentLine: Vec2[][]): boolean {
        const polygon: number[][] = [];
        let isInside = false;
        for (const line of currentLine) {
            polygon.push([line[0].x, line[0].y]);
        }
        let j = polygon.length - 1;
        for (let i = 0; i < polygon.length; j = i++) {
            const xi: number = polygon[i][0];
            const yi: number = polygon[i][1];
            const xj: number = polygon[j][0];
            const yj: number = polygon[j][1];

            if (yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
                isInside = !isInside;
            }
        }
        return isInside;
    }

    fixImageData(ctx: CanvasRenderingContext2D, currentLine: Vec2[], imageData: ImageData, lassoPath: Vec2[][]): void {
        const height = currentLine[1].y - currentLine[0].y;
        const width = currentLine[1].x - currentLine[0].x;
        const tmpImgData = ctx.getImageData(currentLine[0].x, currentLine[0].y, width, height);
        for (let i = 0; i < tmpImgData.data.length; i += INDEXES_PER_PIXEL) {
            const x: number = ((i / INDEXES_PER_PIXEL) % imageData.width) + currentLine[0].x;
            const y: number = (Math.floor(i / INDEXES_PER_PIXEL) - x) / imageData.width + currentLine[0].y;
            if (!this.isInsidePolygon({ x, y }, lassoPath)) {
                for (let j = i; j < i + INDEXES_PER_PIXEL; j++) {
                    imageData.data[j] = tmpImgData.data[j];
                }
            }
        }
    }

    clipRegion(ctx: CanvasRenderingContext2D, lassoPath: Vec2[][]): void {
        const tmpImgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let i = 0; i < tmpImgData.data.length; i += INDEXES_PER_PIXEL) {
            const x: number = (i / INDEXES_PER_PIXEL) % tmpImgData.width;
            const y: number = (Math.floor(i / INDEXES_PER_PIXEL) - x) / tmpImgData.width;
            if (this.isInsidePolygon({ x, y }, lassoPath)) {
                for (let j = i; j < i + INDEXES_PER_PIXEL; j++) {
                    tmpImgData.data[j] = 0;
                }
            }
        }
        ctx.putImageData(tmpImgData, 0, 0);
    }

    updateRectangle(lassoPath: Vec2[][], currentLine: Vec2[]): number[] {
        if (currentLine.length > 2) {
            currentLine.pop();
        }
        currentLine[1].x = lassoPath[0][0].x;
        currentLine[1].y = lassoPath[0][0].y;
        currentLine[0].x = lassoPath[0][0].x;
        currentLine[0].y = lassoPath[0][0].y;

        for (const line of lassoPath) {
            currentLine[1].x = Math.max(line[1].x, currentLine[1].x);
            currentLine[0].x = Math.min(line[1].x, currentLine[0].x);
            currentLine[0].y = Math.min(line[1].y, currentLine[0].y);
            currentLine[1].y = Math.max(line[1].y, currentLine[1].y);
        }
        const height = currentLine[1].y - currentLine[0].y;
        const width = currentLine[1].x - currentLine[0].x;
        return [width, height];
    }

    translatePathForPaste(oldCurrentLine: Vec2, lassoPath: Vec2[][]): void {
        for (const line of lassoPath) {
            line[1].x -= oldCurrentLine.x;
            line[1].y -= oldCurrentLine.y;
        }
    }

    translateImage(currentLine: Vec2[], offset: Vec2, lassoPath: Vec2[][], lastPos: Vec2): void {
        currentLine[0].x += offset.x - lastPos.x;
        currentLine[1].x += offset.x - lastPos.x;
        currentLine[1].y += offset.y - lastPos.y;
        currentLine[0].y += offset.y - lastPos.y;
        for (const line of lassoPath) {
            line[1].x += offset.x - lastPos.x;
            line[1].y += offset.y - lastPos.y;
        }
    }

    flipMathematic(currentLine: Vec2[], scaleValue: Vec2): Vec2 {
        if (currentLine[0].x > currentLine[1].x) {
            scaleValue.x = MINUS_ONE;
        }
        if (currentLine[0].y > currentLine[1].y) {
            scaleValue.y = MINUS_ONE;
        }
        let dx: number = currentLine[0].x;
        let dy: number = currentLine[0].y;

        if (scaleValue.x === MINUS_ONE) {
            dx = -currentLine[1].x;
        }
        if (scaleValue.y === MINUS_ONE) {
            dy = -currentLine[1].y;
        }

        return { x: dx, y: dy };
    }

    translateImageWithMagnetism(currentLine: Vec2[], offset: Vec2, lassoPath: Vec2[][]): void {
        currentLine[0].x += offset.x;
        currentLine[1].x += offset.x;
        currentLine[0].y += offset.y;
        currentLine[1].y += offset.y;
        for (const line of lassoPath) {
            line[1].x += offset.x;
            line[1].y += offset.y;
        }
    }
}

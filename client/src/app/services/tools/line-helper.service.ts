import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

const ZERO = 0;
const FORT_FIVE = 45;
const NINETY = 90;
const ONE_THIRTY_FIVE = 135;
const ONE_EIGHTY = 180;
const TWO_TWENTY_FIVE = 225;
const TWO_SEVENTY = 270;
const THREE_FIFTEEN = 315;
const THREE_SIXTY = 360;
export const POSSIBLE_ANGLES: number[] = [
    ZERO,
    FORT_FIVE,
    NINETY,
    ONE_THIRTY_FIVE,
    ONE_EIGHTY,
    TWO_TWENTY_FIVE,
    TWO_SEVENTY,
    THREE_FIFTEEN,
    THREE_SIXTY,
];
const ANGLE_ADJUSTER_180 = 180;
const ANGLE_ADJUSTER_360 = 360;
const PIXEL_DISTANCE = 20;
const TO_RADIAN = Math.PI / ONE_EIGHTY;
const BIG_NUMBER = 999;

@Injectable({
    providedIn: 'root',
})
export class LineHelperService {
    closestValidAngle(start: Vec2, end: Vec2): number {
        let closestValid = BIG_NUMBER;
        const xLenght: number = Math.abs(start.x - end.x);
        const yLenght: number = Math.abs(start.y - end.y);
        let angle: number = Math.atan2(yLenght, xLenght) * (ONE_EIGHTY / Math.PI);
        angle = this.angleQuadrantConverter(start, end, angle);

        for (const angles of POSSIBLE_ANGLES) {
            if (Math.abs(angle - angles) < Math.abs(angle - closestValid)) {
                closestValid = angles;
            }
        }

        return closestValid === THREE_SIXTY ? 0 : closestValid;
    }

    closestAngledPoint(start: Vec2, end: Vec2): Vec2 {
        const closestAngle: number = this.closestValidAngle(start, end);
        const currentVectorMagnitude: number = this.distanceUtil(start, end);
        const xCoord: number = start.x + currentVectorMagnitude * Math.cos(closestAngle * TO_RADIAN);
        const yCoord: number = start.y - currentVectorMagnitude * Math.sin(closestAngle * TO_RADIAN);
        const newLine: Vec2 = { x: xCoord, y: yCoord };

        return newLine;
    }

    distanceUtil(start: Vec2, end: Vec2): number {
        const xLenght = Math.abs(start.x - end.x);
        const yLenght = Math.abs(start.y - end.y);

        return Math.sqrt(xLenght * xLenght + yLenght * yLenght);
    }

    angleQuadrantConverter(start: Vec2, end: Vec2, angle: number): number {
        if (start.x <= end.x && start.y >= end.y) {
            return angle;
        } else if (start.x <= end.x && start.y <= end.y) {
            return ANGLE_ADJUSTER_360 - angle;
        } else if (start.x >= end.x && start.y >= end.y) {
            return ANGLE_ADJUSTER_180 - angle;
        } else {
            return angle + ANGLE_ADJUSTER_180;
        }
    }

    shiftAngleCalculator(start: Vec2, end: Vec2): boolean {
        const xLenght: number = Math.abs(start.x - end.x);
        const yLenght: number = Math.abs(start.y - end.y);
        let angle: number = Math.atan2(yLenght, xLenght) * (ONE_EIGHTY / Math.PI);

        angle = this.angleQuadrantConverter(start, end, angle);
        return angle % FORT_FIVE === 0;
    }

    pixelDistanceUtil(start: Vec2, end: Vec2): boolean {
        const distanceHorizontale = Math.abs(start.x - end.x);
        const distanceVerticale = Math.abs(start.y - end.y);
        return distanceHorizontale <= PIXEL_DISTANCE && distanceVerticale <= PIXEL_DISTANCE;
    }
}

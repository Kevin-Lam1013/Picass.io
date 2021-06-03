import { Injectable } from '@angular/core';
import { ABHKAxis } from '@app/classes/abhk-interface';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class SelectionHelperService {
    checkIfInsideRectangle(event: MouseEvent, currentLine: Vec2[]): boolean {
        const CLICK_COORDS: Vec2 = { x: event.offsetX, y: event.offsetY };
        const X = CLICK_COORDS.x;
        const Y = CLICK_COORDS.y;
        const MIN_X = Math.min(currentLine[0].x, currentLine[1].x);
        const MIN_Y = Math.min(currentLine[0].y, currentLine[1].y);
        const MAX_X = Math.max(currentLine[0].x, currentLine[1].x);
        const MAX_Y = Math.max(currentLine[0].y, currentLine[1].y);
        return X >= MIN_X && X <= MAX_X && Y >= MIN_Y && Y <= MAX_Y;
    }

    checkIfInsideEllipse(parameters: ABHKAxis, x: number, y: number): boolean {
        const firstMember: number = Math.pow(x - parameters.H, 2) / (parameters.A * parameters.A);
        const secondMember: number = Math.pow(y - parameters.K, 2) / (parameters.B * parameters.B);
        return firstMember + secondMember <= 1;
    }

    getABHKXaxis(currentLine: Vec2[]): ABHKAxis {
        const h: number = currentLine[0].x + (currentLine[1].x - currentLine[0].x) / 2;
        const k: number = currentLine[0].y + (currentLine[1].y - currentLine[0].y) / 2;
        let a: number;
        let b: number;
        a = Math.abs(currentLine[0].x - currentLine[1].x) / 2;
        b = Math.abs(currentLine[1].y - currentLine[0].y) / 2;
        const returnValue: ABHKAxis = { A: a, B: b, H: h, K: k };
        return returnValue;
    }
}

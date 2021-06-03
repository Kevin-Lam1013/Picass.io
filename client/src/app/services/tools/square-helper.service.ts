import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class SquareHelperService {
    checkIfIsSquare(pos: Vec2[]): boolean {
        const horizontalDistance: number = Math.abs(pos[0].x - pos[1].x);
        const verticalDistance: number = Math.abs(pos[0].y - pos[1].y);

        if (horizontalDistance === verticalDistance) {
            return true;
        } else {
            return false;
        }
    }

    closestSquare(pos: Vec2[]): Vec2 {
        const horizontalDistance: number = Math.abs(pos[0].x - pos[1].x);
        const verticalDistance: number = Math.abs(pos[0].y - pos[1].y);
        const isLeft: boolean = pos[0].x > pos[1].x;
        const isDownward: boolean = pos[0].y > pos[1].y;

        const smallest = Math.min(horizontalDistance, verticalDistance);

        if (smallest === horizontalDistance) {
            const newPos: Vec2 = {
                x: pos[1].x,
                y: isDownward ? pos[0].y - horizontalDistance : pos[0].y + horizontalDistance,
            };
            return newPos;
        } else {
            const newPos: Vec2 = {
                x: isLeft ? pos[0].x - verticalDistance : pos[0].x + verticalDistance,
                y: pos[1].y,
            };
            return newPos;
        }
    }
}

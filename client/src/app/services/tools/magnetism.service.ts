import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid/grid.service';

@Injectable({
    providedIn: 'root',
})
export class MagnetismService {
    isTopLeft: boolean = true;
    isTopMiddle: boolean = false;
    isTopRight: boolean = false;
    isMiddleLeft: boolean = false;
    isCenter: boolean = false;
    isMiddleRight: boolean = false;
    isBottomLeft: boolean = false;
    isBottomMiddle: boolean = false;
    isBottomRight: boolean = false;
    isActivated: boolean = false;
    mouseReference: Vec2;

    constructor(public gridService: GridService) {}

    resetAnchors(): void {
        this.isTopLeft = false;
        this.isTopMiddle = false;
        this.isTopRight = false;
        this.isMiddleLeft = false;
        this.isCenter = false;
        this.isMiddleRight = false;
        this.isBottomLeft = false;
        this.isBottomMiddle = false;
        this.isBottomRight = false;
    }

    switchOnOrOff(): void {
        this.isActivated = !this.isActivated;
    }

    dispatch(mouseEvent: MouseEvent, currentLine: Vec2[]): Vec2 {
        if (this.isTopLeft) {
            return this.calculateShifting(mouseEvent, currentLine[0], { x: 0, y: 0 });
        }
        if (this.isTopMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: 0 };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        if (this.isTopRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: 0 };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        if (this.isMiddleLeft) {
            const adjustement: Vec2 = { x: 0, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        if (this.isCenter) {
            const adjustement: Vec2 = {
                x: (currentLine[1].x - currentLine[0].x) / 2,
                y: (currentLine[1].y - currentLine[0].y) / 2,
            };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        if (this.isMiddleRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        if (this.isBottomLeft) {
            const adjustement: Vec2 = { x: 0, y: currentLine[1].y - currentLine[0].y };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        if (this.isBottomMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: currentLine[1].y - currentLine[0].y };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        if (this.isBottomRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: currentLine[1].y - currentLine[0].y };
            return this.calculateShifting(mouseEvent, currentLine[0], adjustement);
        }
        return { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
    }

    moveRightHandler(currentLine: Vec2[]): Vec2 {
        if (this.isTopLeft) {
            return this.moveRight(currentLine[0], { x: 0, y: 0 });
        }
        if (this.isTopMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: 0 };
            return this.moveRight(currentLine[0], adjustement);
        }
        if (this.isTopRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: 0 };
            return this.moveRight(currentLine[0], adjustement);
        }
        if (this.isMiddleLeft) {
            const adjustement: Vec2 = { x: 0, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveRight(currentLine[0], adjustement);
        }
        if (this.isCenter) {
            const adjustement: Vec2 = {
                x: (currentLine[1].x - currentLine[0].x) / 2,
                y: (currentLine[1].y - currentLine[0].y) / 2,
            };
            return this.moveRight(currentLine[0], adjustement);
        }
        if (this.isMiddleRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveRight(currentLine[0], adjustement);
        }
        if (this.isBottomLeft) {
            const adjustement: Vec2 = { x: 0, y: currentLine[1].y - currentLine[0].y };
            return this.moveRight(currentLine[0], adjustement);
        }
        if (this.isBottomMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: currentLine[1].y - currentLine[0].y };
            return this.moveRight(currentLine[0], adjustement);
        }
        if (this.isBottomRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: currentLine[1].y - currentLine[0].y };
            return this.moveRight(currentLine[0], adjustement);
        }
        return { x: 0, y: 0 };
    }

    moveLeftHandler(currentLine: Vec2[]): Vec2 {
        if (this.isTopLeft) {
            return this.moveLeft(currentLine[0], { x: 0, y: 0 });
        }
        if (this.isTopMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: 0 };
            return this.moveLeft(currentLine[0], adjustement);
        }
        if (this.isTopRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: 0 };
            return this.moveLeft(currentLine[0], adjustement);
        }
        if (this.isMiddleLeft) {
            const adjustement: Vec2 = { x: 0, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveLeft(currentLine[0], adjustement);
        }
        if (this.isCenter) {
            const adjustement: Vec2 = {
                x: (currentLine[1].x - currentLine[0].x) / 2,
                y: (currentLine[1].y - currentLine[0].y) / 2,
            };
            return this.moveLeft(currentLine[0], adjustement);
        }
        if (this.isMiddleRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveLeft(currentLine[0], adjustement);
        }
        if (this.isBottomLeft) {
            const adjustement: Vec2 = { x: 0, y: currentLine[1].y - currentLine[0].y };
            return this.moveLeft(currentLine[0], adjustement);
        }
        if (this.isBottomMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: currentLine[1].y - currentLine[0].y };
            return this.moveLeft(currentLine[0], adjustement);
        }
        if (this.isBottomRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: currentLine[1].y - currentLine[0].y };
            return this.moveLeft(currentLine[0], adjustement);
        }
        return { x: 0, y: 0 };
    }

    moveUpHandler(currentLine: Vec2[]): Vec2 {
        if (this.isTopLeft) {
            return this.moveUp(currentLine[0], { x: 0, y: 0 });
        }
        if (this.isTopMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: 0 };
            return this.moveUp(currentLine[0], adjustement);
        }
        if (this.isTopRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: 0 };
            return this.moveUp(currentLine[0], adjustement);
        }
        if (this.isMiddleLeft) {
            const adjustement: Vec2 = { x: 0, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveUp(currentLine[0], adjustement);
        }
        if (this.isCenter) {
            const adjustement: Vec2 = {
                x: (currentLine[1].x - currentLine[0].x) / 2,
                y: (currentLine[1].y - currentLine[0].y) / 2,
            };
            return this.moveUp(currentLine[0], adjustement);
        }
        if (this.isMiddleRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveUp(currentLine[0], adjustement);
        }
        if (this.isBottomLeft) {
            const adjustement: Vec2 = { x: 0, y: currentLine[1].y - currentLine[0].y };
            return this.moveUp(currentLine[0], adjustement);
        }
        if (this.isBottomMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: currentLine[1].y - currentLine[0].y };
            return this.moveUp(currentLine[0], adjustement);
        }
        if (this.isBottomRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: currentLine[1].y - currentLine[0].y };
            return this.moveUp(currentLine[0], adjustement);
        }
        return { x: 0, y: 0 };
    }

    moveDownHandler(currentLine: Vec2[]): Vec2 {
        if (this.isTopLeft) {
            return this.moveDown(currentLine[0], { x: 0, y: 0 });
        }
        if (this.isTopMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: 0 };
            return this.moveDown(currentLine[0], adjustement);
        }
        if (this.isTopRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: 0 };
            return this.moveDown(currentLine[0], adjustement);
        }
        if (this.isMiddleLeft) {
            const adjustement: Vec2 = { x: 0, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveDown(currentLine[0], adjustement);
        }
        if (this.isCenter) {
            const adjustement: Vec2 = {
                x: (currentLine[1].x - currentLine[0].x) / 2,
                y: (currentLine[1].y - currentLine[0].y) / 2,
            };
            return this.moveDown(currentLine[0], adjustement);
        }
        if (this.isMiddleRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: (currentLine[1].y - currentLine[0].y) / 2 };
            return this.moveDown(currentLine[0], adjustement);
        }
        if (this.isBottomLeft) {
            const adjustement: Vec2 = { x: 0, y: currentLine[1].y - currentLine[0].y };
            return this.moveDown(currentLine[0], adjustement);
        }
        if (this.isBottomMiddle) {
            const adjustement: Vec2 = { x: (currentLine[1].x - currentLine[0].x) / 2, y: currentLine[1].y - currentLine[0].y };
            return this.moveDown(currentLine[0], adjustement);
        }
        if (this.isBottomRight) {
            const adjustement: Vec2 = { x: currentLine[1].x - currentLine[0].x, y: currentLine[1].y - currentLine[0].y };
            return this.moveDown(currentLine[0], adjustement);
        }
        return { x: 0, y: 0 };
    }

    calculateShifting(mouseEvent: MouseEvent, topLeftCorner: Vec2, adjustement: Vec2): Vec2 {
        const mouseTravelDistance: Vec2 = { x: mouseEvent.offsetX - this.mouseReference.x, y: mouseEvent.offsetY - this.mouseReference.y };
        const selectedAnchor: Vec2 = {
            x: topLeftCorner.x + adjustement.x + mouseTravelDistance.x,
            y: topLeftCorner.y + adjustement.y + mouseTravelDistance.y,
        };

        const newTopLeftCorner: Vec2 = {
            x: Math.round(selectedAnchor.x / this.gridService.squareSize) * this.gridService.squareSize - adjustement.x,
            y: Math.round(selectedAnchor.y / this.gridService.squareSize) * this.gridService.squareSize - adjustement.y,
        };
        return { x: newTopLeftCorner.x - topLeftCorner.x, y: newTopLeftCorner.y - topLeftCorner.y };
    }

    moveLeft(topLeftCorner: Vec2, adjustement: Vec2): Vec2 {
        if ((topLeftCorner.x + adjustement.x) % this.gridService.squareSize === 0) {
            const newPosition = {
                x:
                    Math.round((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize -
                    this.gridService.squareSize -
                    adjustement.x,
                y: Math.round((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.y,
            };
            return { x: newPosition.x - topLeftCorner.x, y: newPosition.y - topLeftCorner.y };
        } else {
            const nearestGrid = {
                x: Math.floor((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.x,
                y: Math.round((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.y,
            };
            return { x: nearestGrid.x - topLeftCorner.x, y: nearestGrid.y - topLeftCorner.y };
        }
    }

    moveRight(topLeftCorner: Vec2, adjustement: Vec2): Vec2 {
        if ((topLeftCorner.x + adjustement.x) % this.gridService.squareSize === 0) {
            const newPosition = {
                x:
                    Math.round((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize +
                    this.gridService.squareSize -
                    adjustement.x,
                y: Math.round((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.y,
            };
            return { x: newPosition.x - topLeftCorner.x, y: newPosition.y - topLeftCorner.y };
        } else {
            const nearestGrid = {
                x: Math.ceil((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.x,
                y: Math.round((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.y,
            };
            return { x: nearestGrid.x - topLeftCorner.x, y: nearestGrid.y - topLeftCorner.y };
        }
    }

    moveUp(topLeftCorner: Vec2, adjustement: Vec2): Vec2 {
        if ((topLeftCorner.y + adjustement.y) % this.gridService.squareSize === 0) {
            const newPosition = {
                x: Math.round((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.x,
                y:
                    Math.round((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize -
                    this.gridService.squareSize -
                    adjustement.y,
            };
            return { x: newPosition.x - topLeftCorner.x, y: newPosition.y - topLeftCorner.y };
        } else {
            const nearestGrid = {
                x: Math.round((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.x,
                y: Math.floor((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.y,
            };
            return { x: nearestGrid.x - topLeftCorner.x, y: nearestGrid.y - topLeftCorner.y };
        }
    }

    moveDown(topLeftCorner: Vec2, adjustement: Vec2): Vec2 {
        if (Math.round(topLeftCorner.y + adjustement.y) % this.gridService.squareSize === 0) {
            const newPosition = {
                x: Math.round((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.x,
                y:
                    Math.round((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize +
                    this.gridService.squareSize -
                    adjustement.y,
            };
            return { x: newPosition.x - topLeftCorner.x, y: newPosition.y - topLeftCorner.y };
        } else {
            const nearestGrid = {
                x: Math.round((topLeftCorner.x + adjustement.x) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.x,
                y: Math.ceil((topLeftCorner.y + adjustement.y) / this.gridService.squareSize) * this.gridService.squareSize - adjustement.y,
            };
            return { x: nearestGrid.x - topLeftCorner.x, y: nearestGrid.y - topLeftCorner.y };
        }
    }
}

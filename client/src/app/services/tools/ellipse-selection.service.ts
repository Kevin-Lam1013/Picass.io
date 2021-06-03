import { Injectable } from '@angular/core';
import { ABHKAxis } from '@app/classes/abhk-interface';
import { Selection } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from '@app/services/tools/clipboard.service';
import { MagnetismService } from '@app/services/tools/magnetism.service';
import { SquareHelperService } from '@app/services/tools/square-helper.service';
import { UndoRedoManagerService } from '@app/services/tools/undo-redo-manager.service';
import { AnchorService } from './anchor.service';
import { LineHelperService } from './line-helper.service';
import { SelectionHelperService } from './selection-helper.service';

const INDEX = 8;
const INDEXES_PER_PIXEL = 4;
const ELLIPSE_LINE_DASH = 3;
@Injectable({
    providedIn: 'root',
})
export class EllipseSelectionService extends Selection {
    constructor(
        public lineHelp: LineHelperService,
        public drawingService: DrawingService,
        public squareHelperService: SquareHelperService,
        public anchorService: AnchorService,
        public selecHelper: SelectionHelperService,
        public clipboardService: ClipboardService,
        public magnetismService: MagnetismService,
        public undoRedoManager: UndoRedoManagerService,
    ) {
        super(drawingService, undoRedoManager, lineHelp, anchorService, magnetismService, clipboardService);
        this.shortcut = 's';
        this.index = INDEX;
        this.lineHelper = lineHelp;
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: 1,
            secondaryColor: 'black',
        };
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown) {
            this.undoRedoManager.disableUndoRedo();
            if (this.currentLine.length > 0) {
                if (this.checkIfClickOnAnchor(mouseDownEvent)) {
                    this.changeAnchor = true;
                    return;
                }
                const ELLIPSE_PARAMETERS: ABHKAxis = this.selecHelper.getABHKXaxis(this.currentLine);
                if (!this.selecHelper.checkIfInsideEllipse(ELLIPSE_PARAMETERS, mouseDownEvent.offsetX, mouseDownEvent.offsetY)) {
                    this.resetState();
                    this.isMovingImg = false;
                    return;
                }
                this.changeAnchor = false;
                this.isMovingImg = true;
                this.lastPos = this.getPositionFromMouse(mouseDownEvent);
                this.magnetismService.mouseReference = this.getPositionFromMouse(mouseDownEvent);
                return;
            } else {
                this.isMovingImg = false;
            }
            this.anchorPoints = [];
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.currentLine[0] = this.mouseDownCoord;
        }
    }

    setShiftIsPressed = (keyDownShiftEvent: KeyboardEvent) => {
        if (keyDownShiftEvent.key === 'Shift') {
            this.shiftIsPressed = true;
            if (!this.squareHelperService.checkIfIsSquare([this.currentLine[0], this.currentLine[1]]) && this.mouseDown && !this.changeAnchor) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawEllipse(this.drawingService.previewCtx, this.currentLine[0], this.currentLine[1], false);
                this.drawRectangle(this.drawingService.previewCtx, [
                    this.currentLine[0],
                    this.squareHelperService.closestSquare([this.currentLine[0], this.currentLine[1]]),
                ]);
            }
        }
    };

    setShiftNonPressed = (keyUpShiftEvent: KeyboardEvent): void => {
        if (keyUpShiftEvent.key === 'Shift') {
            this.shiftIsPressed = false;
            if (this.mouseDown && !this.drawingService.resizeActive && !this.changeAnchor) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawEllipse(this.drawingService.previewCtx, this.currentLine[0], this.currentLine[1], false);
                this.drawRectangle(this.drawingService.previewCtx, [this.currentLine[0], this.currentLine[1]]);
            }
            window.removeEventListener('keydown', this.setShiftIsPressed);
            window.removeEventListener('keyup', this.setShiftNonPressed);
            if (this.changeAnchor) {
                const mockMouseEvent: MouseEvent = { offsetX: this.currentMousePos.x, offsetY: this.currentMousePos.y, button: 0 } as MouseEvent;
                this.moveAnchor(mockMouseEvent);
            }
        }
    };

    getImageData(): ImageData {
        const width: number = this.currentLine[1].x - this.currentLine[0].x;
        const height: number = this.currentLine[1].y - this.currentLine[0].y;
        const imgData = this.drawingService.baseCtx.getImageData(this.currentLine[0].x, this.currentLine[0].y, width, height);
        this.drawEllipse(this.drawingService.baseCtx, this.currentLine[0], this.currentLine[1], true);
        this.backgroundImageData = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.baseCtx.canvas.width,
            this.drawingService.baseCtx.canvas.height,
        );
        let x: number = this.currentLine[0].x;
        let y: number = this.currentLine[0].y;
        if (this.currentLine[0].x > this.currentLine[1].x) {
            x = this.currentLine[1].x;
        }
        if (this.currentLine[0].y > this.currentLine[1].y) {
            y = this.currentLine[1].y;
        }
        this.drawingService.baseCtx.putImageData(imgData, x, y);
        this.currentlySelecting = true;
        return imgData;
    }

    fixImageData(): void {
        const width: number = this.currentLine[1].x - this.currentLine[0].x;
        const height: number = this.currentLine[1].y - this.currentLine[0].y;
        const tmpImgData = this.drawingService.baseCtx.getImageData(this.currentLine[0].x, this.currentLine[0].y, width, height);
        const ELLIPSE_PARAMETERS: ABHKAxis = this.selecHelper.getABHKXaxis(this.currentLine);
        for (let i = 0; i < tmpImgData.data.length; i += INDEXES_PER_PIXEL) {
            const x: number = ((i / INDEXES_PER_PIXEL) % this.imageData.width) + this.currentLine[0].x;
            const y: number = Math.floor(i / INDEXES_PER_PIXEL - x) / this.imageData.width + this.currentLine[0].y;
            if (!this.selecHelper.checkIfInsideEllipse(ELLIPSE_PARAMETERS, x, y)) {
                for (let j = i; j < i + INDEXES_PER_PIXEL; j++) {
                    this.imageData.data[j] = tmpImgData.data[j];
                }
            }
        }
    }

    moveImageData(offsetX: number, offsetY: number): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        if (!this.magnetismService.isActivated) {
            offsetX -= this.lastPos.x;
            offsetY -= this.lastPos.y;
        }
        this.currentLine[0].x += offsetX;
        this.currentLine[1].x += offsetX;
        this.currentLine[0].y += offsetY;
        this.currentLine[1].y += offsetY;
        this.drawingService.baseCtx.putImageData(this.backgroundImageData, 0, 0);
        let x: number = this.currentLine[0].x;
        let y: number = this.currentLine[0].y;
        if (this.currentLine[0].x > this.currentLine[1].x) {
            x = this.currentLine[1].x;
        }
        if (this.currentLine[0].y > this.currentLine[1].y) {
            y = this.currentLine[1].y;
        }
        this.fixImageData();
        this.drawingService.baseCtx.putImageData(this.imageData, x, y);
        this.drawSelection(false);
        if (!this.magnetismService.isActivated) {
            this.lastPos.x = offsetX + this.lastPos.x;
            this.lastPos.y = offsetY + this.lastPos.y;
        } else {
            this.magnetismService.mouseReference.x += offsetX;
            this.magnetismService.mouseReference.y += offsetY;
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            this.undoRedoManager.enableUndoRedo();
            this.mouseDown = false;
            if (this.changeAnchor) {
                this.changeAnchor = false;
                this.setImageData();
                this.fixCurrentLine();
                this.lastPos = this.getPositionFromMouse(mouseUpEvent);
                return;
            }
            if (this.hasBeenReseted) {
                this.hasBeenReseted = false;
                return;
            }
            if (!this.currentlySelecting) {
                this.imageData = this.getImageData();
            }
            if (this.isMovingImg) {
                this.fixImageData();
                return;
            }
            if (!this.shiftIsPressed) {
                const mousePosition = this.getPositionFromMouse(mouseUpEvent);
                this.endPoint = mousePosition;
                this.currentLine = [this.currentLine[0], this.endPoint];
            }
            this.lastPos.x = mouseUpEvent.offsetX;
            this.lastPos.y = mouseUpEvent.offsetY;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.fixCurrentLine();
            this.drawSelection(false);
        }
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive && !this.hasBeenReseted) {
            this.undoRedoManager.disableUndoRedo();
            this.currentMousePos = this.getPositionFromMouse(mouseMoveEvent);
            if (this.changeAnchor) {
                this.moveAnchor(mouseMoveEvent);
                return;
            }
            if (this.isMovingImg) {
                if (this.magnetismService.isActivated) {
                    const shifting: Vec2 = this.magnetismService.dispatch(mouseMoveEvent, this.currentLine);
                    this.moveImageData(shifting.x, shifting.y);
                    return;
                }
                this.moveImageData(mouseMoveEvent.offsetX, mouseMoveEvent.offsetY);
                return;
            }
            const mousePosition = this.getPositionFromMouse(mouseMoveEvent);
            this.currentLine[1] = mousePosition;
            if (this.shiftIsPressed && !this.changeAnchor) {
                this.endPoint = this.squareHelperService.closestSquare([this.currentLine[0], this.currentLine[1]]);
            }
            this.currentLine = [this.currentLine[0], this.currentLine[1]];
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, this.currentLine[0], this.currentLine[1], false);
            this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
        }
    }

    resizeSelection(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawSelection(false);
        this.drawingService.baseCtx.putImageData(this.backgroundImageData, 0, 0);
        createImageBitmap(this.imageData).then((imgBitmap) => {
            this.drawingService.baseCtx.strokeStyle = 'black';
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.baseCtx.save();
            let horizontalFlip = 1;
            let verticalFlip = 1;
            if (this.currentLine[0].x > this.currentLine[1].x) {
                // tslint:disable-next-line:no-magic-numbers
                horizontalFlip *= -1; // * -1 pour pouvoir flip horizontalement
            }
            if (this.currentLine[0].y > this.currentLine[1].y) {
                // tslint:disable-next-line:no-magic-numbers
                verticalFlip *= -1; // * -1 pour pouvoir flip verticalement
            }
            let dx: number = this.currentLine[0].x;
            let dy: number = this.currentLine[0].y;
            if (horizontalFlip < 0) {
                dx = -this.currentLine[1].x;
            }
            if (verticalFlip < 0) {
                dy = -this.currentLine[1].y;
            }
            this.drawingService.baseCtx.scale(horizontalFlip, verticalFlip);
            this.drawingService.baseCtx.drawImage(
                imgBitmap,
                dx,
                dy,
                this.currentLine[1].x - this.currentLine[0].x,
                this.currentLine[1].y - this.currentLine[0].y,
            );
            this.drawingService.baseCtx.restore();
        });
        this.lastPos.x = event.offsetX;
        this.lastPos.y = event.offsetY;
    }

    drawSelection(erase: boolean): void {
        this.drawAnchorPoints(this.drawingService.previewCtx, this.currentLine);
        this.drawEllipse(this.drawingService.previewCtx, this.currentLine[0], this.currentLine[1], erase);
        this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
    }

    drawEllipse(ctx: CanvasRenderingContext2D, start: Vec2, end: Vec2, erase: boolean): void {
        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.globalCompositeOperation = 'source-over';
        const width = end.y - start.y;
        const height = end.x - start.x;
        const radiusX = width / 2;
        const radiusY = height / 2;
        ctx.beginPath();
        if (!erase) {
            ctx.setLineDash([ELLIPSE_LINE_DASH]);
        } else {
            ctx.setLineDash([]);
        }
        if (this.shiftIsPressed && !this.changeAnchor) {
            const squareCornerPos = this.squareHelperService.closestSquare([this.currentLine[0], this.currentLine[1]]);
            ctx.arc(
                (this.currentLine[0].x + squareCornerPos.x) / 2,
                (this.currentLine[0].y + squareCornerPos.y) / 2,
                Math.abs((this.currentLine[0].x - squareCornerPos.x) / 2),
                0,
                2 * Math.PI,
            );
        } else {
            ctx.ellipse(start.x + radiusY, start.y + radiusX, Math.abs(radiusX), Math.abs(radiusY), Math.PI / 2, 0, 2 * Math.PI);
        }
        if (erase) {
            ctx.fillStyle = 'white';
            ctx.fill();
            return;
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    deleteSelection(): void {
        this.drawEllipse(this.drawingService.baseCtx, this.currentLine[0], this.currentLine[1], true);
        this.imageData = this.getImageData();
        this.resetStateForPaste();
    }

    pasteSelection(): void {
        if (this.clipboardService.alreadyCopied && this.currentLine.length > 0) {
            this.backgroundImageData = this.drawingService.baseCtx.getImageData(
                0,
                0,
                this.drawingService.baseCtx.canvas.width,
                this.drawingService.baseCtx.canvas.height,
            );
            this.currentLine = [
                { x: 0, y: 0 },
                { x: this.clipboardService.copy.width, y: this.clipboardService.copy.height },
            ];
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.imageData = this.clipboardService.copy;
            this.fixImageData();
            this.drawingService.previewCtx.putImageData(this.imageData, this.currentLine[0].x, this.currentLine[0].y);
            this.drawSelection(false);
        }
    }
}

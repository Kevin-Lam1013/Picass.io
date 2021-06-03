import { Injectable } from '@angular/core';
import { Selection } from '@app/classes/selection';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from '@app/services/tools/clipboard.service';
import { LineHelperService } from '@app/services/tools/line-helper.service';
import { MagnetismService } from '@app/services/tools/magnetism.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
import { SelectionHelperService } from '@app/services/tools/selection-helper.service';
import { SquareHelperService } from '@app/services/tools/square-helper.service';
import { UndoRedoManagerService } from '@app/services/tools/undo-redo-manager.service';
import { AnchorService } from './anchor.service';

const INDEX = 7;
const ANCHOR_OFFSET = 3;

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends Selection {
    eventListenerIsSet: boolean;
    contour: boolean = true;
    allowShift: boolean = true;

    constructor(
        public drawingService: DrawingService,
        public squareHelperService: SquareHelperService,
        public rectangleService: RectangleService,
        public lineHelper: LineHelperService,
        public anchorService: AnchorService,
        public selecHelper: SelectionHelperService,
        undoRedoManager: UndoRedoManagerService,
        public magnetismService: MagnetismService,
        public clipboardService: ClipboardService,
    ) {
        super(drawingService, undoRedoManager, lineHelper, anchorService, magnetismService, clipboardService);
        this.shortcut = 'r';
        this.currentLine = [];
        this.index = INDEX;
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: 1,
            fill: true,
            secondaryColor: 'black',
        };
        this.hasBeenReseted = false;
    }

    selectAll(): void {
        this.currentLine = [
            { x: 0, y: 0 },
            { x: this.drawingService.baseCtx.canvas.offsetWidth, y: this.drawingService.baseCtx.canvas.offsetHeight - ANCHOR_OFFSET },
        ];
        this.backgroundImageData = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.baseCtx.canvas.width,
            this.drawingService.baseCtx.canvas.height,
        );
        this.imageData = this.getImageData();
        this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
        this.drawAnchorPoints(this.drawingService.previewCtx, this.currentLine);
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown) {
            this.undoRedoManager.disableUndoRedo();
            if (this.currentLine.length > 0) {
                if (this.checkIfClickOnAnchor(mouseDownEvent)) {
                    this.changeAnchor = true;
                    this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
                    this.lastOffset = this.getPositionFromMouse(mouseDownEvent);
                    return;
                }

                if (!this.selecHelper.checkIfInsideRectangle(mouseDownEvent, this.currentLine)) {
                    this.resetState();
                    this.isMovingImg = false;
                    return;
                }
                this.changeAnchor = false;
                this.isMovingImg = true;
                this.lastPos = this.getPositionFromMouse(mouseDownEvent);
                this.magnetismService.mouseReference = this.getPositionFromMouse(mouseDownEvent);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                return;
            }
            this.isMovingImg = false;
            this.anchorPoints = [];
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.startingPoint = this.mouseDownCoord;
            this.lastPos.x = mouseDownEvent.offsetX;
            this.lastPos.y = mouseDownEvent.offsetY;
        }
    }

    setShiftIsPressed = (keyDownShiftEvent: KeyboardEvent) => {
        if (keyDownShiftEvent.key === 'Shift' && this.allowShift) {
            this.shiftIsPressed = true;
            if (
                !this.squareHelperService.checkIfIsSquare([this.startingPoint, this.endPoint]) &&
                !this.drawingService.resizeActive &&
                this.mouseDown &&
                !this.changeAnchor
            ) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.currentLine = [this.startingPoint, this.squareHelperService.closestSquare([this.startingPoint, this.endPoint])];
                this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
            }
        }
    };

    setShiftNonPressed = (keyUpShiftEvent: KeyboardEvent) => {
        if (keyUpShiftEvent.key === 'Shift') {
            this.shiftIsPressed = false;
            if (this.mouseDown && !this.drawingService.resizeActive && !this.changeAnchor) {
                window.removeEventListener('keypress', this.setShiftIsPressed);
                window.removeEventListener('keyup', this.setShiftNonPressed);
                this.currentLine = [this.startingPoint, this.endPoint];
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
                this.drawAnchorPoints(this.drawingService.previewCtx, this.currentLine);
            } else {
                this.allowShift = true;
                if (this.changeAnchor) {
                    let mockMouseEvent: MouseEvent;
                    mockMouseEvent = { offsetX: this.currentMousePos.x, offsetY: this.currentMousePos.y, button: 0 } as MouseEvent;
                    this.moveAnchor(mockMouseEvent);
                }
            }
        }
    };

    getImageData(): ImageData {
        const width: number = this.currentLine[1].x - this.currentLine[0].x;
        const height: number = this.currentLine[1].y - this.currentLine[0].y;
        const imgData = this.drawingService.baseCtx.getImageData(this.currentLine[0].x, this.currentLine[0].y, width, height);
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fillRect(this.currentLine[0].x, this.currentLine[0].y, width, height);
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

    moveImageData(offsetX: number, offsetY: number): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.baseCtx);

        if (!this.magnetismService.isActivated) {
            this.currentLine[0].x += offsetX - this.lastPos.x;
            this.currentLine[1].x += offsetX - this.lastPos.x;
            this.currentLine[0].y += offsetY - this.lastPos.y;
            this.currentLine[1].y += offsetY - this.lastPos.y;
        } else {
            this.currentLine[0].x += offsetX;
            this.currentLine[1].x += offsetX;
            this.currentLine[0].y += offsetY;
            this.currentLine[1].y += offsetY;
        }
        let x: number = this.currentLine[0].x;
        let y: number = this.currentLine[0].y;
        if (this.currentLine[0].x > this.currentLine[1].x) {
            x = this.currentLine[1].x;
        }
        if (this.currentLine[0].y > this.currentLine[1].y) {
            y = this.currentLine[1].y;
        }
        this.drawingService.baseCtx.putImageData(this.backgroundImageData, 0, 0);
        this.drawingService.baseCtx.putImageData(this.imageData, x, y);
        this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
        this.drawAnchorPoints(this.drawingService.previewCtx, this.currentLine);
        if (!this.magnetismService.isActivated) {
            this.lastPos.x = offsetX;
            this.lastPos.y = offsetY;
        } else {
            this.magnetismService.mouseReference.x += offsetX;
            this.magnetismService.mouseReference.y += offsetY;
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            this.undoRedoManager.enableUndoRedo();
            if (this.hasBeenReseted) {
                this.hasBeenReseted = false;
                this.mouseDown = false;
                return;
            }

            if (this.changeAnchor) {
                this.changeAnchor = false;
                this.mouseDown = false;
                this.setImageData();
                this.fixCurrentLine();
                this.changeAnchor = false;
                this.lastPos = this.getPositionFromMouse(mouseUpEvent);
                return;
            }

            if (!this.currentlySelecting) {
                this.imageData = this.getImageData();
            }
            if (this.isMovingImg) {
                this.mouseDown = false;
                return;
            }

            if (!this.shiftIsPressed) {
                const mousePosition = this.getPositionFromMouse(mouseUpEvent);
                this.endPoint = mousePosition;
                this.currentLine = [this.startingPoint, this.endPoint];
            }

            this.drawAnchorPoints(this.drawingService.previewCtx, this.currentLine);
            this.mouseDown = false;
        }
    }

    resizeSelection(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
        this.drawAnchorPoints(this.drawingService.previewCtx, this.currentLine);
        this.drawingService.baseCtx.putImageData(this.backgroundImageData, 0, 0);
        createImageBitmap(this.imageData).then((imgBitmap) => {
            this.drawingService.baseCtx.save();
            let horizontalFlip = 1;
            let verticalFlip = 1;
            if (this.currentLine[0].x > this.currentLine[1].x) {
                // tslint:disable-next-line:no-magic-numbers
                horizontalFlip *= -1;
            }
            if (this.currentLine[0].y > this.currentLine[1].y) {
                // tslint:disable-next-line:no-magic-numbers
                verticalFlip *= -1;
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
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive && !this.hasBeenReseted) {
            this.currentMousePos = this.getPositionFromMouse(mouseMoveEvent);
            this.undoRedoManager.disableUndoRedo();
            this.hasBeenReseted = false;
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
            this.endPoint = mousePosition;
            if (this.shiftIsPressed) {
                this.currentLine = [this.startingPoint, this.squareHelperService.closestSquare([this.startingPoint, this.endPoint])];
                if (this.squareHelperService.checkIfIsSquare([this.startingPoint, this.endPoint])) {
                    this.currentLine = [this.startingPoint, this.endPoint];
                }
            } else {
                this.currentLine = [this.startingPoint, this.endPoint];
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
        }
    }

    deleteSelection(): void {
        this.clipboardService.deleteImageDataRectangle(this.drawingService.baseCtx, this.currentLine);
        this.imageData = this.getImageData();
        this.resetStateForPaste();
    }

    pasteSelection(): void {
        if (this.clipboardService.alreadyCopied && this.currentLine.length > 0) {
            this.currentlySelecting = true;
            this.isMovingImg = true;
            this.backgroundImageData = this.drawingService.baseCtx.getImageData(
                0,
                0,
                this.drawingService.baseCtx.canvas.width,
                this.drawingService.baseCtx.canvas.height,
            );
            this.drawingService.baseCtx.putImageData(this.imageData, this.currentLine[0].x, this.currentLine[0].y);
            this.currentLine = [
                { x: 0, y: 0 },
                { x: this.clipboardService.copy.width, y: this.clipboardService.copy.height },
            ];
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.currentLine);
            this.drawAnchorPoints(this.drawingService.previewCtx, this.currentLine);
            this.drawingService.baseCtx.putImageData(this.clipboardService.copy, this.currentLine[0].x, this.currentLine[0].y);
            this.imageData = this.clipboardService.copy;
        }
    }
}

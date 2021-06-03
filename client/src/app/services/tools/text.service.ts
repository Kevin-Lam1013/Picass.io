import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { Constant } from '@app/constants/general-constants-store';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextCommandService } from '@app/services/tools/tool-commands/text-command.service';
import { UndoRedoManagerService } from '@app/services/tools/undo-redo-manager.service';
import { ColorService } from './color.service';

const INDEX = 10;
const LINE_DASH = 5;
const EXTRA_SPACING = 7;

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    undoRedoManager: UndoRedoManagerService;
    font: string = 'Arial';
    fontSize: number = 30;
    bold: boolean = false;
    italic: boolean = false;
    creatingTextBox: boolean = false;
    mouseDown: boolean = false;
    startingPoint: Vec2 = { x: 0, y: 0 };
    endPoint: Vec2 = { x: 0, y: 0 };
    currentLine: Vec2[] = [];
    hasBeenReset: boolean = false;
    textArray: string[] = [''];
    alignment: CanvasTextAlign = 'left';
    textBoxActive: boolean = false;
    cursorPosition: Vec2 = { x: 0, y: 0 }; // column idx = x, row idx = y
    allowText: boolean = true;

    constructor(drawingService: DrawingService, undoRedoManager: UndoRedoManagerService, public colorService: ColorService) {
        super(drawingService);
        this.undoRedoManager = undoRedoManager;
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: this.fontSize,
        };
        this.shortcut = 't';
        this.index = INDEX;
        this.localShortcuts = new Map();
        this.toolName = 'Texte';
    }

    reverseBold(): void {
        this.bold = !this.bold;
        this.clearAndDrawPreview();
    }

    reverseItalic(): void {
        this.italic = !this.italic;
        this.clearAndDrawPreview();
    }

    changeFontSize(size: number): void {
        this.fontSize = size;
        this.clearAndDrawPreview();
    }

    changeFont(newFont: string): void {
        this.font = newFont;
        this.clearAndDrawPreview();
    }

    changeAlignment(newAlignment: CanvasTextAlign): void {
        this.alignment = newAlignment;
        this.clearAndDrawPreview();
    }

    resetState(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.textArray.length >= 1 && this.textArray[0].length !== 0) {
            const textCommand: TextCommandService = new TextCommandService();
            this.drawText(this.drawingService.baseCtx, textCommand);
            this.undoRedoManager.undoStack.push(textCommand);
            this.undoRedoManager.clearRedoStack();
        }
        this.cursorPosition = { x: 0, y: 0 };
        this.hasBeenReset = true;
        this.creatingTextBox = false;
        this.clearArrays();
        this.textBoxActive = false;
    }

    checkIfInsideRectangle(event: MouseEvent): boolean {
        const CLICK_COORDS: Vec2 = { x: event.offsetX, y: event.offsetY };
        const X = CLICK_COORDS.x;
        const Y = CLICK_COORDS.y;
        const MIN_X = this.currentLine[0].x;
        const MIN_Y = this.currentLine[0].y;
        const MAX_X = this.currentLine[1].x;
        const MAX_Y = this.currentLine[1].y;
        return X > MIN_X && X < MAX_X && Y > MIN_Y && Y < MAX_Y;
    }

    clearArrays(): void {
        this.textArray = [''];
        this.currentLine = [];
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown) {
            this.undoRedoManager.disableUndoRedo();
            if (this.currentLine.length > 0) {
                if (!this.checkIfInsideRectangle(mouseDownEvent)) {
                    this.resetState();
                    return;
                }
                return;
            }
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.startingPoint = this.mouseDownCoord;
        }
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive && !this.hasBeenReset) {
            this.undoRedoManager.disableUndoRedo();
            this.hasBeenReset = false;
            const mousePosition = this.getPositionFromMouse(mouseMoveEvent);
            this.endPoint = mousePosition;
            this.currentLine = [this.startingPoint, this.endPoint];
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawTextBox(this.drawingService.previewCtx, this.currentLine);
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            this.undoRedoManager.enableUndoRedo();
            if (this.hasBeenReset) {
                this.hasBeenReset = false;
                this.mouseDown = false;
                return;
            }
            const mousePosition = this.getPositionFromMouse(mouseUpEvent);
            if (!this.textBoxActive && !this.checkIfInsideRectangle(mouseUpEvent)) this.endPoint = mousePosition;
            this.currentLine = [this.startingPoint, this.endPoint];
            this.mouseDown = false;
        }
    }

    drawTextBox(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.fillStyle = 'white';
        ctx.setLineDash([LINE_DASH, LINE_DASH]);
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1;
        ctx.lineCap = 'square';
        ctx.strokeStyle = 'black';
        ctx.strokeRect(path[0].x, path[0].y, path[1].x - path[0].x, path[1].y - path[0].y);
        ctx.closePath();
        this.textBoxActive = true;
        ctx.setLineDash([]);
    }

    enterKey(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'Enter' && this.textBoxActive) {
            this.cursorPosition.y++;
            const tempString: string = this.textArray[this.cursorPosition.y - 1].slice(this.cursorPosition.x);
            this.textArray.splice(this.cursorPosition.y, 0, tempString);
            this.textArray[this.cursorPosition.y - 1] = this.textArray[this.cursorPosition.y - 1].slice(0, this.cursorPosition.x);
            this.cursorPosition.x = 0;
            const cursorPositionY: number = this.textArray.length * this.fontSize;
            if (cursorPositionY >= this.endPoint.y - this.startingPoint.y + this.fontSize / 2) {
                this.endPoint.y += this.fontSize;
            }
            this.clearAndDrawPreview();
        }
    }

    backspaceKey(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'Backspace' && this.textBoxActive && this.cursorPosition.x !== 0) {
            const beforeDeletedChar: string = this.textArray[this.cursorPosition.y].slice(0, this.cursorPosition.x - 1);
            const afterDeletedChar: string = this.textArray[this.cursorPosition.y].slice(this.cursorPosition.x);
            this.cursorPosition.x--;
            this.textArray[this.cursorPosition.y] = beforeDeletedChar + afterDeletedChar;
            this.clearAndDrawPreview();
        }
    }

    deleteKey(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'Delete' && this.textBoxActive && this.cursorPosition.x <= this.textArray[this.cursorPosition.y].length - 1) {
            const beforeDeletedChar: string = this.textArray[this.cursorPosition.y].slice(0, this.cursorPosition.x);
            const afterDeletedChar: string = this.textArray[this.cursorPosition.y].slice(this.cursorPosition.x + 1);
            this.textArray[this.cursorPosition.y] = beforeDeletedChar + afterDeletedChar;
            this.clearAndDrawPreview();
        }
    }

    escapeKey(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'Escape' && this.textBoxActive) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.textBoxActive = false;
            this.clearArrays();
            this.cursorPosition = { x: 0, y: 0 };
        }
    }

    arrowUp(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'ArrowUp' && this.cursorPosition.y > 0 && this.textBoxActive) {
            this.cursorPosition.y--;
            this.clearAndDrawPreview();
        }
    }

    arrowDown(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'ArrowDown' && this.cursorPosition.y < this.textArray.length - 1 && this.textBoxActive) {
            this.cursorPosition.y++;
            this.clearAndDrawPreview();
        }
    }

    arrowLeft(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'ArrowLeft' && this.cursorPosition.x > 0 && this.textBoxActive) {
            this.cursorPosition.x--;
            this.clearAndDrawPreview();
        }
    }

    arrowRight(keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === 'ArrowRight' && this.cursorPosition.x <= this.textArray[this.cursorPosition.y].length - 1 && this.textBoxActive) {
            this.cursorPosition.x++;
            this.clearAndDrawPreview();
        }
    }

    switchStartingAndEndPoints(): void {
        if (this.startingPoint.x > this.endPoint.x) {
            const tempPoint: Vec2 = { x: this.startingPoint.x, y: this.startingPoint.y };
            this.startingPoint = { x: this.endPoint.x, y: this.endPoint.y };
            this.endPoint = { x: tempPoint.x, y: tempPoint.y };
        }
        if (this.startingPoint.y > this.endPoint.y) {
            const tempPoint: Vec2 = { x: this.startingPoint.x, y: this.startingPoint.y };
            this.startingPoint = { x: this.startingPoint.x, y: this.endPoint.y };
            this.endPoint = { x: this.endPoint.x, y: tempPoint.y };
        }
    }

    drawText(ctx: CanvasRenderingContext2D, textCommand: TextCommandService): void {
        this.setColors(this.colorService);
        this.switchStartingAndEndPoints();
        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        textCommand.setTextAttributes(
            this.fontSize,
            this.font,
            this.textArray,
            this.alignment,
            this.startingPoint,
            this.endPoint,
            this.colorService.primaryColor,
            this.italic,
            this.bold,
        );
        textCommand.execute(ctx);
    }

    checkIfInKeyArray(key: string, array: string[]): boolean {
        for (const keys of array) {
            if (key === keys) {
                return true;
            }
        }
        return false;
    }

    clearAndDrawPreview(): void {
        if (this.textBoxActive) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawTextBox(this.drawingService.previewCtx, this.currentLine);
            const textCommand: TextCommandService = new TextCommandService();
            this.drawText(this.drawingService.previewCtx, textCommand);
            this.drawCursor();
        }
    }

    onKeyDown(keydown: KeyboardEvent): void {
        if (this.textBoxActive) {
            let cursorPositionX: TextMetrics = this.drawingService.previewCtx.measureText(this.textArray[this.cursorPosition.y].substring(0));
            if (!this.checkIfInKeyArray(keydown.key, Constant.USEFUL_KEYS) && !this.checkIfInKeyArray(keydown.key, Constant.USELESS_KEYS)) {
                this.textArray[this.cursorPosition.y] =
                    this.textArray[this.cursorPosition.y].slice(0, this.cursorPosition.x) +
                    keydown.key +
                    this.textArray[this.cursorPosition.y].slice(this.cursorPosition.x);
                this.cursorPosition.x++;
                if (cursorPositionX.width >= this.endPoint.x - this.startingPoint.x - this.fontSize / 2) {
                    if (this.alignment === 'left') {
                        this.endPoint.x += this.fontSize;
                    } else if (this.alignment === 'right') {
                        this.startingPoint.x -= this.fontSize;
                    } else {
                        this.startingPoint.x -= this.fontSize / 2;
                        this.endPoint.x += this.fontSize / 2;
                    }
                }
                this.clearAndDrawPreview();
            }
            cursorPositionX = this.drawingService.previewCtx.measureText(this.textArray[this.cursorPosition.y].substring(0, this.cursorPosition.x));
        }
    }

    drawCursor(): void {
        this.drawingService.previewCtx.setLineDash([]);
        this.drawingService.previewCtx.beginPath();
        const widthToCursor: TextMetrics = this.drawingService.previewCtx.measureText(
            this.textArray[this.cursorPosition.y].substring(0, this.cursorPosition.x),
        );
        const cursorLength: number = this.startingPoint.y + this.fontSize * this.cursorPosition.y;
        const textLength: TextMetrics = this.drawingService.previewCtx.measureText(this.textArray[this.cursorPosition.y].substring(0));
        if (this.alignment === 'left') {
            this.drawingService.previewCtx.moveTo(this.startingPoint.x + widthToCursor.width, cursorLength + EXTRA_SPACING);
            this.drawingService.previewCtx.lineTo(this.startingPoint.x + widthToCursor.width, cursorLength + this.fontSize);
        } else if (this.alignment === 'right') {
            const horizontalPosition: number = this.endPoint.x - textLength.width + widthToCursor.width;
            this.drawingService.previewCtx.moveTo(horizontalPosition, cursorLength + EXTRA_SPACING);
            this.drawingService.previewCtx.lineTo(horizontalPosition, cursorLength + this.fontSize);
        } else {
            const boxMidPoint: number = (this.endPoint.x - this.startingPoint.x) / 2;
            const horizontalPosition: number = this.startingPoint.x - textLength.width / 2 + widthToCursor.width + boxMidPoint;
            this.drawingService.previewCtx.moveTo(horizontalPosition, cursorLength + EXTRA_SPACING);
            this.drawingService.previewCtx.lineTo(horizontalPosition, cursorLength + this.fontSize);
        }
        this.drawingService.previewCtx.stroke();
    }
}

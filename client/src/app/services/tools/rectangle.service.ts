import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { SquareHelperService } from '@app/services/tools/square-helper.service';
import { faSquare, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { RectangleCommandService } from './tool-commands/rectangle-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    currentCommand: () => void;
    shiftIsPressed: boolean;
    currentLine: Vec2[] = [];
    eventListenerIsSet: boolean;
    contour: boolean = true;
    icon: IconDefinition = faSquare;
    isStarted: boolean = false;
    undoRedoManager: UndoRedoManagerService;
    constructor(
        drawingService: DrawingService,
        private squareHelperService: SquareHelperService,
        public colorService: ColorService,
        undoRedoManager: UndoRedoManagerService,
    ) {
        super(drawingService);
        this.shortcut = '1';
        this.localShortcuts = new Map([['Shift', this.onShift]]);
        this.currentLine = [];
        this.index = 2;
        this.toolStyles = {
            primaryColor: 'rgba(255, 0, 0, 1)',
            lineWidth: 1,
            fill: false,
            secondaryColor: 'black',
        };
        this.undoRedoManager = undoRedoManager;
        this.toolName = 'Rectangle';
    }

    startingPoint: Vec2;
    endPoint: Vec2;

    clearArrays(): void {
        this.currentLine = [];
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.startingPoint = this.mouseDownCoord;
        }
        this.undoRedoManager.disableUndoRedo();
    }

    setShiftIsPressed = (keyDownShiftEvent: KeyboardEvent) => {
        if (this.isStarted) {
            if (keyDownShiftEvent.key === 'Shift') {
                this.shiftIsPressed = true;
                if (!this.squareHelperService.checkIfIsSquare([this.startingPoint, this.endPoint]) && !this.drawingService.resizeActive) {
                    this.drawingService.clearCanvas(this.drawingService.previewCtx);
                    this.currentLine = [this.startingPoint, this.squareHelperService.closestSquare([this.startingPoint, this.endPoint])];
                    const rectangleCommand: RectangleCommandService = new RectangleCommandService(this.squareHelperService);
                    this.drawLine(this.drawingService.previewCtx, rectangleCommand);
                }
            }
        }
    };

    setShiftNonPressed = (keyUpShiftEvent: KeyboardEvent) => {
        if (keyUpShiftEvent.key === 'Shift') {
            if (this.mouseDown && !this.drawingService.resizeActive) {
                this.shiftIsPressed = false;
                window.removeEventListener('keypress', this.setShiftIsPressed);
                window.removeEventListener('keyup', this.setShiftNonPressed);
                this.eventListenerIsSet = false;
                this.currentLine = [this.startingPoint, this.endPoint];
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                const rectangleCommand: RectangleCommandService = new RectangleCommandService(this.squareHelperService);
                this.drawLine(this.drawingService.previewCtx, rectangleCommand);
            } else {
                this.shiftIsPressed = false;
                this.drawingService.clearBackground();
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            }
        }
    };

    onShift(): void {
        if (!this.eventListenerIsSet) {
            window.addEventListener('keydown', this.setShiftIsPressed);
            window.addEventListener('keyup', this.setShiftNonPressed);
            this.eventListenerIsSet = true;
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            if (!this.shiftIsPressed) {
                const mousePosition = this.getPositionFromMouse(mouseUpEvent);
                this.endPoint = mousePosition;
                this.currentLine = [this.startingPoint, this.endPoint];
            }
            const rectangleCommand: RectangleCommandService = new RectangleCommandService(this.squareHelperService);
            this.undoRedoManager.enableUndoRedo();
            this.drawLine(this.drawingService.baseCtx, rectangleCommand);
            this.undoRedoManager.undoStack.push(rectangleCommand);
            this.drawingService.clearBackground();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.undoRedoManager.clearRedoStack();
        }
        this.mouseDown = false;
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            this.undoRedoManager.disableUndoRedo();
            const mousePosition = this.getPositionFromMouse(mouseMoveEvent);
            this.endPoint = mousePosition;
            this.drawingService.clearBackground();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (this.shiftIsPressed) {
                this.currentLine = [this.startingPoint, this.squareHelperService.closestSquare([this.startingPoint, this.endPoint])];
                if (this.squareHelperService.checkIfIsSquare([this.startingPoint, this.endPoint])) {
                    this.currentLine = [this.startingPoint, this.endPoint];
                }
            } else {
                this.currentLine = [this.startingPoint, this.endPoint];
            }
            const rectangleCommand: RectangleCommandService = new RectangleCommandService(this.squareHelperService);
            this.drawLine(this.drawingService.previewCtx, rectangleCommand);
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, rectangleCommand: RectangleCommandService): void {
        this.isStarted = ctx === this.drawingService.previewCtx;
        this.setColors(this.colorService);
        this.setStyles();
        rectangleCommand.setContourAndShiftBools(this.contour, this.shiftIsPressed);
        rectangleCommand.setCoordinates(this.currentLine);
        rectangleCommand.setToolStyles(
            this.toolStyles.primaryColor,
            this.toolStyles.lineWidth,
            this.toolStyles.fill as boolean,
            this.toolStyles.secondaryColor as string,
        );
        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        this.drawingService.previewCtx.fillStyle = rectangleCommand.toolStyle.primaryColor as string;
        this.drawingService.baseCtx.fillStyle = rectangleCommand.toolStyle.primaryColor as string;

        this.drawingService.previewCtx.strokeStyle = rectangleCommand.toolStyle.secondaryColor as string;
        this.drawingService.baseCtx.strokeStyle = rectangleCommand.toolStyle.secondaryColor as string;
        rectangleCommand.execute(ctx);
    }
}

import { Injectable } from '@angular/core';
import { Tool, ToolStyles } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { faSlash, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ColorService } from './color.service';
import { LineHelperService } from './line-helper.service';
import { LineCommandService } from './tool-commands/line-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    shiftIsPressed: boolean = false;
    isStarted: boolean;
    startingPoint: Vec2;
    endPoint: Vec2;
    blockOnShift: boolean;
    currentLine: Vec2[][] = [];
    segmentStyles: ToolStyles[] = [];
    junctions: Vec2[] = [];
    junctionsRadius: number[] = [];
    currentDiameter: number = 5;
    toolStyles: ToolStyles;
    angledEndPoint: Vec2;
    calledFromMouseClick: boolean = false;
    lineHelper: LineHelperService;
    colorService: ColorService;
    angle: number;
    mousePosition: Vec2;
    icon: IconDefinition = faSlash;
    hasJunction: boolean = true;
    undoRedoManager: UndoRedoManagerService;

    constructor(
        public drawingService: DrawingService,
        lineHelper: LineHelperService,
        colorService: ColorService,
        undoRedoManager: UndoRedoManagerService,
    ) {
        super(drawingService);
        this.isStarted = false;
        this.shortcut = 'l';
        this.localShortcuts = new Map([
            ['Shift', this.onShift],
            ['Backspace', this.onBackspace],
            ['Escape', this.onEscape],
        ]);
        this.index = 1;
        this.toolStyles = { primaryColor: 'black', lineWidth: 5 };
        this.lineHelper = lineHelper;
        this.colorService = colorService;
        this.undoRedoManager = undoRedoManager;
        this.toolName = 'Ligne';
    }

    clearArrays(): void {
        this.clearLineAndJunctions();
    }

    onEscape(): void {
        this.isStarted = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.clearLineAndJunctions();
    }

    clearLineAndJunctions(): void {
        this.currentLine = [];
        this.segmentStyles = [];
        this.junctions = [];
        this.junctionsRadius = [];
    }

    onBackspace(): void {
        if (this.currentLine.length > 0) {
            this.startingPoint = this.currentLine[this.currentLine.length - 1][0];
            this.currentLine.pop();
            this.segmentStyles.pop();
            this.junctions.pop();
            this.junctionsRadius.pop();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const lineCommand: LineCommandService = new LineCommandService();
            this.redrawCurrentLine(this.drawingService.previewCtx, lineCommand);
            lineCommand.drawLine(this.drawingService.previewCtx, [this.startingPoint, this.endPoint]);
        }
    }

    setShiftIsPressed = () => {
        this.shiftIsPressed = true;
        if (this.isStarted && !this.lineHelper.shiftAngleCalculator(this.startingPoint, this.endPoint)) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const lineCommand: LineCommandService = new LineCommandService();
            this.redrawCurrentLine(this.drawingService.previewCtx, lineCommand);
            const line: Vec2[] = [this.startingPoint, this.lineHelper.closestAngledPoint(this.startingPoint, this.endPoint)];
            this.angledEndPoint = line[1];
            lineCommand.drawLine(this.drawingService.previewCtx, line);
        }
        window.removeEventListener('keydown', this.setShiftIsPressed);
        this.blockOnShift = false;
    };

    setShiftNonPressed = (keyUpShiftEvent?: KeyboardEvent) => {
        if ((keyUpShiftEvent != undefined && keyUpShiftEvent.key === 'Shift') || this.calledFromMouseClick) {
            this.shiftIsPressed = false;
            window.removeEventListener('keyup', this.setShiftNonPressed);
            this.blockOnShift = false;
            if (this.isStarted) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                const lineCommand: LineCommandService = new LineCommandService();
                this.redrawCurrentLine(this.drawingService.previewCtx, lineCommand);
                lineCommand.drawLine(this.drawingService.previewCtx, [this.startingPoint, this.mousePosition]);
            }
        }
    };

    onShift(): void {
        if (!this.blockOnShift) {
            this.setShiftIsPressed();
            window.addEventListener('keyup', this.setShiftNonPressed);
            this.blockOnShift = true;
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        const lineCommand: LineCommandService = new LineCommandService();
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(mouseUpEvent);
            this.endPoint = mousePosition;
            this.setStylesAndStartDrawing(this.drawingService.baseCtx, lineCommand);
            lineCommand.drawLine(this.drawingService.baseCtx, [this.startingPoint, this.endPoint]);
        }
        this.mouseDown = false;
    }

    redrawCurrentLine(ctx: CanvasRenderingContext2D, lineCommand: LineCommandService): void {
        lineCommand.setJunctions(this.junctions, this.junctionsRadius);
        this.setStylesAndStartDrawing(this.drawingService.previewCtx, lineCommand);
        lineCommand.execute(ctx);
        if (ctx === this.drawingService.baseCtx) {
            this.clearLineAndJunctions();
        }
    }

    pushNewJunction(center: Vec2, radius: number): void {
        this.junctions.push(center);
        this.junctionsRadius.push(radius);
    }

    onMouseClick(mouseClickEvent: MouseEvent): void {
        const lineCommand: LineCommandService = new LineCommandService();
        this.undoRedoManager.disableUndoRedo();
        lineCommand.setJunctions(this.junctions, this.junctionsRadius);
        if (!this.isStarted) {
            this.isStarted = true;
            this.startingPoint = this.getPositionFromMouse(mouseClickEvent);
            this.pushNewJunction(this.startingPoint, this.currentDiameter / 2);
            lineCommand.drawJunction(this.drawingService.previewCtx, this.startingPoint, this.currentDiameter / 2);
        } else {
            if (!this.shiftIsPressed) {
                const mousePosition = this.getPositionFromMouse(mouseClickEvent);
                this.endPoint = mousePosition;
            }
            if (!this.drawingService.resizeActive) {
                this.setStylesAndStartDrawing(this.drawingService.previewCtx, lineCommand);
                lineCommand.drawLine(this.drawingService.previewCtx, [this.startingPoint, this.endPoint]);
                this.pushNewJunction(this.endPoint, this.currentDiameter / 2);
                lineCommand.drawJunction(this.drawingService.previewCtx, this.endPoint, this.currentDiameter / 2);
                this.currentLine.push([this.startingPoint, this.endPoint]);
                this.startingPoint = this.endPoint;
            }
            if (this.shiftIsPressed) {
                this.calledFromMouseClick = true;
                this.endPoint = this.getPositionFromMouse(mouseClickEvent);
                this.setShiftNonPressed();
                this.calledFromMouseClick = false;
            }
        }
    }

    onDoubleClick(doubleMouseClickEvent: MouseEvent): void {
        if (this.isStarted) {
            const mousePosition = this.getPositionFromMouse(doubleMouseClickEvent);
            const lineCommand: LineCommandService = new LineCommandService();
            this.undoRedoManager.enableUndoRedo();
            if (this.currentLine.length > 0 && this.lineHelper.pixelDistanceUtil(this.currentLine[0][0], mousePosition)) {
                this.endPoint = this.currentLine[0][0];
                this.currentLine.push([this.startingPoint, this.endPoint]);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.redrawCurrentLine(this.drawingService.baseCtx, lineCommand);
            } else {
                if (!this.shiftIsPressed) {
                    this.endPoint = mousePosition;
                } else {
                    this.endPoint = this.angledEndPoint;
                }
                this.currentLine.push([this.startingPoint, this.endPoint]);
                this.junctions.push(this.endPoint);
                this.junctionsRadius.push(this.currentDiameter / 2);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.redrawCurrentLine(this.drawingService.baseCtx, lineCommand);
            }
            this.undoRedoManager.undoStack.push(lineCommand);
            this.undoRedoManager.clearRedoStack();
            this.isStarted = false;
        }
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.isStarted) {
            this.mousePosition = this.getPositionFromMouse(mouseMoveEvent);
            this.endPoint = this.mousePosition;
            if (this.shiftIsPressed) {
                this.endPoint = this.lineHelper.closestAngledPoint(this.startingPoint, this.endPoint);
                this.angledEndPoint = this.endPoint;
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const lineCommand: LineCommandService = new LineCommandService();
            this.undoRedoManager.disableUndoRedo();
            this.redrawCurrentLine(this.drawingService.previewCtx, lineCommand);
            lineCommand.drawLine(this.drawingService.previewCtx, [this.startingPoint, this.endPoint]);
        }
    }

    setStylesAndStartDrawing(ctx: CanvasRenderingContext2D, lineCommand: LineCommandService): void {
        this.setColors(this.colorService);
        this.setStyles();
        lineCommand.setStyles(this.toolStyles.primaryColor, this.toolStyles.lineWidth, this.hasJunction);
        lineCommand.setCurrentLine(this.currentLine);

        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
    }
}

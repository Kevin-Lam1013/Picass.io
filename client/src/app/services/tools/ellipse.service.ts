import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SquareHelperService } from '@app/services/tools/square-helper.service';
import { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { ColorService } from './color.service';
import { EllipseCommandService } from './tool-commands/ellipse-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

const TOOL_INDEX = 4;

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    startingPoint: Vec2;
    endPoint: Vec2;
    shiftIsPressed: boolean;
    currentLine: Vec2[] = [];
    border: boolean = true;
    isShiftPressed: boolean;
    icon: IconDefinition = faCircle;
    undoRedoManager: UndoRedoManagerService;

    constructor(
        drawingService: DrawingService,
        public squareHelperService: SquareHelperService,
        public colorService: ColorService,
        undoRedoManager: UndoRedoManagerService,
    ) {
        super(drawingService);
        this.shortcut = '2';
        this.index = TOOL_INDEX;
        this.localShortcuts = new Map([['Shift', this.onShift]]);
        this.toolStyles = {
            primaryColor: 'white',
            lineWidth: 1,
            fill: false,
            secondaryColor: 'black',
        };
        this.undoRedoManager = undoRedoManager;
        this.toolName = 'Ellipse';
    }

    clearArrays(): void {
        this.currentLine = [];
    }

    onShift(): void {
        if (!this.isShiftPressed) {
            window.addEventListener('keydown', this.setShiftIfPressed);
            window.addEventListener('keyup', this.setShiftNonPressed);
            this.isShiftPressed = true;
        }
    }
    changeWidth(newWidth: number): void {
        this.toolStyles.lineWidth = newWidth;
    }

    setShiftIfPressed = (keyDownShiftEvent: KeyboardEvent) => {
        if (keyDownShiftEvent.key === 'Shift') {
            this.shiftIsPressed = true;
            if (!this.squareHelperService.checkIfIsSquare([this.startingPoint, this.endPoint]) && this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawingService.clearBackground();
                const ellipseCommand: EllipseCommandService = new EllipseCommandService(this.squareHelperService);
                this.drawEllipse(this.drawingService.previewCtx, ellipseCommand);
                this.drawRectangle(
                    this.drawingService.backgroundCtx,
                    this.startingPoint,
                    this.squareHelperService.closestSquare([this.startingPoint, this.endPoint]),
                );
            }
        }
    };

    setShiftNonPressed = (keyUpShiftEvent: KeyboardEvent) => {
        if (keyUpShiftEvent.key === 'Shift') {
            this.shiftIsPressed = false;
            const ellipseCommand: EllipseCommandService = new EllipseCommandService(this.squareHelperService);
            if (this.mouseDown) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawEllipse(this.drawingService.previewCtx, ellipseCommand);
                this.drawRectangle(this.drawingService.backgroundCtx, this.startingPoint, this.endPoint);
            }
            window.removeEventListener('keydown', this.setShiftIfPressed);
            window.removeEventListener('keyup', this.setShiftNonPressed);
            this.isShiftPressed = false;
            if (!this.mouseDown) {
                this.drawingService.clearBackground();
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            }
        }
    };

    onMouseDown(mouseDownevent: MouseEvent): void {
        this.mouseDown = mouseDownevent.button === MouseButton.Left;
        if (!this.mouseDown) {
            return;
        }
        this.mouseDownCoord = this.getPositionFromMouse(mouseDownevent);
        this.undoRedoManager.disableUndoRedo();
        this.startingPoint = this.mouseDownCoord;
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseUpEvent);
            this.endPoint = mousePosition;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const ellipseCommand: EllipseCommandService = new EllipseCommandService(this.squareHelperService);
            this.undoRedoManager.enableUndoRedo();
            this.drawEllipse(this.drawingService.baseCtx, ellipseCommand);
            this.undoRedoManager.undoStack.push(ellipseCommand);
            this.drawingService.clearBackground();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.undoRedoManager.clearRedoStack();
        }
        this.mouseDown = false;
    }

    onMouseMove(mouseMove: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseMove);
            this.endPoint = mousePosition;
            this.drawingService.clearBackground();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const ellipseCommand: EllipseCommandService = new EllipseCommandService(this.squareHelperService);
            this.undoRedoManager.disableUndoRedo();
            this.drawEllipse(this.drawingService.previewCtx, ellipseCommand);
            if (this.shiftIsPressed) {
                this.drawRectangle(
                    this.drawingService.backgroundCtx,
                    this.startingPoint,
                    ellipseCommand.squareHelperService.closestSquare([this.startingPoint, this.endPoint]),
                );
            } else {
                this.drawRectangle(this.drawingService.backgroundCtx, this.startingPoint, this.endPoint);
            }
        }
    }

    drawRectangle(ctx: CanvasRenderingContext2D, start: Vec2, end: Vec2): void {
        const gapBetweenDash = 5;
        const dashLength = 5;
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.globalCompositeOperation = 'source-over';
        ctx.setLineDash([dashLength, gapBetweenDash]);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, start.y);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(start.x, end.y);
        ctx.moveTo(start.x, end.y);
        ctx.lineTo(end.x, end.y);
        ctx.moveTo(end.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawEllipse(ctx: CanvasRenderingContext2D, ellipseCommand: EllipseCommandService): void {
        this.setColors(this.colorService);
        this.setStyles();
        ellipseCommand.setToolStyles(
            this.toolStyles.primaryColor,
            this.toolStyles.lineWidth,
            this.toolStyles.fill as boolean,
            this.toolStyles.secondaryColor as string,
        );
        ellipseCommand.setBorderAndShiftBools(this.border, this.shiftIsPressed);
        ellipseCommand.setCoordinates(this.startingPoint, this.endPoint, this.currentLine);
        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        this.drawingService.previewCtx.fillStyle = ellipseCommand.toolStyle.primaryColor as string;
        this.drawingService.baseCtx.fillStyle = ellipseCommand.toolStyle.primaryColor as string;

        this.drawingService.previewCtx.strokeStyle = ellipseCommand.toolStyle.secondaryColor as string;
        this.drawingService.baseCtx.strokeStyle = ellipseCommand.toolStyle.secondaryColor as string;
        ellipseCommand.execute(ctx);
    }
}

import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { SquareHelperService } from '@app/services/tools/square-helper.service';
import { PolygonCommandService } from './tool-commands/polygone-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Tool {
    startingPoint: Vec2;
    endPoint: Vec2;
    currentLine: Vec2[] = [];
    contour: boolean = true;
    sides: number = 3;
    indexNumber: number = 5;
    showNumberOfSidesInput: boolean = false;
    centerX: number;
    centerY: number;
    angle: number;
    radius: number;
    squareCornerPos: Vec2;
    undoRedoManager: UndoRedoManagerService;

    constructor(
        drawingService: DrawingService,
        public colorService: ColorService,
        private squareHelper: SquareHelperService,
        undoRedoManager: UndoRedoManagerService,
    ) {
        super(drawingService);
        this.shortcut = '3';
        this.localShortcuts = new Map();
        this.currentLine = [];
        this.index = this.indexNumber;
        this.toolStyles = {
            primaryColor: 'rgba(0, 0, 0, 1)',
            lineWidth: 1,
            fill: false,
            secondaryColor: 'black',
        };
        this.undoRedoManager = undoRedoManager;
        this.toolName = 'Polygone';
    }

    clearArrays(): void {
        this.currentLine = [];
    }

    setNumberOfSides(numberSides: number): void {
        this.sides = numberSides;
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.startingPoint = this.mouseDownCoord;
        }
        this.undoRedoManager.disableUndoRedo();
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseUpEvent);
            this.endPoint = mousePosition;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const polygonCommand: PolygonCommandService = new PolygonCommandService();
            this.undoRedoManager.enableUndoRedo();
            this.drawLine(this.drawingService.baseCtx, this.currentLine, polygonCommand);
            this.undoRedoManager.undoStack.push(polygonCommand);
            this.undoRedoManager.clearRedoStack();
        }
        this.mouseDown = false;
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseMoveEvent);
            this.endPoint = mousePosition;
            this.currentLine = [this.startingPoint, this.endPoint];
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.computeCircleValues(this.currentLine);
            const polygonCommand: PolygonCommandService = new PolygonCommandService();
            this.undoRedoManager.disableUndoRedo();
            this.drawLine(this.drawingService.previewCtx, this.currentLine, polygonCommand);
            this.drawCircle(this.drawingService.previewCtx, this.currentLine);
        }
    }

    onButtonPress(): void {
        this.showNumberOfSidesInput = !this.showNumberOfSidesInput;
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[], polygonCommand: PolygonCommandService): void {
        // partie couleur
        this.setColors(this.colorService);
        this.setStyles();
        polygonCommand.setToolStyles(
            this.toolStyles.primaryColor,
            this.toolStyles.lineWidth,
            this.toolStyles.fill as boolean,
            this.toolStyles.secondaryColor as string,
        );
        polygonCommand.setPolygoneAttributes(this.contour, this.centerX, this.centerY, this.angle, this.radius, this.sides);

        this.drawingService.previewCtx.fillStyle = this.toolStyles.primaryColor as string;
        this.drawingService.baseCtx.fillStyle = this.toolStyles.primaryColor as string;

        this.drawingService.previewCtx.strokeStyle = this.toolStyles.secondaryColor as string;
        this.drawingService.baseCtx.strokeStyle = this.toolStyles.secondaryColor as string;

        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        polygonCommand.execute(ctx);
    }

    drawCircle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const gapBetweenDash = 5;
        const dashLength = 5;
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.globalCompositeOperation = 'source-over';
        ctx.setLineDash([dashLength, gapBetweenDash]);
        ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    computeCircleValues(path: Vec2[]): void {
        this.squareCornerPos = this.squareHelper.closestSquare([path[0], path[1]]);
        this.centerX = (path[0].x + this.squareCornerPos.x) / 2;
        this.centerY = (path[0].y + this.squareCornerPos.y) / 2;
        this.angle = (Math.PI * 2) / this.sides;
        this.radius = Math.abs((path[0].x - this.squareCornerPos.x) / 2);
    }
}

import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { faEraser, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { EraserCommandService } from './tool-commands/eraser-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    startingPoint: Vec2;
    currentPoint: Vec2;
    indexValue: number = 3;
    minimumWidth: number = 5;
    icon: IconDefinition = faEraser;
    undoRedoManager: UndoRedoManagerService;
    private pathData: Vec2[];

    constructor(public drawingService: DrawingService, undoRedoManager: UndoRedoManagerService) {
        super(drawingService);
        this.clearPath();
        this.shortcut = 'e';
        this.localShortcuts = new Map();
        this.index = this.indexValue;
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: 5,
            secondaryColor: 'white',
        };
        this.drawingService = drawingService;
        this.undoRedoManager = undoRedoManager;
        this.toolName = 'Efface';
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.pathData.push(this.mouseDownCoord);
            const eraserCommand: EraserCommandService = new EraserCommandService();
            this.undoRedoManager.disableUndoRedo();
            eraserCommand.setStyles(this.toolStyles.lineWidth);
            eraserCommand.setCoordinates(this.pathData);
            this.drawLine(this.drawingService.previewCtx, eraserCommand);
            this.drawingService.previewCtx.globalCompositeOperation = 'source-over';
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseUpEvent);
            this.pathData.push(mousePosition);

            const eraserCommand: EraserCommandService = new EraserCommandService();
            this.undoRedoManager.enableUndoRedo();
            eraserCommand.setStyles(this.toolStyles.lineWidth);
            eraserCommand.setCoordinates(this.pathData);

            this.drawLine(this.drawingService.baseCtx, eraserCommand);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.undoRedoManager.undoStack.push(eraserCommand);
            this.undoRedoManager.clearRedoStack();
        }
        this.mouseDown = false;
        this.clearPath();
    }

    findCoordinate(): Vec2 {
        const coord: Vec2 = { x: this.currentPoint.x - this.toolStyles.lineWidth / 2, y: this.currentPoint.y - this.toolStyles.lineWidth / 2 };
        return coord;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.drawingService.previewCtx.fillStyle = 'white';

        this.currentPoint = this.getPositionFromMouse(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.cursorEffect(this.findCoordinate());

        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            const eraserCommand: EraserCommandService = new EraserCommandService();
            eraserCommand.setStyles(this.toolStyles.lineWidth);
            eraserCommand.setCoordinates(this.pathData);
            this.drawLine(this.drawingService.baseCtx, eraserCommand);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.cursorEffect(this.findCoordinate());
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, eraserCommand: EraserCommandService): void {
        eraserCommand.execute(ctx);
    }

    cursorEffect(location: Vec2): void {
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.fillRect(location.x, location.y, this.toolStyles.lineWidth, this.toolStyles.lineWidth);
        this.drawingService.previewCtx.strokeRect(location.x, location.y, this.toolStyles.lineWidth, this.toolStyles.lineWidth);
    }

    changeWidth(newWidth: number): void {
        if (this.isValid(newWidth)) {
            this.toolStyles.lineWidth = newWidth;
        } else {
            this.toolStyles.lineWidth = this.minimumWidth;
        }
    }

    isValid(width: number): boolean {
        if (width < this.minimumWidth) {
            return false;
        }
        return true;
    }

    private clearPath(): void {
        this.pathData = [];
    }
}

import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { faPen, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { PencilCommandService } from './tool-commands/pencil-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    laspoint: Vec2;
    nexpoint: Vec2;
    private pathData: Vec2[];
    isEraser: boolean = false;
    icon: IconDefinition = faPen;
    undoRedoManager: UndoRedoManagerService;

    constructor(drawingService: DrawingService, public colorService: ColorService, undoRedoManager: UndoRedoManagerService) {
        super(drawingService);
        this.clearPath();
        this.shortcut = 'c';
        this.localShortcuts = new Map();
        this.index = 0;
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: 1,
        };
        this.undoRedoManager = undoRedoManager;
        this.toolName = 'Crayon';
    }

    clearArrays(): void {
        this.pathData = [];
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown && !this.drawingService.resizeActive) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.pathData.push(this.mouseDownCoord);
            const pencilCommand: PencilCommandService = new PencilCommandService();
            this.undoRedoManager.disableUndoRedo();
            this.drawLine(this.drawingService.previewCtx, pencilCommand);
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseUpEvent);
            this.pathData.push(mousePosition);

            const pencilCommand: PencilCommandService = new PencilCommandService();

            this.drawLine(this.drawingService.baseCtx, pencilCommand);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.undoRedoManager.undoStack.push(pencilCommand);
            this.undoRedoManager.enableUndoRedo();
            this.undoRedoManager.clearRedoStack();
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseMoveEvent);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const pencilCommand: PencilCommandService = new PencilCommandService();
            this.undoRedoManager.disableUndoRedo();
            this.drawLine(this.drawingService.previewCtx, pencilCommand);
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, pencilCommand: PencilCommandService): void {
        pencilCommand.setStyles(this.colorService.primaryColor, this.toolStyles.lineWidth);
        pencilCommand.setPathData(this.pathData);
        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        pencilCommand.execute(ctx);
    }

    private clearPath(): void {
        this.pathData = [];
    }
}

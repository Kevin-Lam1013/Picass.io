import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';
import { Constant } from '@app/constants/general-constants-store';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { ResizeCommandService } from './tool-commands/resize-command.service';

/* 
Patron commande qui nour permet de poser une action comme un objet comme ca on peut les manipuler et les placer
dans des stacks

Chaque fois qu'une action est executee on cree un objet commande selon l'outil. Par exemple, on dessine un trait avec
le crayon on va creer un objet de type pencilCommand et on va le push dans le undo stack. Le undoStack contient toutes
les commandes qu'on est capable de undo. Quand on undo, on va pop le dernier element du undoStack, tu clear le canvas 
et tu vas executer toutes les commandes precedantes a l'aide d'une boucle. La commande undo qui a ete pop, va etre placee
dans le redoStack. Quand on redo, on va pop le dernier element du redoStack, on l'execute et on le push dans le undoStack
*/

const ZERO = 0;
const WAIT_TIME = 5;
const DEFAULT_CANVAS_SIZE: Vec2 = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT };

@Injectable({
    providedIn: 'root',
})
export class UndoRedoManagerService extends Tool {
    undoStack: UndoRedoCommand[] = [];
    redoStack: UndoRedoCommand[] = [];
    resizeUndoStack: Vec2[] = [];
    resizeRedoStack: Vec2[] = [];

    undoDisabled: boolean = true;
    redoDisabled: boolean = true;

    constructor(drawingService: DrawingService, public gridService: GridService) {
        super(drawingService);
        this.undoStack = [];
        this.redoStack = [];
    }

    isEmpty(stack: UndoRedoCommand[]): boolean {
        return stack.length <= 0;
    }

    clearRedoStack(): void {
        this.redoStack = [];
        this.resizeRedoStack = [];
    }

    clearUndoStack(): void {
        this.undoStack = [];
        this.resizeUndoStack = [];
    }

    enableUndoRedo(): void {
        this.undoDisabled = false;
        this.redoDisabled = false;
    }

    disableUndoRedo(): void {
        this.undoDisabled = true;
        this.redoDisabled = true;
    }

    executeAllPreviousCommands(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawSavedImage();
        for (const command of this.undoStack) {
            if (command.isResizer) {
                const lastResize: Vec2 = this.resizeUndoStack.shift() as Vec2;
                this.resizeUndoStack.push(lastResize);

                const resizeCommand: ResizeCommandService = command as ResizeCommandService;
                resizeCommand.setPreview(lastResize);
                resizeCommand.execute(this.drawingService.baseCtx);
                this.drawImage(resizeCommand);
                this.drawGrid();
            } else {
                command.execute(this.drawingService.baseCtx);
            }
        }
    }

    drawSavedImage(): void {
        if (localStorage.getItem('oldDrawing') !== null) {
            setTimeout(() => {
                const oldDrawingToLoad = new Image();
                oldDrawingToLoad.src = localStorage.getItem('oldDrawing') as string;
                oldDrawingToLoad.onload = () => {
                    this.drawingService.baseCtx.drawImage(oldDrawingToLoad, 0, 0);
                };
            }, WAIT_TIME);
        }
    }

    drawImage(resizeCommand: ResizeCommandService): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        setTimeout(() => {
            this.drawSavedImage();
            this.drawingService.baseCtx.drawImage(resizeCommand.lastImage, ZERO, ZERO);
        }, WAIT_TIME);
    }

    drawGrid(): void {
        if (this.gridService.isGridVisible) {
            setTimeout(() => {
                this.gridService.drawGrid();
            }, WAIT_TIME);
        }
    }

    undo(): void {
        if (!this.isEmpty(this.undoStack) && !this.undoDisabled) {
            if (this.undoStack[this.undoStack.length - 1].isResizer && this.resizeUndoStack.length <= 1) {
                this.resizeRedoStack.push(this.resizeUndoStack.pop() as Vec2);
                const resizeCommand: ResizeCommandService = this.undoStack[this.undoStack.length - 1] as ResizeCommandService;
                if (this.drawingService.drawingStarted && localStorage.getItem('oldDrawing') !== null) {
                    resizeCommand.setPreview({
                        x: Number(localStorage.getItem('oldCanvasWidth') as string),
                        y: Number(localStorage.getItem('oldCanvasHeight') as string),
                    });
                } else {
                    resizeCommand.setPreview(DEFAULT_CANVAS_SIZE);
                }
                resizeCommand.execute(this.drawingService.baseCtx);

                const lastCommand: UndoRedoCommand = this.undoStack.pop() as UndoRedoCommand;
                this.redoStack.push(lastCommand);

                this.drawImage(resizeCommand);
                this.drawGrid();
            } else {
                this.drawingService.clearCanvas(this.drawingService.baseCtx);
                this.drawingService.baseCtx.fillStyle = 'white';
                this.drawingService.baseCtx.fillRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
                const lastCommand: UndoRedoCommand = this.undoStack.pop() as UndoRedoCommand;
                this.redoStack.push(lastCommand);
                if (lastCommand.isResizer) {
                    const lastResize: Vec2 = this.resizeUndoStack.pop() as Vec2;
                    const resize: ResizeCommandService = lastCommand as ResizeCommandService;
                    this.resizeRedoStack.push(lastResize);
                    setTimeout(() => {
                        this.drawImage(resize);
                    }, WAIT_TIME);
                    this.drawGrid();
                }
            }
            this.executeAllPreviousCommands();
        }
    }

    redo(): void {
        if (!this.isEmpty(this.redoStack) && !this.redoDisabled) {
            const lastCommand: UndoRedoCommand = this.redoStack.pop() as UndoRedoCommand;
            this.undoStack.push(lastCommand);

            if (lastCommand.isResizer) {
                const lastResize: Vec2 = this.resizeRedoStack.pop() as Vec2;
                const resizeCommand: ResizeCommandService = lastCommand as ResizeCommandService;
                this.resizeUndoStack.push(lastResize);

                resizeCommand.setPreview(lastResize);
                resizeCommand.execute(this.drawingService.baseCtx);

                this.drawImage(resizeCommand);
                this.drawGrid();
            } else {
                lastCommand.execute(this.drawingService.baseCtx);
            }
        }
    }
}

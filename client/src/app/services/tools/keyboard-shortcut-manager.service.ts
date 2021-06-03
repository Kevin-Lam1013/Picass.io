import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';

@Injectable({
    providedIn: 'root',
})
export class KeyboardShortcutManagerService {
    constructor(private toolManagerService: ToolManagerService, public drawingService: DrawingService) {
        this.toolManager = toolManagerService;
    }
    toolManager: ToolManagerService;

    onKeyPress(key: string): void {
        if (this.toolManager.allowKeyPressEvents) {
            if (this.toolManagerService.currentTool.localShortcuts.has(key)) {
                this.toolManager.currentTool.localShortCutHandler(key);
            } else {
                if (this.toolManagerService.toolBoxShortcuts.has(key)) {
                    this.toolManager.setTool(this.toolManager.toolBoxShortcuts.get(key) as Tool);
                    this.toolManager.widthValue = this.toolManager.currentTool.toolStyles.lineWidth;
                    this.drawingService.clearCanvas(this.drawingService.previewCtx);
                }
            }
        }
    }

    deleteHandler(toolManager: ToolManagerService): void {
        if (toolManager.rectangleSelection.currentlySelecting && toolManager.currentTool === toolManager.rectangleSelection) {
            toolManager.rectangleSelection.deleteSelection();
        }

        if (toolManager.ellipseSelection.currentlySelecting && toolManager.currentTool === toolManager.ellipseSelection) {
            toolManager.ellipseSelection.deleteSelection();
        }
        if (toolManager.lassoService.currentlySelecting && toolManager.currentTool === toolManager.lassoService) {
            toolManager.lassoService.deleteSelection();
        }
    }

    copyHandler(toolManager: ToolManagerService): void {
        if (toolManager.rectangleSelection.currentlySelecting && toolManager.currentTool === toolManager.rectangleSelection) {
            toolManager.rectangleSelection.copySelection();
        }
        if (toolManager.ellipseSelection.currentlySelecting && toolManager.currentTool === toolManager.ellipseSelection) {
            toolManager.ellipseSelection.copySelection();
        }
        if (toolManager.lassoService.currentlySelecting && toolManager.currentTool === toolManager.lassoService) {
            toolManager.lassoService.copySelection();
        }
    }

    pasteHandler(toolManager: ToolManagerService): void {
        if (toolManager.rectangleSelection === toolManager.currentTool && toolManager.rectangleSelection.clipboardService.alreadyCopied) {
            toolManager.rectangleSelection.pasteSelection();
        }
        if (toolManager.ellipseSelection === toolManager.currentTool && toolManager.ellipseSelection.clipboardService.alreadyCopied) {
            toolManager.ellipseSelection.pasteSelection();
        }
        if (toolManager.lassoService === toolManager.currentTool && toolManager.lassoService.clipboardService.alreadyCopied) {
            toolManager.lassoService.pasteSelection();
        }
    }

    cutHandler(toolManager: ToolManagerService): void {
        if (toolManager.rectangleSelection === toolManager.currentTool && toolManager.rectangleSelection.currentlySelecting) {
            toolManager.rectangleSelection.copySelection();
            toolManager.rectangleSelection.deleteSelection();
        }
        if (toolManager.ellipseSelection === toolManager.currentTool && toolManager.ellipseSelection.currentlySelecting) {
            toolManager.ellipseSelection.copySelection();
            toolManager.ellipseSelection.deleteSelection();
        }
        if (toolManager.lassoService === toolManager.currentTool && toolManager.lassoService.currentlySelecting) {
            toolManager.lassoService.copySelection();
            toolManager.lassoService.deleteSelection();
        }
    }

    magnetismHandler(toolManager: ToolManagerService): void {
        if (toolManager.rectangleSelection === toolManager.currentTool) {
            toolManager.rectangleSelection.magnetismService.switchOnOrOff();
        }
        if (toolManager.ellipseSelection === toolManager.currentTool) {
            toolManager.ellipseSelection.magnetismService.switchOnOrOff();
        }
        if (toolManager.lassoService === toolManager.currentTool) {
            toolManager.lassoService.magnetismService.switchOnOrOff();
        }
    }

    textToolShortcutListener(toolManager: ToolManagerService, event: KeyboardEvent): void {
        toolManager.textService.onKeyDown(event);
        toolManager.textService.enterKey(event);
        toolManager.textService.escapeKey(event);
        toolManager.textService.arrowUp(event);
        toolManager.textService.arrowDown(event);
        toolManager.textService.arrowLeft(event);
        toolManager.textService.arrowRight(event);
        toolManager.textService.backspaceKey(event);
        toolManager.textService.deleteKey(event);
    }
}

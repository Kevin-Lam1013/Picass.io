import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { AirbrushCommandService } from './tool-commands/airbrush-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

const TOOL_INDEX = 6;
const INITIAL_JET_DIAMETER = 30;
const INITIAL_DROPLET_DIAMETER = 1;
const INITIAL_EMISSION_RATE = 300; // number of droplets shooting per second
const EMISSION_TIME = 100; // ms

@Injectable({
    providedIn: 'root',
})
export class AirbrushService extends Tool {
    private pathData: Vec2[];
    jetDiameter: number = INITIAL_JET_DIAMETER;
    dropletDiameter: number = INITIAL_DROPLET_DIAMETER;
    emissionRate: number = INITIAL_EMISSION_RATE;
    emissionsNb: number = 0;
    undoRedoManager: UndoRedoManagerService;

    timerID: ReturnType<typeof setInterval>;

    constructor(drawingService: DrawingService, public colorService: ColorService, undoRedoManager: UndoRedoManagerService) {
        super(drawingService);
        this.index = TOOL_INDEX;
        this.shortcut = 'a';
        this.localShortcuts = new Map();
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: this.jetDiameter,
            fill: true,
        };
        this.undoRedoManager = undoRedoManager;
        this.toolName = 'Aérosol';
    }

    clearArrays(): void {
        this.pathData = [];
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown && !this.drawingService.resizeActive) {
            this.clearArrays();
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            const airbrushCommand: AirbrushCommandService = new AirbrushCommandService();
            airbrushCommand.mouseup = false;
            this.undoRedoManager.disableUndoRedo();
            // To imitate the effect of spraying constantly as long as the mouse button is down... Spraying every 100ms!
            // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval
            this.timerID = setInterval(() => {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.spray(this.drawingService.previewCtx, this.mouseDownCoord, airbrushCommand);
            }, EMISSION_TIME);
        }
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseMoveEvent);
            this.pathData.push(mousePosition);
            const airbrushCommand: AirbrushCommandService = new AirbrushCommandService();
            this.undoRedoManager.disableUndoRedo();
            this.mouseDownCoord = this.getPositionFromMouse(mouseMoveEvent);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.spray(this.drawingService.previewCtx, this.mouseDownCoord, airbrushCommand);
        }
    }

    onMouseUp(mouseUpEvent: MouseEvent): void {
        if (this.mouseDown && !this.drawingService.resizeActive) {
            const mousePosition = this.getPositionFromMouse(mouseUpEvent);
            this.pathData.push(mousePosition);

            const airbrushCommand: AirbrushCommandService = new AirbrushCommandService();
            airbrushCommand.mouseup = true;
            clearInterval(this.timerID);
            this.spray(this.drawingService.baseCtx, this.mouseDownCoord, airbrushCommand);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.undoRedoManager.undoStack.push(airbrushCommand);
            this.undoRedoManager.enableUndoRedo();
            this.undoRedoManager.clearRedoStack();
        }
        this.mouseDown = false;
        this.clearArrays();
    }

    spray(ctx: CanvasRenderingContext2D, point: Vec2, airbrushCommand: AirbrushCommandService): void {
        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        this.setColors(this.colorService);
        this.setStyles();
        airbrushCommand.setStyles(
            this.toolStyles.primaryColor,
            this.toolStyles.lineWidth,
            this.toolStyles.fill as boolean,
            this.jetDiameter,
            this.dropletDiameter,
            this.emissionRate,
            this.emissionsNb,
        );
        airbrushCommand.setCoordinatesAndPathData(point, this.pathData);
        airbrushCommand.execute(ctx);
    }
}

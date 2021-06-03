import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampCommandService } from './tool-commands/stamp-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

const TOOL_INDEX = 12;
const ZERO_DEGREES = 0;
const THREE_HUNDRED_SIXTY_DEGREES = 360;
const ROTATION_BY_15_DEGREES = 15;
const ROTATION_BY_1_DEGREE = 1;
const DEFAULT_IMAGE = '../../../assets/0.png';
const MOUSE_WHEEL_SINLGE_ROLL_SIZE = 100;
const TOOLBAR_WIDTH = 316;
const MARGIN_OF_ERROR_TOOLBAR = -35; // To allow the stamp to be cut slightly by the toolbar

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    rotationAngle: number = 0;
    rotationRate: number = 15; // with each stroke of the mouse wheel, the rotation angle is increased/ decreased by the value of the rotation rate
    stampSize: number = 200;
    stampName: string;
    undoRedoManager: UndoRedoManagerService;
    isEventListenerSet: boolean = false;

    constructor(drawingService: DrawingService, undoRedoManager: UndoRedoManagerService) {
        super(drawingService);
        this.index = TOOL_INDEX;
        this.shortcut = 'd';
        this.localShortcuts = new Map([['Alt', this.onAlt]]);
        this.toolStyles = {
            primaryColor: 'rgba(0,0,0,1)',
            lineWidth: 30,
        };
        this.mouseDownCoord = { x: 0, y: 0 };
        this.undoRedoManager = undoRedoManager;
        this.stampName = DEFAULT_IMAGE;
        this.toolName = 'Étampe';
    }

    onMouseDown(mouseDownEvent: MouseEvent): void {
        this.mouseDown = mouseDownEvent.button === MouseButton.Left;
        if (this.mouseDown && !this.drawingService.resizeActive) {
            this.mouseDownCoord = this.getPositionFromMouse(mouseDownEvent);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const stampCommand: StampCommandService = new StampCommandService();
            this.draw(this.drawingService.baseCtx, stampCommand);
            this.undoRedoManager.undoStack.push(stampCommand);
            this.undoRedoManager.enableUndoRedo();
            this.undoRedoManager.clearRedoStack();
        }
    }

    onMouseMove(mouseMoveEvent: MouseEvent): void {
        if (!this.drawingService.resizeActive) {
            this.mouseDownCoord = this.getPositionFromMouse(mouseMoveEvent);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const stampCommand: StampCommandService = new StampCommandService();
            this.draw(this.drawingService.previewCtx, stampCommand);
            if (
                mouseMoveEvent.screenX <= TOOLBAR_WIDTH + MARGIN_OF_ERROR_TOOLBAR ||
                mouseMoveEvent.clientY <= this.drawingService.baseCtx.canvas.clientTop
            ) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
            }
        }
    }

    onMouseWheel(event: WheelEvent): void {
        if (!this.drawingService.resizeActive) {
            event.preventDefault();
            this.rotationAngle = this.rotationAngle + Math.round(event.deltaY / MOUSE_WHEEL_SINLGE_ROLL_SIZE) * this.rotationRate;
            this.resetWheelIfBeyondRange();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const stampCommand: StampCommandService = new StampCommandService();
            this.draw(this.drawingService.previewCtx, stampCommand);
        }
    }

    draw(ctx: CanvasRenderingContext2D, stampCommand: StampCommandService): void {
        this.isEventListenerSet = false;
        stampCommand.setAttributes(this.rotationAngle, this.stampName, this.stampSize, this.mouseDownCoord);
        if (ctx === this.drawingService.baseCtx) {
            this.drawingService.drawingStarted = true;
        }
        stampCommand.execute(ctx);
    }

    resetWheelIfBeyondRange(): void {
        if (this.rotationAngle >= THREE_HUNDRED_SIXTY_DEGREES) {
            this.rotationAngle = ZERO_DEGREES;
        } else if (this.rotationAngle <= ZERO_DEGREES) {
            this.rotationAngle = THREE_HUNDRED_SIXTY_DEGREES;
        }
    }

    onAlt(): void {
        if (!this.isEventListenerSet) {
            window.addEventListener('keydown', this.setAltIsPressed);
            window.addEventListener('keyup', this.setAltIsNotPressed);
            this.isEventListenerSet = true;
        }
    }

    setAltIsPressed = (keyDownShiftEvent: KeyboardEvent) => {
        if (keyDownShiftEvent.key === 'Alt') {
            this.rotationRate = ROTATION_BY_1_DEGREE;
        }
    };

    setAltIsNotPressed = (keyUpAltEvent: KeyboardEvent) => {
        if (keyUpAltEvent.key === 'Alt') {
            this.rotationRate = ROTATION_BY_15_DEGREES;
            window.removeEventListener('keypress', this.setAltIsPressed);
            window.removeEventListener('keyup', this.setAltIsNotPressed);
            this.isEventListenerSet = false;
        }
    };
}

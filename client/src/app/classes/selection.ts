import { DrawingService } from '@app/services/drawing/drawing.service';
import { AnchorService } from '@app/services/tools/anchor.service';
import { ClipboardService } from '@app/services/tools/clipboard.service';
import { LineHelperService } from '@app/services/tools/line-helper.service';
import { MagnetismService } from '@app/services/tools/magnetism.service';
import { SelectionCommandService } from '@app/services/tools/tool-commands/selection-command.service';
import { UndoRedoManagerService } from '@app/services/tools/undo-redo-manager.service';
import { Tool } from './tool';
import { Vec2 } from './vec2';

const PIXEL_MODIFIER = 3;
const FIRST_PRESS_WAIT_TIME = 500;
const PRESS_WAIT_TIME = 100;

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Selection extends Tool {
    offsetXModifier: number = 0;
    offsetYModifier: number = 0;
    rightArrowCheck: boolean = false;
    leftArrowCheck: boolean = false;
    upArrowCheck: boolean = false;
    downArrowCheck: boolean = false;
    needTimer: boolean = false;
    lastPos: Vec2 = { x: 0, y: 0 };
    currentLine: Vec2[] = [];
    shiftIsPressed: boolean = false;
    anchorPoints: Vec2[];
    currentAnchor: number;
    hasBeenReseted: boolean = false;
    currentlySelecting: boolean = false;
    changeAnchor: boolean;
    imageData: ImageData;
    lastOffset: Vec2;
    lineHelper: LineHelperService;
    backgroundImageData: ImageData;
    anchorService: AnchorService;
    isMovingImg: boolean = false;
    isStarted: boolean;
    lassoPath: Vec2[][] = [];
    pathBuffer: Vec2[][] = [];
    startingPoint: Vec2;
    endPoint: Vec2;
    currentMousePos: Vec2;

    constructor(
        public drawingService: DrawingService,
        public undoRedoManager: UndoRedoManagerService,
        public lineHelperService: LineHelperService,
        public anchor: AnchorService,
        public magnetismService: MagnetismService,
        public clipboardService: ClipboardService,
    ) {
        super(drawingService);
        this.localShortcuts = new Map([
            ['Shift', this.onShift],
            ['ArrowRight', this.moveRight],
            ['ArrowLeft', this.moveLeft],
            ['ArrowUp', this.moveUp],
            ['ArrowDown', this.moveDown],
            ['Backspace', this.onBackSpace],
            ['Escape', this.onEscape],
        ]);
        this.undoRedoManager = undoRedoManager;
        this.lineHelper = lineHelperService;
        this.anchorService = anchor;
        this.toolName = 'Sélection';
    }

    onShift(): void {
        if (!this.shiftIsPressed) {
            window.addEventListener('keydown', this.setShiftIsPressed);
            window.addEventListener('keyup', this.setShiftNonPressed);
            this.shiftIsPressed = true;
        }
    }
    setShiftNonPressed(event: KeyboardEvent): void {}
    setShiftIsPressed(event: KeyboardEvent): void {}

    resetState(): void {
        this.anchorPoints = [];
        this.currentLine = [];
        this.lassoPath = [];
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const selectionCommand: SelectionCommandService = new SelectionCommandService(this.drawingService);
        selectionCommand.imageData = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.baseCtx.canvas.width,
            this.drawingService.baseCtx.canvas.height,
        );
        this.undoRedoManager.undoStack.push(selectionCommand);
        this.undoRedoManager.clearRedoStack();
        this.hasBeenReseted = true;
        this.currentlySelecting = false;
        this.changeAnchor = false;
    }

    setImageData(): void {
        const width: number = this.currentLine[1].x - this.currentLine[0].x;
        const height: number = this.currentLine[1].y - this.currentLine[0].y;
        this.imageData = this.drawingService.baseCtx.getImageData(this.currentLine[0].x, this.currentLine[0].y, width, height);
    }

    keyupHandler(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowDown': {
                this.offsetYModifier -= PIXEL_MODIFIER;
                this.downArrowCheck = false;
                break;
            }
            case 'ArrowUp': {
                this.offsetYModifier += PIXEL_MODIFIER;
                this.upArrowCheck = false;
                break;
            }
            case 'ArrowRight': {
                this.offsetXModifier -= PIXEL_MODIFIER;
                this.rightArrowCheck = false;
                break;
            }
            case 'ArrowLeft': {
                this.offsetXModifier += PIXEL_MODIFIER;
                this.leftArrowCheck = false;
                break;
            }
        }
    }

    waitTimer(): void {
        if (this.offsetXModifier === 0 && this.offsetYModifier === 0) {
            setTimeout(() => {}, FIRST_PRESS_WAIT_TIME);
            this.needTimer = false;
        } else {
            setTimeout(() => {}, PRESS_WAIT_TIME);
        }
    }

    moveRight(): void {
        this.waitTimer();
        if (!this.rightArrowCheck) {
            this.offsetXModifier += PIXEL_MODIFIER;
            this.rightArrowCheck = true;
        }
        this.setImageData();
        if (this.magnetismService.isActivated) {
            const newPosition: Vec2 = this.magnetismService.moveRightHandler(this.currentLine);
            this.moveImageData(newPosition.x, newPosition.y);
        } else {
            this.moveImageData(this.lastPos.x + this.offsetXModifier, this.lastPos.y + this.offsetYModifier);
        }
    }

    moveLeft(): void {
        this.waitTimer();
        if (!this.leftArrowCheck) {
            this.offsetXModifier -= PIXEL_MODIFIER;
            this.leftArrowCheck = true;
        }
        this.setImageData();
        if (this.magnetismService.isActivated) {
            const newPosition: Vec2 = this.magnetismService.moveLeftHandler(this.currentLine);
            this.moveImageData(newPosition.x, newPosition.y);
        } else {
            this.moveImageData(this.lastPos.x + this.offsetXModifier, this.lastPos.y + this.offsetYModifier);
        }
    }

    moveUp(): void {
        this.waitTimer();
        if (!this.upArrowCheck) {
            this.offsetYModifier -= PIXEL_MODIFIER;
            this.upArrowCheck = true;
        }
        this.setImageData();
        if (this.magnetismService.isActivated) {
            const newPosition: Vec2 = this.magnetismService.moveUpHandler(this.currentLine);
            this.moveImageData(newPosition.x, newPosition.y);
        } else {
            this.moveImageData(this.lastPos.x + this.offsetXModifier, this.lastPos.y + this.offsetYModifier);
        }
    }

    moveDown(): void {
        this.waitTimer();
        if (!this.downArrowCheck) {
            this.offsetYModifier += PIXEL_MODIFIER;
            this.downArrowCheck = true;
        }
        this.setImageData();
        if (this.magnetismService.isActivated) {
            const newPosition: Vec2 = this.magnetismService.moveDownHandler(this.currentLine);
            this.moveImageData(newPosition.x, newPosition.y);
        } else {
            this.moveImageData(this.lastPos.x + this.offsetXModifier, this.lastPos.y + this.offsetYModifier);
        }
    }

    onEscape(): void {}

    onBackSpace(): void {}

    moveImageData(offsetX: number, offsetY: number): void {}

    getImageData(): ImageData {
        return (undefined as unknown) as ImageData;
    }

    fixCurrentLine(): void {
        if (this.currentLine[0].x > this.currentLine[1].x) {
            const temp: number = this.currentLine[0].x;
            this.currentLine[0].x = this.currentLine[1].x;
            this.currentLine[1].x = temp;
        }

        if (this.currentLine[0].y > this.currentLine[1].y) {
            const temp: number = this.currentLine[0].y;
            this.currentLine[0].y = this.currentLine[1].y;
            this.currentLine[1].y = temp;
        }

        this.setAnchorPoints(this.currentLine);
    }

    setAnchorPoints(path: Vec2[]): void {
        this.sendAnchorData();
        this.anchorService.setAnchorPoints(path);
        this.getAnchorData();
    }

    drawAnchorPoints(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.sendAnchorData();
        this.anchorService.drawAnchorPoints(ctx, path);
        this.getAnchorData();
    }

    moveAnchor(event: MouseEvent): void {
        this.sendAnchorData();
        this.anchorService.moveAnchor(event);
        this.getAnchorData();
        this.lastOffset = this.getPositionFromMouse(event);
        this.resizeSelection(event);
    }

    sendAnchorData(): void {
        this.anchorService.getSelectionData(this.currentLine, this.anchorPoints, this.currentAnchor, this.shiftIsPressed, this.lastOffset);
    }

    getAnchorData(): void {
        this.currentLine = this.anchorService.currentLine;
        this.anchorPoints = this.anchorService.anchorPoints;
        this.currentAnchor = this.anchorService.currentAnchor;
    }

    resizeSelection(event: MouseEvent): void {}

    drawRectangle(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1;
        ctx.lineCap = 'square';
        ctx.strokeRect(path[0].x, path[0].y, path[1].x - path[0].x, path[1].y - path[0].y);
        ctx.closePath();
    }
    checkIfClickOnAnchor(event: MouseEvent): boolean {
        this.sendAnchorData();
        const answer: boolean = this.anchorService.checkIfClickOnAnchor(event);
        this.getAnchorData();
        return answer;
    }
    copySelection(): void {
        if (this.currentLine.length === 2) {
            this.clipboardService.copy = this.imageData;
            this.clipboardService.alreadyCopied = true;
        }
    }

    resetStateForPaste(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const selectionCommand: SelectionCommandService = new SelectionCommandService(this.drawingService);
        this.undoRedoManager.undoStack.push(selectionCommand);
        this.undoRedoManager.clearRedoStack();
        this.isMovingImg = false;
    }
}

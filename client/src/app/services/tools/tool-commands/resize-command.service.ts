import { ElementRef, Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';
import { Constant } from '@app/constants/general-constants-store';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ResizeCommandService extends UndoRedoCommand {
    mouseDown: boolean = false;
    isCorner: boolean = false;
    isSide: boolean = false;
    isBottom: boolean = false;
    bottomHandle: Vec2 = { x: Constant.DEFAULT_WIDTH / 2, y: Constant.DEFAULT_HEIGHT };
    sideHandle: Vec2 = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT / 2 };
    cornerHandle: Vec2 = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT };
    preview: Vec2 = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT };
    baseCanvas: ElementRef<HTMLCanvasElement>;
    canvasSize: Vec2;
    canvasSizeObserver: Subject<Vec2> = new Subject<Vec2>();
    isResizer: boolean = true;
    isSubscribed: boolean = false;
    lastImage: HTMLImageElement = new Image();

    constructor(public drawingService: DrawingService) {
        super();
    }

    startResize(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        this.drawingService.resizeActive = true;
    }

    resize(event: MouseEvent, canvas: DOMRect): void {
        if (this.mouseDown) {
            if (this.isBottom) {
                this.preview.y = event.pageY >= Constant.MIN_HEIGH ? event.pageY : Constant.MIN_HEIGH;
            } else if (this.isSide) {
                this.preview.x = event.pageX - (canvas.left + window.scrollY) >= Constant.MIN_WIDTH ? event.pageX - canvas.left : Constant.MIN_WIDTH;
            } else if (this.isCorner) {
                this.preview.y = event.pageY >= Constant.MIN_HEIGH ? event.pageY : Constant.MIN_HEIGH;
                this.preview.x = event.pageX - (canvas.left + window.scrollY) >= Constant.MIN_WIDTH ? event.pageX - canvas.left : Constant.MIN_WIDTH;
            }
        }
    }

    setBaseCanvas(baseCanvas: ElementRef<HTMLCanvasElement>): void {
        this.baseCanvas = baseCanvas;
    }

    setSideBools(isCorner: boolean, isSide: boolean, isBottom: boolean): void {
        this.isCorner = isCorner;
        this.isSide = isSide;
        this.isBottom = isBottom;
    }

    setCanvasSize(canvasSize: Vec2): void {
        this.canvasSize = { x: canvasSize.x, y: canvasSize.y };
    }

    setHandles(sideHandle: Vec2, bottomHandle: Vec2, cornerHandle: Vec2): void {
        this.sideHandle = sideHandle;
        this.bottomHandle = bottomHandle;
        this.cornerHandle = cornerHandle;
    }

    execute(ctx: CanvasRenderingContext2D): void {
        this.copyCanvas(this.baseCanvas);
        if (this.isBottom) {
            this.canvasSize.y = this.preview.y;
            if (!this.isSubscribed) {
                this.canvasSizeObserver.next(this.canvasSize);
            }
        } else if (this.isSide) {
            this.canvasSize.x = this.preview.x;
            if (!this.isSubscribed) {
                this.canvasSizeObserver.next(this.canvasSize);
            }
        } else if (this.isCorner) {
            this.canvasSize.x = this.preview.x;
            this.canvasSize.y = this.preview.y;
            if (!this.isSubscribed) {
                this.canvasSizeObserver.next(this.canvasSize);
            }
        }
        this.mouseDown = false;
        this.relocateHandles();
        this.drawingService.resizeActive = false;
    }

    // inspired by the answer dating from Nov 10 '10 at 14:31
    // https://stackoverflow.com/questions/4137372/display-canvas-image-from-one-canvas-to-another-canvas-using-base64
    copyCanvas(baseCanvas: ElementRef<HTMLCanvasElement>): void {
        const imageTemp = new Image();
        imageTemp.src = baseCanvas.nativeElement.toDataURL() as string;
        const newCtx = baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        imageTemp.onload = () => {
            newCtx.fillStyle = 'white';
            newCtx.fillRect(0, 0, newCtx.canvas.width, newCtx.canvas.height);
            newCtx.drawImage(imageTemp, 0, 0);
        };
    }

    relocateHandles(): void {
        this.sideHandle.y = this.canvasSize.y / 2;
        this.sideHandle.x = this.canvasSize.x;
        this.bottomHandle.y = this.canvasSize.y;
        this.bottomHandle.x = this.canvasSize.x / 2;
        this.cornerHandle.y = this.canvasSize.y;
        this.cornerHandle.x = this.canvasSize.x;
    }

    resetSideBools(): void {
        this.isBottom = false;
        this.isSide = false;
        this.isCorner = false;
    }

    setPreview(preview: Vec2): void {
        this.preview = { x: preview.x, y: preview.y };
    }
}

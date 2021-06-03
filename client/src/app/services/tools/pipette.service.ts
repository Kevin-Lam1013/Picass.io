// This service was inspired by the code in the following links
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

import { EventEmitter, Injectable, Output } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { faEyeDropper, IconDefinition } from '@fortawesome/free-solid-svg-icons';

const HALF_PIXEL_OFFSET = 0.5; // This offsets the pixel by half a pixel to center it
const NUM_TO_CENTER_MAGNIFIER_X = 1.5; // This number allows the center of our magnifier preview to follow the mouse cursor on X
const NUM_TO_CENTER_MAGNIFIER_Y = 2.5; // This number allows the center of our magnifier preview to follow the mouse cursor on Y
const ZOOM_WIDTH = 4; // The width of the zoomed portion of the canvas in pixels
const ZOOM_HEIGHT = 4; // The height of the zoomed portion of the canvas in pixels
const X_START_PIXEL_MAGNIFIER = 0; // Starting pixel on x axis for magnifying glass
const Y_START_PIXEL_MAGNIFIER = 0; // Starting pixel on y axis for magnifying glass
const MAGNIFIER_WIDTH = 160; // The width of the magnifier in pixels
const MAGNIFIER_HEIGHT = 160; // The width of the magnifier in pixels

const X_START_BLACK_RETICULE = 77.5; // Starting pixel on x axis for the black reticule
const Y_START_BLACK_RETICULE = 77.5; // Starting pixel on y axis for the black reticule
const BLACK_RETICULE_WIDTH = 5; // The width of the black reticule in pixels
const BLACK_RETICULE_HEIGHT = 5; // The height of the black reticule in pixels
const LINE_WIDTH_BLACK_RETICULE = 1;

const X_START_WHITE_RETICULE = 78; // Starting pixel on x axis for the white reticule
const Y_START_WHITE_RETICULE = 78; // Starting pixel on y axis for the white reticule
const WHITE_RETICULE_WIDTH = 4; // The width of the white reticule in pixels
const WHITE_RETICULE_HEIGHT = 4; // The height of the white reticule in pixels
const LINE_WIDTH_WHITE_RETICULE = 0.5;

const MARGIN_OF_ERROR_CANVAS = 1; // As to avoid drawing the outside of our canvas, we place a margin of error to avoid the preview from appearing when we approach the canvas edge
const TOOLBAR_WIDTH = 316;
const MARGIN_OF_ERROR_TOOLBAR = 3; // As to avoid drawing the outside of our canvas, we place a margin of error to avoid the preview from appearing when we approach the toolbar edge

const OPACITY = 1; // The pipette only takes colors, therefore our color opacity will always be 1

@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    icon: IconDefinition = faEyeDropper;
    pipetteToolIndex: number = 9;
    selectedPosition: { x: number; y: number };

    magnifierCtx: CanvasRenderingContext2D;
    reticuleCtx: CanvasRenderingContext2D;
    ctx: CanvasRenderingContext2D;

    constructor(drawingService: DrawingService, private colorService: ColorService) {
        super(drawingService);
        this.colorService = colorService;
        this.shortcut = 'i';
        this.localShortcuts = new Map();
        this.index = this.pipetteToolIndex;
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: 1,
        };
        this.toolName = 'Pipette';
    }

    @Output()
    colorEmitted: EventEmitter<string> = new EventEmitter(true);

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        if (event.button === MouseButton.Left) {
            this.mouseDown = false;
            this.assignPrimaryColor(event, this.drawingService.baseCtx); // Left click assigns primary color
        }
        if (event.button === MouseButton.Right) {
            this.mouseDown = false;
            this.assignSecondaryColor(event, this.drawingService.baseCtx); // Right click assigns secondary color
        }
    }

    magnifyingPreview(event: MouseEvent): void {
        this.magnifierCtx.drawImage(
            // We create the magnifying preview by zooming in on the canvas
            this.drawingService.baseCtx.canvas,
            event.offsetX - NUM_TO_CENTER_MAGNIFIER_X,
            event.offsetY - NUM_TO_CENTER_MAGNIFIER_Y,
            ZOOM_WIDTH,
            ZOOM_HEIGHT,
            X_START_PIXEL_MAGNIFIER,
            Y_START_PIXEL_MAGNIFIER,
            MAGNIFIER_WIDTH,
            MAGNIFIER_HEIGHT,
        );
        this.magnifierCtx.imageSmoothingEnabled = false; // We choose to pixelize the image for a clearer selection of pixels

        this.magnifierCtx.strokeRect(X_START_BLACK_RETICULE, Y_START_BLACK_RETICULE, BLACK_RETICULE_WIDTH, BLACK_RETICULE_HEIGHT);
        this.magnifierCtx.strokeStyle = 'black';
        this.magnifierCtx.lineWidth = LINE_WIDTH_BLACK_RETICULE; // We create the black targeting reticule

        this.magnifierCtx.strokeRect(X_START_WHITE_RETICULE, Y_START_WHITE_RETICULE, WHITE_RETICULE_WIDTH, WHITE_RETICULE_HEIGHT);
        this.magnifierCtx.strokeStyle = 'white';
        this.magnifierCtx.lineWidth = LINE_WIDTH_WHITE_RETICULE; // We create the white targeting reticule

        if (
            this.drawingService.baseCtx.canvas.width - MARGIN_OF_ERROR_CANVAS >= event.offsetX ||
            this.drawingService.baseCtx.canvas.height - MARGIN_OF_ERROR_CANVAS >= event.offsetY
        ) {
            this.magnifierCtx.canvas.style.display = 'inline-block'; // The magnfier is displayed when the cursor is inside the right or bottom edges of the canvas
        }

        if (
            this.drawingService.baseCtx.canvas.width - MARGIN_OF_ERROR_CANVAS <= event.offsetX ||
            this.drawingService.baseCtx.canvas.height - MARGIN_OF_ERROR_CANVAS <= event.offsetY
        ) {
            this.magnifierCtx.canvas.style.display = 'none'; // The magnfier is not displayed when the cursor is outside the right or bottom edges of the canvas
        }

        if (event.screenX <= TOOLBAR_WIDTH + MARGIN_OF_ERROR_TOOLBAR) {
            this.magnifierCtx.canvas.style.display = 'none'; // The magnfier is not displayed when the cursor on the toolbar
        }

        if (event.clientY <= this.drawingService.baseCtx.canvas.clientTop) {
            this.magnifierCtx.canvas.style.display = 'none'; // The magnfier is not displayed when the cursor is above the canvas
        }
    }

    assignPrimaryColor(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
        if (this.drawingService.baseCtx.canvas.width >= event.offsetX && this.drawingService.baseCtx.canvas.height >= event.offsetY) {
            if (ctx === this.drawingService.baseCtx) {
                this.drawingService.drawingStarted = true; // We verify that the drawing is started and the cursor is inside the right and bottom edges of the canvas
            }

            this.selectedPosition = { x: event.offsetX, y: event.offsetY };
            const imageData = ctx.getImageData(this.selectedPosition.x + HALF_PIXEL_OFFSET, this.selectedPosition.y - HALF_PIXEL_OFFSET, 1, 1).data; // We retrieve the mouse click position

            this.colorService.primaryColorPreview = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',' + OPACITY + ')'; // We affect our colors
            this.colorService.primaryColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',' + OPACITY + ')';
            this.colorService.pushToQueueOnConfirm('rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',' + OPACITY + ')');
        }
    }

    assignSecondaryColor(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
        if (this.drawingService.baseCtx.canvas.width >= event.offsetX && this.drawingService.baseCtx.canvas.height >= event.offsetY) {
            if (ctx === this.drawingService.baseCtx) {
                this.drawingService.drawingStarted = true; // We verify that the drawing is started and the cursor is inside the right and bottom edges of the canvas
            }

            this.selectedPosition = { x: event.offsetX, y: event.offsetY };
            const imageData = ctx.getImageData(this.selectedPosition.x + HALF_PIXEL_OFFSET, this.selectedPosition.y - HALF_PIXEL_OFFSET, 1, 1).data; // We retrieve the mouse click position

            this.colorService.secondaryColorPreview = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',' + OPACITY + ')'; // We affect our colors
            this.colorService.secondaryColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',' + OPACITY + ')';
            this.colorService.pushToQueueOnConfirm('rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',' + OPACITY + ')');
        }
    }
}

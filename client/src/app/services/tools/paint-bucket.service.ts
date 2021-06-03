// This service was inspired by the code in the following links
// http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
// https://jsfiddle.net/Fidel90/1e8e3z7e/
// https://stackoverflow.com/questions/21576092/convert-rgba-to-hex/21576659#21576659
// https://www.geeksforgeeks.org/depth-first-traversal-dfs-on-a-2d-array/?fbclid=IwAR3_f8RapDnw_xj4LkJ4eEgfBeqDXvYdUBiOwWYIvZYDh7xwtqk9Iw-Q0c4

import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { PaintBucketCommandService } from '@app/services/tools/tool-commands/paint-bucket-command.service';
import { UndoRedoManagerService } from '@app/services/tools/undo-redo-manager.service';
import { faFillDrip, IconDefinition } from '@fortawesome/free-solid-svg-icons';

const R_INDEX = 0;
const G_INDEX = 1;
const B_INDEX = 2;
const A_INDEX = 3;

const BASE_TEN = 10;
const MAX_RGBA_VALUE = 255;

const FOUR_COEFFICIENT = 4;
const ONE_INCREMENT = 1;
const TWO_INCREMENT = 2;
const THREE_INCREMENT = 3;
const FOUR_INCREMENT = 4;

const ONE_PERCENT = 1;
const ONE_HUNDRED_PERCENT = 100;

export interface StartingColor {
    r: number;
    g: number;
    b: number;
    a: number;
}
@Injectable({
    providedIn: 'root',
})
export class PaintBucketService extends Tool {
    icon: IconDefinition = faFillDrip;
    paintBucketToolIndex: number = 14;
    startingColor: StartingColor;
    pixelPositionStack: number[] = [];
    visitedPixelPositions: Set<number> = new Set<number>();
    primaryColorValuesString: string[];
    primaryColorValuesNumber: number[];
    xPixelPosition: number;
    yPixelPosition: number;
    currentPixelPosition: number;
    filledCanvasImage: ImageData;
    redValueOnWhiteBackground: number;
    greenValeOnWhiteBackground: number;
    blueValueOnWhiteBackground: number;
    tolerancePercentage: number = 0;
    iterator: number = 0;

    constructor(drawingService: DrawingService, private colorService: ColorService, public undoRedoManager: UndoRedoManagerService) {
        super(drawingService);
        this.colorService = colorService;
        this.shortcut = 'b';
        this.localShortcuts = new Map();
        this.index = this.paintBucketToolIndex;
        this.toolStyles = {
            primaryColor: 'black',
            lineWidth: 1,
        };
        this.toolName = 'Sceau de Peinture';
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        if (event.button === MouseButton.Left) {
            this.mouseDown = false;
            if (event.offsetX < this.drawingService.baseCtx.canvas.width && event.offsetY < this.drawingService.baseCtx.canvas.height) {
                this.contiguousColoring(event);
                const paintBucketCommand: PaintBucketCommandService = new PaintBucketCommandService(this.drawingService);
                paintBucketCommand.imageData = this.drawingService.baseCtx.getImageData(
                    0,
                    0,
                    this.drawingService.baseCtx.canvas.width,
                    this.drawingService.baseCtx.canvas.height,
                );
                this.undoRedoManager.undoStack.push(paintBucketCommand);
                this.undoRedoManager.clearRedoStack();
                this.undoRedoManager.enableUndoRedo();
                this.drawingService.drawingStarted = true;
            }
        }
        if (event.button === MouseButton.Right) {
            this.mouseDown = false;
            if (event.offsetX < this.drawingService.baseCtx.canvas.width && event.offsetY < this.drawingService.baseCtx.canvas.height) {
                this.nonContiguousColoring(event);
                const paintBucketCommand: PaintBucketCommandService = new PaintBucketCommandService(this.drawingService);
                paintBucketCommand.imageData = this.drawingService.baseCtx.getImageData(
                    0,
                    0,
                    this.drawingService.baseCtx.canvas.width,
                    this.drawingService.baseCtx.canvas.height,
                );
                this.undoRedoManager.undoStack.push(paintBucketCommand);
                this.undoRedoManager.clearRedoStack();
                this.undoRedoManager.enableUndoRedo();
                this.drawingService.drawingStarted = true;
            }
        }
    }

    // Sources of inspiration
    // http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
    // https://jsfiddle.net/Fidel90/1e8e3z7e/
    nonContiguousColoring(event: MouseEvent): void {
        // We retrieve the entire canvas
        this.filledCanvasImage = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.baseCtx.canvas.width,
            this.drawingService.baseCtx.canvas.height,
        );

        // We split the primary color into a string array where opacity is on a scale of 1
        this.primaryColorValuesString = this.colorService.primaryColor.replace('rgba(', '').replace(')', '').split(',');

        // We make a number array for the primary color where opacity is on a scale of 255
        this.primaryColorValuesNumber = [
            parseInt(this.primaryColorValuesString[R_INDEX], BASE_TEN),
            parseInt(this.primaryColorValuesString[G_INDEX], BASE_TEN),
            parseInt(this.primaryColorValuesString[B_INDEX], BASE_TEN),
            Math.round(parseFloat(this.primaryColorValuesString[A_INDEX]) * MAX_RGBA_VALUE),
        ];

        // We put the primary color onto the white background
        this.primaryColorOnWhiteBackground();

        // We calculate the pixel position read linearly from left to right. It leaps in 4 due to each element of an image date array being only one value of RGBA.
        // One color is thus represented by 4 array elements
        this.currentPixelPosition = (event.offsetY * this.drawingService.baseCtx.canvas.width + event.offsetX) * FOUR_COEFFICIENT;

        // We initialize the starting color
        this.startingColor = {
            r: this.filledCanvasImage.data[this.currentPixelPosition],
            g: this.filledCanvasImage.data[this.currentPixelPosition + ONE_INCREMENT],
            b: this.filledCanvasImage.data[this.currentPixelPosition + TWO_INCREMENT],
            a: this.filledCanvasImage.data[this.currentPixelPosition + THREE_INCREMENT],
        };

        // We traverse the entire canvas pixel by pixel in increments of four. It leaps in 4 due to each element of an image date array being only one value of RGBA.
        // One color is thus represented by 4 array elements
        for (this.iterator; this.iterator < this.filledCanvasImage.data.length - ONE_INCREMENT; this.iterator += FOUR_INCREMENT) {
            if (this.matchStartColor(this.iterator)) {
                this.colorPixel(this.iterator);
            }
        }

        // We affect the canvas and put the iterator to 0
        this.drawingService.baseCtx.putImageData(this.filledCanvasImage, 0, 0);
        this.iterator = 0;
    }

    // Sources of inspiration
    // http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
    // https://jsfiddle.net/Fidel90/1e8e3z7e/
    // https://www.geeksforgeeks.org/depth-first-traversal-dfs-on-a-2d-array/?fbclid=IwAR3_f8RapDnw_xj4LkJ4eEgfBeqDXvYdUBiOwWYIvZYDh7xwtqk9Iw-Q0c4
    // https://algorithms.tutorialhorizon.com/depth-first-search-dfs-in-2d-matrix-2d-array-iterative-solution/
    contiguousColoring(event: MouseEvent): void {
        // We retrieve the entire canvas
        this.filledCanvasImage = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.baseCtx.canvas.width,
            this.drawingService.baseCtx.canvas.height,
        );

        // We split the primary color into a string array where opacity is on a scale of 1
        this.primaryColorValuesString = this.colorService.primaryColor.replace('rgba(', '').replace(')', '').split(',');

        // We make a number array for the primary color where opacity is on a scale of 255
        this.primaryColorValuesNumber = [
            parseInt(this.primaryColorValuesString[R_INDEX], BASE_TEN),
            parseInt(this.primaryColorValuesString[G_INDEX], BASE_TEN),
            parseInt(this.primaryColorValuesString[B_INDEX], BASE_TEN),
            Math.round(parseFloat(this.primaryColorValuesString[A_INDEX]) * MAX_RGBA_VALUE),
        ];

        // We put the primary color onto the white background
        this.primaryColorOnWhiteBackground();

        // We calculate the pixel position read linearly from left to right. It leaps in 4 due to each element of an image date array being only one value of RGBA.
        // One color is thus represented by 4 array elements
        this.currentPixelPosition = (event.offsetY * this.drawingService.baseCtx.canvas.width + event.offsetX) * FOUR_COEFFICIENT;

        // We calculate the pixel position using coordinates derived from the current pixel position read linearly
        this.xPixelPosition = (this.currentPixelPosition / FOUR_COEFFICIENT) % this.drawingService.baseCtx.canvas.width;
        this.yPixelPosition = Math.floor(this.currentPixelPosition / FOUR_COEFFICIENT / this.drawingService.baseCtx.canvas.width);

        // We initialize the starting color
        this.startingColor = {
            r: this.filledCanvasImage.data[this.currentPixelPosition],
            g: this.filledCanvasImage.data[this.currentPixelPosition + ONE_INCREMENT],
            b: this.filledCanvasImage.data[this.currentPixelPosition + TWO_INCREMENT],
            a: this.filledCanvasImage.data[this.currentPixelPosition + THREE_INCREMENT],
        };
        // We put the current position onto the stack
        this.pixelPositionStack.push(this.currentPixelPosition);

        // We verify if the starting color is the same as the primary color as to avoid filling an area with its own color
        if (!this.matchFillColor()) {
            // We continue the algorithm as long as there are still pixels left
            while (this.pixelPositionStack.length > 0) {
                // The current pixel is the one we pop from the stack
                this.currentPixelPosition = this.pixelPositionStack.pop() as number;

                // We verify if the current pixel is the same color as the starting pixel and if it has already been visited in our traversal
                if (this.matchStartColor(this.currentPixelPosition) && !this.visitedPixelPositions.has(this.currentPixelPosition)) {
                    // We add the visited pixel onto our visited stack
                    this.visitedPixelPositions.add(this.currentPixelPosition);

                    // We color in the pixel
                    this.colorPixel(this.currentPixelPosition);

                    // Here we draw heavy inspiration from our sources stated above by mixing their logic with a dfs style traversal. The conditions and the computations pushed are taken from the source.
                    // It is simpler to push the linear pixel position as opposed to the x and y coordinates.
                    // We check if the pixel before us is the top edge of the canvas
                    if (this.yPixelPosition - ONE_INCREMENT >= 0) {
                        this.pixelPositionStack.push(this.currentPixelPosition - this.drawingService.baseCtx.canvas.width * FOUR_COEFFICIENT);
                    }
                    // We check if the pixel after us is the bottom edge of the canvas. We subtract height by 1 because a and y start at 0.
                    if (this.yPixelPosition + ONE_INCREMENT <= this.drawingService.baseCtx.canvas.height - ONE_INCREMENT) {
                        this.pixelPositionStack.push(this.currentPixelPosition + this.drawingService.baseCtx.canvas.width * FOUR_COEFFICIENT);
                    }
                    // We check if the pixel to the left of us is the left edge of the canvas
                    if (this.xPixelPosition - ONE_INCREMENT >= 0) {
                        this.pixelPositionStack.push(this.currentPixelPosition - FOUR_INCREMENT);
                    }
                    // We check if the pixel to the right of us is the right edge of the canvas. We subtract height by 1 because a and y start at 0.
                    if (this.xPixelPosition + ONE_INCREMENT <= this.drawingService.baseCtx.canvas.width - ONE_INCREMENT) {
                        this.pixelPositionStack.push(this.currentPixelPosition + FOUR_INCREMENT);
                    }
                }
            }
            // We affect the canvas and clear the visited pixels
            this.drawingService.baseCtx.putImageData(this.filledCanvasImage, 0, 0);
            this.visitedPixelPositions.clear();
        }
    }

    // This function verifies if the current pixel color matches the starting pixel color as to continue filling
    matchStartColor(pixelPosition: number): boolean {
        // We want to fill with only the primary color if there is no tolerance. We thus verify if the pixel has the same color as primary color.
        if (this.tolerancePercentage === 0) {
            return (
                this.filledCanvasImage.data[pixelPosition] === this.startingColor.r &&
                this.filledCanvasImage.data[pixelPosition + ONE_INCREMENT] === this.startingColor.g &&
                this.filledCanvasImage.data[pixelPosition + TWO_INCREMENT] === this.startingColor.b &&
                this.filledCanvasImage.data[pixelPosition + THREE_INCREMENT] === this.startingColor.a
            );
        }

        // We fill with colors respecting the tolerance interval. We verify if the pixel is in the interval.
        if (this.tolerancePercentage <= ONE_HUNDRED_PERCENT && this.tolerancePercentage >= ONE_PERCENT) {
            return (
                this.startingColor.r - MAX_RGBA_VALUE * (this.tolerancePercentage / ONE_HUNDRED_PERCENT) <=
                    this.filledCanvasImage.data[pixelPosition] &&
                this.filledCanvasImage.data[pixelPosition] <=
                    this.startingColor.r + MAX_RGBA_VALUE * (this.tolerancePercentage / ONE_HUNDRED_PERCENT) &&
                this.startingColor.g - MAX_RGBA_VALUE * (this.tolerancePercentage / ONE_HUNDRED_PERCENT) <=
                    this.filledCanvasImage.data[pixelPosition + ONE_INCREMENT] &&
                this.filledCanvasImage.data[pixelPosition + ONE_INCREMENT] <=
                    this.startingColor.g + MAX_RGBA_VALUE * (this.tolerancePercentage / ONE_HUNDRED_PERCENT) &&
                this.startingColor.b - MAX_RGBA_VALUE * (this.tolerancePercentage / ONE_HUNDRED_PERCENT) <=
                    this.filledCanvasImage.data[pixelPosition + TWO_INCREMENT] &&
                this.filledCanvasImage.data[pixelPosition + TWO_INCREMENT] <=
                    this.startingColor.b + MAX_RGBA_VALUE * (this.tolerancePercentage / ONE_HUNDRED_PERCENT)
            );
        }
        return false;
    }

    // This function verifies that the starting color is the same as the primary color so that we may avoid coloring in the same color
    matchFillColor(): boolean {
        if (this.tolerancePercentage === 0) {
            return (
                this.primaryColorValuesNumber[R_INDEX] === this.startingColor.r &&
                this.primaryColorValuesNumber[G_INDEX] === this.startingColor.g &&
                this.primaryColorValuesNumber[B_INDEX] === this.startingColor.b &&
                this.primaryColorValuesNumber[A_INDEX] === this.startingColor.a
            );
        }
        return false;
    }

    // This function colors in pixels
    colorPixel(pixelPosition: number): void {
        this.filledCanvasImage.data[pixelPosition] = this.primaryColorValuesNumber[R_INDEX];
        this.filledCanvasImage.data[pixelPosition + ONE_INCREMENT] = this.primaryColorValuesNumber[G_INDEX];
        this.filledCanvasImage.data[pixelPosition + TWO_INCREMENT] = this.primaryColorValuesNumber[B_INDEX];
        this.filledCanvasImage.data[pixelPosition + THREE_INCREMENT] = this.primaryColorValuesNumber[A_INDEX];
    }

    // Source: https://stackoverflow.com/questions/21576092/convert-rgba-to-hex/21576659#21576659
    // This function predicts what a color with transparency might have as values if put onto a white canvas
    // This function must be implemented for the bucket to function with the pipette.
    // All other tools draw onto the canvas. By drawing onto the white canvas with an opacity inferior to 1, we modify the value received by the getImageData() function.
    // This means that the RGBA values put onto a white canvas will not be the same once we retrieve them using getImageData().
    // The RGB values will change and the A value will always be perfectly opaque.
    // As opposed to the other tools, the bucket tool rather modifies directly the data values of a pixel instead of drawing onto them.
    // If we do not simulate the primary color on a white background before affecting the data values, the pipette will read the baseCtx and display perfectly opaque colors.
    // This function thus ensures continuity between the paint bucket by making it affect the canvas in the same way as the other tools.
    primaryColorOnWhiteBackground(): void {
        if (this.primaryColorValuesNumber[A_INDEX] !== MAX_RGBA_VALUE) {
            this.primaryColorValuesNumber[R_INDEX] = Math.round(
                (1 - this.primaryColorValuesNumber[A_INDEX] / MAX_RGBA_VALUE) * MAX_RGBA_VALUE +
                    (this.primaryColorValuesNumber[A_INDEX] / MAX_RGBA_VALUE) * this.primaryColorValuesNumber[R_INDEX],
            );
            this.primaryColorValuesNumber[G_INDEX] = Math.round(
                (1 - this.primaryColorValuesNumber[A_INDEX] / MAX_RGBA_VALUE) * MAX_RGBA_VALUE +
                    (this.primaryColorValuesNumber[A_INDEX] / MAX_RGBA_VALUE) * this.primaryColorValuesNumber[G_INDEX],
            );
            this.primaryColorValuesNumber[B_INDEX] = Math.round(
                (1 - this.primaryColorValuesNumber[A_INDEX] / MAX_RGBA_VALUE) * MAX_RGBA_VALUE +
                    (this.primaryColorValuesNumber[A_INDEX] / MAX_RGBA_VALUE) * this.primaryColorValuesNumber[B_INDEX],
            );
            this.primaryColorValuesNumber[A_INDEX] = MAX_RGBA_VALUE;
        }
    }

    // This function changes the tolerance. It is used for the slider.
    changeTolerancePercentage(tolerance: number): void {
        this.tolerancePercentage = tolerance;
    }
}

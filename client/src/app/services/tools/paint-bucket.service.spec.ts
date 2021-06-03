import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PaintBucketCommandService } from '@app/services/tools/tool-commands/paint-bucket-command.service';
import { ColorService } from './color.service';
import { PaintBucketService } from './paint-bucket.service';

describe('PaintBucketService', () => {
    let service: PaintBucketService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let paintBucketCommandServiceSpy: jasmine.SpyObj<PaintBucketCommandService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let dummyCanvas: ElementRef<HTMLCanvasElement>;
    const dummyNativeElement = document.createElement('canvas');

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearBackground']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['pushToQueueOnConfirm']);
        paintBucketCommandServiceSpy = jasmine.createSpyObj('PaintBucketCommandService', ['execute']);
        dummyCanvas = new ElementRef<HTMLCanvasElement>(dummyNativeElement);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: PaintBucketCommandService, useValue: paintBucketCommandServiceSpy },
            ],
        });
        service = TestBed.inject(PaintBucketService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changeTolerancePercentage changes the tolerance ', () => {
        service.changeTolerancePercentage(4);
        expect(service.tolerancePercentage).toEqual(4);
    });

    it('primaryColorOnWhiteBackground will simulate a color on a white background if primaryColorValuesNumber is not opaque', () => {
        service.primaryColorValuesNumber = [2, 2, 2, 255];
        service.primaryColorOnWhiteBackground();
        expect(service.primaryColorValuesNumber[0]).toEqual(2);
        expect(service.primaryColorValuesNumber[1]).toEqual(2);
        expect(service.primaryColorValuesNumber[2]).toEqual(2);
        expect(service.primaryColorValuesNumber[3]).toEqual(255);
    });

    it('primaryColorOnWhiteBackground will not simulate a color on a white background if primaryColorValuesNumber is not opaque', () => {
        service.primaryColorValuesNumber = [2, 2, 2, 2];
        service.primaryColorOnWhiteBackground();
        expect(service.primaryColorValuesNumber[0]).not.toEqual(2);
        expect(service.primaryColorValuesNumber[1]).not.toEqual(2);
        expect(service.primaryColorValuesNumber[2]).not.toEqual(2);
        expect(service.primaryColorValuesNumber[3]).toEqual(255);
    });

    it('colorPixel will color the pixel at a pixel position', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        service.primaryColorValuesNumber = [2, 2, 2, 2];
        service.colorPixel(0);
        expect(service.filledCanvasImage.data[0]).toEqual(service.primaryColorValuesNumber[0]);
        expect(service.filledCanvasImage.data[1]).toEqual(service.primaryColorValuesNumber[1]);
        expect(service.filledCanvasImage.data[2]).toEqual(service.primaryColorValuesNumber[2]);
        expect(service.filledCanvasImage.data[3]).toEqual(service.primaryColorValuesNumber[3]);
    });

    it('matchFillColor will return true if tolerance percentage is 0', () => {
        service.tolerancePercentage = 0;
        service.primaryColorValuesNumber = [0, 1, 2, 3];
        service.startingColor = {
            r: 0,
            g: 1,
            b: 2,
            a: 3,
        };
        expect(service.matchFillColor()).toBeTrue();
    });

    it('matchFillColor will return false if tolerance percentage is not 0', () => {
        service.tolerancePercentage = 2;
        service.primaryColorValuesNumber = [0, 1, 2, 3];
        service.startingColor = {
            r: 0,
            g: 1,
            b: 2,
            a: 3,
        };
        expect(service.matchFillColor()).toBeFalse();
    });

    it('onMouseDown should make mouseDown false if left mouse button is clicked', () => {
        service['undoRedoManager'].undoStack = [];
        service['undoRedoManager'].undoStack.push(new PaintBucketCommandService(service['drawingService']));
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 50;
        drawServiceSpy.baseCtx.canvas.height = 50;
        const contiguousColoringSpy = spyOn(service, 'contiguousColoring').and.returnValue();
        const enableUndoRedoSpy = spyOn(service['undoRedoManager'], 'enableUndoRedo').and.returnValue();
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(false);
        expect(contiguousColoringSpy).toHaveBeenCalledWith(mouseEventLClick);
        expect(enableUndoRedoSpy).toHaveBeenCalled();
    });

    it('onMouseDown should not call contiguous coloring if clicked outside the canvas ', () => {
        service['undoRedoManager'].undoStack = [];
        service['undoRedoManager'].undoStack.push(new PaintBucketCommandService(service['drawingService']));
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        const mouseEventLClick = {
            offsetX: 70,
            offsetY: 70,
            button: 0,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 50;
        drawServiceSpy.baseCtx.canvas.height = 50;
        const contiguousColoringSpy = spyOn(service, 'contiguousColoring').and.returnValue();
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(false);
        expect(contiguousColoringSpy).not.toHaveBeenCalledWith(mouseEventLClick);
    });

    it('onMouseDown should make mouseDown false if right mouse button is clicked', () => {
        service['undoRedoManager'].undoStack = [];
        service['undoRedoManager'].undoStack.push(new PaintBucketCommandService(service['drawingService']));
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 50;
        drawServiceSpy.baseCtx.canvas.height = 50;
        const nonContiguousColoringSpy = spyOn(service, 'nonContiguousColoring').and.returnValue();
        const enableUndoRedoSpy = spyOn(service['undoRedoManager'], 'enableUndoRedo').and.returnValue();
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
        expect(nonContiguousColoringSpy).toHaveBeenCalledWith(mouseEventRClick);
        expect(enableUndoRedoSpy).toHaveBeenCalled();
    });

    it('onMouseDown should make mouseDown false if right mouse button is clicked', () => {
        service['undoRedoManager'].undoStack = [];
        service['undoRedoManager'].undoStack.push(new PaintBucketCommandService(service['drawingService']));
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        const mouseEventRClick = {
            offsetX: 75,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 50;
        drawServiceSpy.baseCtx.canvas.height = 50;
        const nonContiguousColoringSpy = spyOn(service, 'nonContiguousColoring').and.returnValue();
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
        expect(nonContiguousColoringSpy).not.toHaveBeenCalledWith(mouseEventRClick);
    });

    it('onMouseDown should not enter any conditions if it does not receive a left or right click', () => {
        service['undoRedoManager'].undoStack = [];
        service['undoRedoManager'].undoStack.push(new PaintBucketCommandService(service['drawingService']));
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        const mouseEventMClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 50;
        drawServiceSpy.baseCtx.canvas.height = 50;
        const contiguousColoringSpy = spyOn(service, 'contiguousColoring').and.returnValue();
        const nonContiguousColoringSpy = spyOn(service, 'nonContiguousColoring').and.returnValue();
        const enableUndoRedoSpy = spyOn(service['undoRedoManager'], 'enableUndoRedo').and.returnValue();
        service.onMouseDown(mouseEventMClick);
        expect(service.mouseDown).toEqual(true);
        expect(contiguousColoringSpy).not.toHaveBeenCalledWith(mouseEventMClick);
        expect(nonContiguousColoringSpy).not.toHaveBeenCalledWith(mouseEventMClick);
        expect(enableUndoRedoSpy).not.toHaveBeenCalled();
    });

    it('matchStartColor should return true if the current pixel is the same color as the starting color', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        service.startingColor = {
            r: 0,
            g: 0,
            b: 0,
            a: 255,
        };
        service.matchStartColor(0);
        expect(service.filledCanvasImage.data[0]).toEqual(service.startingColor.r);
        expect(service.filledCanvasImage.data[1]).toEqual(service.startingColor.g);
        expect(service.filledCanvasImage.data[2]).toEqual(service.startingColor.b);
        expect(service.filledCanvasImage.data[3]).toEqual(service.startingColor.a);
    });

    it('matchStartColor should return true if the current pixel is the same color as the starting color and the tolerance is 0', () => {
        service.tolerancePercentage = 0;
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        service.startingColor = {
            r: 0,
            g: 0,
            b: 0,
            a: 255,
        };
        service.matchStartColor(0);
        expect(service.matchStartColor(0)).toBeTrue();
        expect(service.filledCanvasImage.data[0]).toEqual(service.startingColor.r);
        expect(service.filledCanvasImage.data[1]).toEqual(service.startingColor.g);
        expect(service.filledCanvasImage.data[2]).toEqual(service.startingColor.b);
        expect(service.filledCanvasImage.data[3]).toEqual(service.startingColor.a);
    });

    it('matchStartColor should return true if the current pixel is the same color or in the same range as the starting color and the tolerance is between 1 and 100', () => {
        service.tolerancePercentage = 50;
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        service.startingColor = {
            r: 10,
            g: 10,
            b: 10,
            a: 255,
        };
        service.matchStartColor(0);
        expect(service.matchStartColor(0)).toBeTrue();
        expect(service.filledCanvasImage.data[0]).toEqual(0);
        expect(service.filledCanvasImage.data[1]).toEqual(0);
        expect(service.filledCanvasImage.data[2]).toEqual(0);
        expect(service.filledCanvasImage.data[3]).toEqual(service.startingColor.a);
    });

    it('matchStartColor should return false if the current pixel is not the same color or is not in the same range as the starting color and the tolerance is between 0 and 100', () => {
        service.tolerancePercentage = 1;
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        service.startingColor = {
            r: 255,
            g: 255,
            b: 255,
            a: 255,
        };
        service.matchStartColor(0);
        expect(service.matchStartColor(0)).toBeFalse();
        expect(service.filledCanvasImage.data[0]).not.toEqual(service.startingColor.r);
        expect(service.filledCanvasImage.data[1]).not.toEqual(service.startingColor.g);
        expect(service.filledCanvasImage.data[2]).not.toEqual(service.startingColor.b);
        expect(service.filledCanvasImage.data[3]).toEqual(service.startingColor.a);
    });

    it('matchStartColor should return false if tolerance is not between 0 and 100', () => {
        service.tolerancePercentage = 1000;
        expect(service.matchStartColor(0)).toBeFalse();
    });

    it('nonContiguousColoring should affect its variables', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        drawServiceSpy.baseCtx = dummyCtx;
        const primaryColorOnWhiteBackgroundSpy = spyOn(service, 'primaryColorOnWhiteBackground').and.stub();
        const putImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'putImageData').and.stub();
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        service.nonContiguousColoring(mouseEventRClick);
        expect(service.primaryColorValuesString).toEqual(['0', '0', '0', '1']);
        expect(service.primaryColorValuesNumber).toEqual([0, 0, 0, 255]);
        expect(primaryColorOnWhiteBackgroundSpy).toHaveBeenCalled();
        expect(service.currentPixelPosition).toEqual(30100);
        expect(service.startingColor.r).toEqual(0);
        expect(service.startingColor.g).toEqual(0);
        expect(service.startingColor.b).toEqual(0);
        expect(service.startingColor.a).toEqual(255);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(service.iterator).toEqual(0);
    });

    it('nonContiguousColoring should traverse each pixel of the canvas but it will not call colorPixel if matchStartColor returns false', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        drawServiceSpy.baseCtx = dummyCtx;
        const matchStartColorSpy = spyOn(service, 'matchStartColor').and.returnValue(false);
        const colorPixelSpy = spyOn(service, 'colorPixel').and.stub();
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        service.nonContiguousColoring(mouseEventRClick);
        expect(matchStartColorSpy).toHaveBeenCalledTimes(45000);
        expect(colorPixelSpy).toHaveBeenCalledTimes(0);
    });

    it('nonContiguousColoring should traverse each pixel of the canvas and it will call colorPixel if matchStartColor returns true', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 100, 100);
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        drawServiceSpy.baseCtx = dummyCtx;
        const matchStartColorSpy = spyOn(service, 'matchStartColor').and.returnValue(true);
        const colorPixelSpy = spyOn(service, 'colorPixel').and.stub();
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        service.nonContiguousColoring(mouseEventRClick);
        expect(matchStartColorSpy).toHaveBeenCalledTimes(45000);
        expect(colorPixelSpy).toHaveBeenCalledTimes(45000);
    });

    it('contiguousColoring should call putImageDataSpy and clearSpy when matchFillColor is false', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 5, 5);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 5, 5);
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        drawServiceSpy.baseCtx = dummyCtx;
        const matchFillColorSpy = spyOn(service, 'matchFillColor').and.returnValue(false);
        const putImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'putImageData').and.stub();
        const clearSpy = spyOn(service.visitedPixelPositions, 'clear').and.stub();
        const mouseEventLClick = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        service.contiguousColoring(mouseEventLClick);
        expect(matchFillColorSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('contiguousColoring should call putImageDataSpy and clearSpy when matchFillColor is false', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 5, 5);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 5, 5);
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        drawServiceSpy.baseCtx = dummyCtx;
        const matchFillColorSpy = spyOn(service, 'matchFillColor').and.returnValue(false);
        const putImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'putImageData').and.stub();
        const clearSpy = spyOn(service.visitedPixelPositions, 'clear').and.stub();
        const mouseEventLClick = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        service.contiguousColoring(mouseEventLClick);
        expect(matchFillColorSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('contiguousColoring should call putImageDataSpy and clearSpy when the pixel stack length is  0', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 5, 5);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 5, 5);
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        drawServiceSpy.baseCtx = dummyCtx;
        service.pixelPositionStack = [];
        const matchFillColorSpy = spyOn(service, 'matchFillColor').and.returnValue(false);
        const matchStartColorSpy = spyOn(service, 'matchStartColor').and.returnValue(false);
        const putImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'putImageData').and.stub();
        const clearSpy = spyOn(service.visitedPixelPositions, 'clear').and.stub();
        const mouseEventLClick = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        service.contiguousColoring(mouseEventLClick);
        expect(matchFillColorSpy).toHaveBeenCalled();
        expect(matchStartColorSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('contiguousColoring should call putImageDataSpy and clearSpy when matchStartColor is false and the pixel stack length is more than 0', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 5, 5);
        service.filledCanvasImage = dummyCtx.getImageData(0, 0, 5, 5);
        colorServiceSpy.primaryColor = 'rgba(0,0,0,1)';
        drawServiceSpy.baseCtx = dummyCtx;
        service.pixelPositionStack = [20, 40, 70];
        const matchFillColorSpy = spyOn(service, 'matchFillColor').and.returnValue(false);
        const matchStartColorSpy = spyOn(service, 'matchStartColor').and.returnValue(false);
        const putImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'putImageData').and.stub();
        const clearSpy = spyOn(service.visitedPixelPositions, 'clear').and.stub();
        const mouseEventLClick = {
            offsetX: 1,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        service.contiguousColoring(mouseEventLClick);
        expect(matchFillColorSpy).toHaveBeenCalled();
        expect(matchStartColorSpy).toHaveBeenCalledTimes(4);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });
});

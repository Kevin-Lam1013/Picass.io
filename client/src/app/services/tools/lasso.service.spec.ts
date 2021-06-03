import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LassoService } from './lasso.service';

describe('LassoService', () => {
    let service: LassoService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    // tslint:disable
    // tslint:disable:no-magic-numbers
    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearBackground']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(LassoService);
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseClick should set hasBeenReseted to false when the polygon is closed', () => {
        service.isPolygonClosed = true;
        service.hasBeenReseted = true;
        service.onMouseClick(mouseEvent);
        expect(service.hasBeenReseted).toEqual(false);
    });

    it('onMouseClick should set the startingPoint the mouse coordinates when isStarted is false ', () => {
        service.isPolygonClosed = false;
        service.hasBeenReseted = false;
        service.isStarted = false;
        service.onMouseClick(mouseEvent);
        expect(service.startingPoint).toEqual({ x: 25, y: 25 });
    });

    it('onMouseClick should call detect intersection', () => {
        service.isPolygonClosed = false;
        service.hasBeenReseted = false;
        service.isStarted = true;
        service.startingPoint = { x: 0, y: 0 };
        service['drawingService'].resizeActive = false;
        service.lassoPath = [];
        let intersectionSpy = spyOn(service.lassoHelper, 'detectIntersection').and.returnValue(false);
        service.onMouseClick(mouseEvent);
        expect(intersectionSpy).toHaveBeenCalled();
    });

    it('OnMouseClick should not set the startingPoint when there is an intersection', () => {
        service.isPolygonClosed = false;
        service.hasBeenReseted = false;
        service.isStarted = true;
        service.startingPoint = { x: 0, y: 0 };
        service['drawingService'].resizeActive = false;
        service.lassoPath = [];
        spyOn(service.lassoHelper, 'detectIntersection').and.returnValue(true);
        service.onMouseClick(mouseEvent);
        expect(service.startingPoint).toEqual({ x: 0, y: 0 });
    });

    it('OnMouseClick should not set the startingPoint when resizeIsActive', () => {
        service.isPolygonClosed = false;
        service.hasBeenReseted = false;
        service.isStarted = true;
        service.startingPoint = { x: 0, y: 0 };
        service['drawingService'].resizeActive = true;
        service.lassoPath = [];
        service.onMouseClick(mouseEvent);
        expect(service.startingPoint).toEqual({ x: 0, y: 0 });
    });

    it('if shift is pressed, onMouseclick should call setShiftNonPressed', () => {
        service.isPolygonClosed = false;
        service.hasBeenReseted = false;
        service.isStarted = true;
        service.startingPoint = { x: 0, y: 0 };
        service.shiftIsPressed = true;
        service['drawingService'].resizeActive = true;
        service.lassoPath = [];
        let shiftSpy = spyOn(service, 'setShiftNonPressed').and.returnValue();
        service.onMouseClick(mouseEvent);
        expect(shiftSpy).toHaveBeenCalled();
    });

    it('getImageData should set currentlyselecting to true', () => {
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        spyOn(service.lassoHelper, 'clipRegion').and.returnValue();
        service.getImageData();
        expect(service.currentlySelecting).toBeTrue();
    });

    it('moveImageData should call fixImageData', () => {
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        let fixSpy = spyOn(service.lassoHelper, 'fixImageData').and.returnValue();
        service.moveImageData(0, 0);
        expect(fixSpy).toHaveBeenCalled();
    });

    it('moveImageData should call translateImage when the magnetism is not activated', () => {
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        let translateImageSpy = spyOn(service.lassoHelper, 'translateImage').and.returnValue();
        service.moveImageData(0, 0);
        expect(translateImageSpy).toHaveBeenCalled();
    });

    it('moveImageData should call translateImageWithMagnetism when the magnetism is activated', () => {
        service.magnetismService.isActivated = true;
        service.magnetismService.mouseReference = { x: 5, y: 5 };
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        let translateImageWithMagnetismSpy = spyOn(service.lassoHelper, 'translateImageWithMagnetism').and.returnValue();
        service.moveImageData(0, 0);
        expect(translateImageWithMagnetismSpy).toHaveBeenCalled();
    });

    it('moveImageData should set the correct value for lastPos when the magnetism is not activated', () => {
        service.magnetismService.isActivated = false;
        service.magnetismService.mouseReference = { x: 5, y: 5 };
        service.lastPos = { x: 5, y: 5 };
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        spyOn(service.lassoHelper, 'translateImage').and.returnValue();
        service.moveImageData(0, 0);
        expect(service.lastPos).toEqual({ x: 0, y: 0 });
    });

    it('moveImageData should set the correct for value for mouseReference when the magnetism is activated', () => {
        service.magnetismService.isActivated = true;
        service.magnetismService.mouseReference = { x: 5, y: 5 };
        service.lastPos = { x: 5, y: 5 };
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        spyOn(service.lassoHelper, 'translateImageWithMagnetism').and.returnValue();
        service.moveImageData(1, 1);
        expect(service.magnetismService.mouseReference).toEqual({ x: 6, y: 6 });
    });

    it('onMouseUp should do nothing if the mouse was not down', () => {
        service.mouseDown = false;
        service.endPoint = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
        expect(service.endPoint).toEqual({ x: 0, y: 0 });
    });

    it('onMouseUp should not set the endPoint if hasBeenReseted is true', () => {
        service.mouseDown = true;
        service.hasBeenReseted = true;
        service.endPoint = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
        expect(service.endPoint).toEqual({ x: 0, y: 0 });
    });

    it('onMouseUp should not set the endPoint if the polygon is closed', () => {
        service.mouseDown = true;
        service.isPolygonClosed = true;
        service.endPoint = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
        expect(service.endPoint).toEqual({ x: 0, y: 0 });
    });

    it('onMouseUp should  set the endPoint if the polygon is not closed', () => {
        service.mouseDown = true;
        service.isPolygonClosed = false;
        service.endPoint = { x: 0, y: 0 };
        service.startingPoint = { x: 0, y: 0 };
        spyOn(service, 'drawPath').and.returnValue();
        service.onMouseUp(mouseEvent);
        expect(service.endPoint).toEqual({ x: 25, y: 25 });
    });

    it('onMouseUp should call fixImageData if the image is moving', () => {
        service.mouseDown = true;
        service.isPolygonClosed = true;
        service.isMovingImg = true;
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        let fixSpy = spyOn(service.lassoHelper, 'fixImageData').and.returnValue();
        service.onMouseUp(mouseEvent);
        expect(fixSpy).toHaveBeenCalled();
    });

    it('onMouseMove should set the endPoint when the drawing is started', () => {
        service.isStarted = true;
        spyOn(service, 'drawPath').and.returnValue();
        service.startingPoint = { x: 0, y: 0 };
        service.onMouseMove(mouseEvent);
        expect(service.endPoint).toEqual({ x: 25, y: 25 });
    });

    it('onMouseMove should call closestAnglePoint when shift is pressed', () => {
        service.isStarted = true;
        service.shiftIsPressed = true;
        let angleSpy = spyOn(service.lineHelper, 'closestAngledPoint').and.returnValue({ x: 1, y: 1 });
        spyOn(service, 'drawPath').and.returnValue();
        service.startingPoint = { x: 0, y: 0 };
        service.onMouseMove(mouseEvent);
        expect(service.endPoint).toEqual({ x: 1, y: 1 });
        expect(angleSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call moveAnchor', () => {
        service.isStarted = false;
        service.mouseDown = true;
        service.changeAnchor = true;
        let moveAnchorSpy = spyOn(service, 'moveAnchor').and.returnValue();
        service.onMouseMove(mouseEvent);
        expect(moveAnchorSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call moveImageData', () => {
        service.isStarted = false;
        service.mouseDown = true;
        service.isPolygonClosed = true;
        service.isMovingImg = true;
        let moveImageSpy = spyOn(service, 'moveImageData').and.returnValue();
        service.onMouseMove(mouseEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call moveImageData and dispatch when the magnetism is activated', () => {
        service.magnetismService.isActivated = true;
        service.isStarted = false;
        service.mouseDown = true;
        service.isPolygonClosed = true;
        service.isMovingImg = true;
        let moveImageSpy = spyOn(service, 'moveImageData').and.returnValue();
        let dispatchSpy = spyOn(service.magnetismService, 'dispatch').and.returnValue({ x: 1, y: 3 });
        service.onMouseMove(mouseEvent);
        expect(moveImageSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('drawPath should call moveTo', () => {
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.isPolygonClosed = false;
        let moveToSpy = spyOn(previewCtxStub, 'lineTo').and.stub();
        let lineToSpy = spyOn(previewCtxStub, 'moveTo').and.stub();
        service.drawPath(
            previewCtxStub,
            [
                { x: 10, y: 10 },
                { x: 20, y: 15 },
            ],
            'black',
        );
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('drawPath should call moveTo', () => {
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.isPolygonClosed = false;
        let moveToSpy = spyOn(previewCtxStub, 'lineTo').and.stub();
        let lineToSpy = spyOn(previewCtxStub, 'moveTo').and.stub();
        service.drawPath(
            previewCtxStub,
            [
                { x: 10, y: 10 },
                { x: 20, y: 15 },
            ],
            'black',
        );
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('drawPath should call drawAnchor point when the the polygon is closed', () => {
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.isPolygonClosed = true;
        service.dimensions = [1, 1];
        let drawAnchorSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        service.drawPath(
            previewCtxStub,
            [
                { x: 10, y: 10 },
                { x: 20, y: 15 },
            ],
            'black',
        );
        expect(drawAnchorSpy).toHaveBeenCalled();
    });

    it('setShiftIsPressed should put blockOnshift to false', () => {
        service.isStarted = false;
        service.setShiftIsPressed();
        expect(service.blockOnShift).toBeFalse();
    });

    it('setShiftIsPressed should call shiftAngleCalculator', () => {
        service.isStarted = true;
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 25, y: 25 };
        let shiftAngleSpy = spyOn(service.lineHelper, 'shiftAngleCalculator').and.returnValue(false);
        service.setShiftIsPressed();
        expect(shiftAngleSpy).toHaveBeenCalled();
    });

    it('setShiftNonPressed should put blockOnshift to false when the key is shift', () => {
        let event = { key: 'Shift' } as KeyboardEvent;
        service.isStarted = false;
        service.setShiftNonPressed(event);
        expect(service.blockOnShift).toBeFalse();
    });

    it('setShiftNonPressed should call clearcanvas when the drawing is started', () => {
        let event = { key: 'Shift' } as KeyboardEvent;
        service.isStarted = true;
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 25, y: 25 };
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.setShiftNonPressed(event);
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
    });

    it('setShiftNonPressed shouldnt put blockOnshift to false when the key isnt shift', () => {
        let event = { key: 'Le J c le S' } as KeyboardEvent;
        service.isStarted = false;
        service.setShiftNonPressed(event);
        expect(service.blockOnShift).not.toBeFalse();
    });

    it('onEscape should put isStarted to false', () => {
        service.isStarted = true;
        service.onEscape();
        expect(service.isStarted).toBeFalse();
    });

    it('onBackSpace should call clearCanvas when the path is not empty', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 25, y: 25 };
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.onBackSpace();
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
    });

    it('onBackSpace should not call clearCanvas when the path isempty', () => {
        service.lassoPath = [];
        service.onBackSpace();
        expect(service['drawingService'].clearCanvas).not.toHaveBeenCalled();
    });

    it('onMouseDown should set isMovingImg to false when the mouse is not down', () => {
        service.mouseDown = false;
        service.isMovingImg = true;
        service.onMouseDown(mouseEvent);
        expect(service.isMovingImg).toBeFalse();
    });

    it('onMouseDown should put changeAnchor to true when you click on an Anchor', () => {
        service.mouseDown = true;
        service.isPolygonClosed = true;
        spyOn(service, 'checkIfClickOnAnchor').and.returnValue(true);
        service.onMouseDown(mouseEvent);
        expect(service.changeAnchor).toBeTrue();
    });

    it('onMouseDown should put isPolygonClosed to false when you click outside of it', () => {
        service.mouseDown = true;
        service.isPolygonClosed = true;
        spyOn(service, 'checkIfClickOnAnchor').and.returnValue(false);
        spyOn(service.lassoHelper, 'isInsidePolygon').and.returnValue(false);
        service.onMouseDown(mouseEvent);
        expect(service.isPolygonClosed).toBeFalse();
    });

    it('onMouseDown should call getImageData when were not selecting', () => {
        service.mouseDown = true;
        service.isPolygonClosed = true;
        spyOn(service, 'checkIfClickOnAnchor').and.returnValue(false);
        spyOn(service.lassoHelper, 'isInsidePolygon').and.returnValue(true);
        spyOn(service.lassoHelper, 'fixImageData').and.returnValue();
        let getImageDataSpy = spyOn(service, 'getImageData').and.returnValue(new ImageData(100, 100));
        service.onMouseDown(mouseEvent);
        expect(getImageDataSpy).toHaveBeenCalled();
    });

    it('onMouseDown should set lastPos', () => {
        service.mouseDown = true;
        service.isPolygonClosed = true;
        service.currentlySelecting = true;
        spyOn(service, 'checkIfClickOnAnchor').and.returnValue(false);
        spyOn(service.lassoHelper, 'isInsidePolygon').and.returnValue(true);
        spyOn(service.lassoHelper, 'fixImageData').and.returnValue();
        service.onMouseDown(mouseEvent);
        expect(service.lastPos).toEqual({ x: 25, y: 25 });
    });

    it('checkifClickOnAnchor should return false when you dont click on an Anchor', () => {
        service.anchorPoints = [
            { x: 0, y: 0 },
            { x: 2, y: 2 },
        ];
        spyOn(service.lineHelper, 'distanceUtil').and.returnValue(20);
        expect(service.checkIfClickOnAnchor(mouseEvent)).toEqual(false);
    });

    it('checkifClickOnAnchor should return true when you click on an Anchor', () => {
        service.anchorPoints = [
            { x: 0, y: 0 },
            { x: 2, y: 2 },
        ];
        spyOn(service.lineHelper, 'distanceUtil').and.returnValue(9);
        expect(service.checkIfClickOnAnchor(mouseEvent)).toEqual(true);
    });

    it('resize selection should get the backround when were not currently selecting', () => {
        service.currentlySelecting = false;
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 20, y: 15 },
        ];
        service.imageData = new ImageData(100, 100);
        service.resizeSelection(mouseEvent);
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
    });

    it('resize selection should call scale', async (done) => {
        service.currentlySelecting = true;
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        service.currentLine = [
            { x: 20, y: 15 },
            { x: 10, y: 10 },
        ];
        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        let scaleSpy = spyOn(service['drawingService'].baseCtx, 'scale');
        service.resizeSelection(mouseEvent);
        setTimeout(() => {
            expect(scaleSpy).toHaveBeenCalled();
            done();
        }, 500);
    });

    it('deleteSelection should call clipRegion and getImageData once', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        const clipRegionSpy = spyOn(service.lassoHelper, 'clipRegion').and.returnValue();
        const getImageSpy = spyOn(service, 'getImageData').and.returnValue(new ImageData(2, 3));
        service.deleteSelection();
        expect(clipRegionSpy).toHaveBeenCalled();
        expect(getImageSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call getImageData when the clipboard is not empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.imageData = new ImageData(5, 8);
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(5, 8);
        spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        service.pasteSelection();
        expect(baseCtxStub.getImageData).toHaveBeenCalled();
    });

    it('pasteSelection should call putImageData two times when the clipboard is not empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.imageData = new ImageData(5, 8);
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(5, 8);
        spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        const putImageDataSpy = spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(putImageDataSpy).toHaveBeenCalledTimes(2);
    });

    it('pasteSelection should call clearCanvas when the clipboard is not empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.imageData = new ImageData(5, 8);
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(5, 8);
        spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('pasteSelection should call translatePathForPaste when the clipboard is not empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.imageData = new ImageData(5, 8);
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(5, 8);
        spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        const translatePathForPasteSpy = spyOn(service.lassoHelper, 'translatePathForPaste').and.returnValue();
        service.pasteSelection();
        expect(translatePathForPasteSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call translatePathForPaste when the clipboard is not empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.imageData = new ImageData(5, 8);
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(5, 8);
        spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        spyOn(service.lassoHelper, 'translatePathForPaste').and.returnValue();
        service.pasteSelection();
        expect(drawAnchorPointsSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call drawPath three time when the lassoPath have three path and when the clipboard is not empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
        ];
        service.imageData = new ImageData(5, 8);
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(5, 8);
        const drawLineSpy = spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        spyOn(service.lassoHelper, 'translatePathForPaste').and.returnValue();
        service.pasteSelection();
        expect(drawLineSpy).toHaveBeenCalledTimes(3);
    });

    it('pasteSelection should set the currentLine to the left top corner of the canvas when the clipboard is not empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        spyOn(service.lassoHelper, 'translatePathForPaste').and.returnValue();
        const resultCurrentLine: Vec2[] = [
            { x: 0, y: 0 },
            { x: service.clipboardService.copy.width, y: service.clipboardService.copy.height },
        ];
        service.pasteSelection();
        for (let i = 0; i < resultCurrentLine.length; i++) {
            expect(service.currentLine[i].x).toEqual(resultCurrentLine[i].x);
            expect(service.currentLine[i].y).toEqual(resultCurrentLine[i].y);
        }
    });

    it('pasteSelection should set the imageData equal to copy when the clipboard is not empty ', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawPath').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        spyOn(service.lassoHelper, 'translatePathForPaste').and.returnValue();
        service.pasteSelection();
        expect(service.imageData.height).toEqual(service.clipboardService.copy.height);
        expect(service.imageData.width).toEqual(service.clipboardService.copy.width);
        expect(service.imageData.data).toEqual(service.clipboardService.copy.data);
    });

    it('pasteSelection should do and call nothing when the clipboard is empty', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.clipboardService.alreadyCopied = false;
        service.clipboardService.copy = new ImageData(2, 3);
        const drawPathSpy = spyOn(service, 'drawPath').and.returnValue();
        const getImageDataSpy = spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.returnValue();
        const putImageDataSpy = spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        const translatePathForPasteSpy = spyOn(service.lassoHelper, 'translatePathForPaste').and.returnValue();
        service.pasteSelection();
        expect(drawPathSpy).not.toHaveBeenCalled();
        expect(getImageDataSpy).not.toHaveBeenCalled();
        expect(drawAnchorPointsSpy).not.toHaveBeenCalled();
        expect(putImageDataSpy).not.toHaveBeenCalled();
        expect(translatePathForPasteSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });
    it('onMouseClick should isStarted to false when you close the polygon', () => {
        service.isPolygonClosed = false;
        service.isStarted = true;
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
        ];
        spyOn(service.lineHelper, 'pixelDistanceUtil').and.returnValue(true);
        service.endPoint = { x: 0, y: 0 };
        service.startingPoint = { x: 1, y: 1 };
        spyOn(service.lassoHelper, 'updateRectangle').and.returnValue([1, 2]);
        spyOn(service, 'getImageData').and.returnValue(new ImageData(1, 2));
        service.onMouseClick(mouseEvent);
        expect(service.isStarted).toEqual(false);
    });

    it('onMouseUp should call 3 times drawPath when the lassoPath has 3 lines and polygone is not closed', () => {
        let drawLineSpy = spyOn(service, 'drawPath').and.returnValue();
        service.mouseDown = true;
        service.isPolygonClosed = true;
        service.isMovingImg = false;
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
        ];
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalledTimes(3);
    });

    it('onMouseMove should call 3 times drawPath when lassoPath has 3 lines + 1 extra for the preview', () => {
        service.isStarted = true;
        service.shiftIsPressed = false;
        service.mouseDown = false;
        service.endPoint = { x: 0, y: 0 };
        service.startingPoint = { x: 1, y: 1 };
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
        ];
        let drawPathSpy = spyOn(service, 'drawPath').and.returnValue();
        service.onMouseMove(mouseEvent);
        expect(drawPathSpy).toHaveBeenCalledTimes(4);
    });

    it('setShiftIsPressed should call 3 time drawPath when lassoPath has 3 lines and 1 more time for the preview', () => {
        service.isStarted = true;
        spyOn(service.lineHelper, 'shiftAngleCalculator').and.returnValue(false);
        spyOn(window, 'removeEventListener').and.returnValue();
        service.endPoint = { x: 0, y: 0 };
        service.startingPoint = { x: 1, y: 1 };
        service.lassoPath = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
        ];
        let drawPathSpy = spyOn(service, 'drawPath').and.returnValue();
        service.setShiftIsPressed();
        expect(drawPathSpy).toHaveBeenCalledTimes(4);
    });
});

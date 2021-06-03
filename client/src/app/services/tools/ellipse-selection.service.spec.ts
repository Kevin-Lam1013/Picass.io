import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseSelectionService } from '@app/services/tools/ellipse-selection.service';

describe('EllipseSelectionService', () => {
    let service: EllipseSelectionService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mockStartingPoint: Vec2;
    let mockEndingPoint: Vec2;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearBackground']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(EllipseSelectionService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mockStartingPoint = { x: -50, y: -50 };
        mockEndingPoint = { x: 1, y: 1 };

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should call disableUndoRedo', () => {
        service.mouseDown = false;
        const disableUndoRedoSpy = spyOn(service.undoRedoManager, 'disableUndoRedo');
        service.onMouseDown(mouseEvent);
        expect(disableUndoRedoSpy).toHaveBeenCalled();
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('mouseDown should call getABHKXaxis if currentline length > 0', () => {
        const getABHKXaxisSpy = spyOn(service.selecHelper, 'getABHKXaxis').and.callThrough();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.anchorPoints = [];
        service.onMouseDown(mouseEvent);
        expect(getABHKXaxisSpy).toHaveBeenCalled();
    });

    it('mouseDown shouldnt call getABHKXaxis if currentline length <= 0', () => {
        const getABHKXaxisSpy = spyOn(service.selecHelper, 'getABHKXaxis').and.stub();
        service.currentLine = [];
        service.anchorPoints = [];
        service.onMouseDown(mouseEvent);
        expect(getABHKXaxisSpy).not.toHaveBeenCalled();
    });

    it('mouseDown should call resetState and set isMovingImg as false if checkIfInsideEllipse returns false', () => {
        const resetStateSpy = spyOn(service, 'resetState').and.stub();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.anchorPoints = [];
        service.isMovingImg = true;
        service.onMouseDown(mouseEvent);
        expect(resetStateSpy).toHaveBeenCalled();
        expect(service.isMovingImg).toBeFalse();
    });

    it('mouseDown shouldnt call resetState if checkIfInsideEllipse returns true', () => {
        const resetStateSpy = spyOn(service, 'resetState').and.stub();
        mockEndingPoint = { x: 30, y: 30 };
        service.startingPoint = mockStartingPoint;
        service.endPoint = mockEndingPoint;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.anchorPoints = [];
        mouseEvent = {
            offsetX: 0,
            offsetY: 0,
            button: 0,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(resetStateSpy).not.toHaveBeenCalled();
    });

    it('mouseDown should set isMovingImg as false if currentLine length <= 0', () => {
        service.isMovingImg = true;
        service.onMouseDown(mouseEvent);
        expect(service.isMovingImg).toBeFalse();
    });

    it('mouseDown should set mouseDownCoord as the position of the mouseDownEvent', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(service.getPositionFromMouse(mouseEvent));
    });

    it('mouseDown should set changeAnchor as true if click is on anchor', () => {
        service.anchorPoints = [{ x: 25, y: 25 }];
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.changeAnchor = false;
        service.onMouseDown(mouseEvent);
        expect(service.changeAnchor).toBeTrue();
    });

    it('setShiftIsPressed does nothing if the key isnt shift', () => {
        const wrongEvent = new KeyboardEvent('keydown', { key: 'A' });
        service.shiftIsPressed = false;
        service.setShiftIsPressed(wrongEvent);
        expect(service.shiftIsPressed).toBeFalse();
    });

    it('setShiftPressed should have called both drawEllipse and drawRectangle if checkIsSquare returns false and mouseDown is true', () => {
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.mouseDown = true;
        service.currentLine = [
            { x: 1, y: 5 },
            { x: 5, y: 5 },
        ];

        service.setShiftIsPressed(event);
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });
    it('setShiftPressed shouldnt have called both drawEllipse and drawRectangle if checkIsSquare returns true', () => {
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        service.squareHelperService.checkIfIsSquare = () => {
            return true;
        };
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 5, y: 5 };

        service.setShiftIsPressed(event);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('setShiftNonPressed sets shiftIsPressed false', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.mouseDown = false;
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.setShiftNonPressed(event);
        expect(service.shiftIsPressed).toEqual(false);
    });

    it('setShiftNonPressed sets shiftIsPressed to false when mouseDown is false', () => {
        service.mouseDown = false;
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.setShiftNonPressed(event);
        expect(service.shiftIsPressed).toEqual(false);
    });

    it('setShiftNonPressed calls clearCanvas, drawEllipse and drawRectangle if mouseDown is true', () => {
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.mouseDown = true;
        service.setShiftNonPressed(event);

        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('setShiftNonPressed doesnt call drawEllipse and drawRectangle if mouseDown is false', () => {
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.mouseDown = false;
        service.setShiftNonPressed(event);

        expect(drawEllipseSpy).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('setShiftNonPressed does nothing if key isnt Shift', () => {
        const event = new KeyboardEvent('keydown', { key: 'A' });
        service.shiftIsPressed = true;
        service.setShiftNonPressed(event);
        expect(service.shiftIsPressed).toBeTrue();
    });

    it('setShiftNonPressed should call moveAnchor if changeAnchor is true', () => {
        const moveAnchorSpy = spyOn(service, 'moveAnchor').and.callThrough();
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);

        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.currentMousePos = mockEndingPoint;
        service.mouseDown = true;
        service.changeAnchor = true;
        service.setShiftNonPressed(event);
        expect(moveAnchorSpy).toHaveBeenCalled();
    });

    it('getImageData should call baseCtx.getImageData twice, drawEllipse once and set currentlySelecting as true', () => {
        const getImageDataSpy = spyOn(service.drawingService.baseCtx, 'getImageData').and.callThrough();
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();

        service.currentLine = [{ x: 2, y: 2 }, mockEndingPoint];
        service.currentlySelecting = false;
        service.getImageData();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(service.currentlySelecting).toBeTrue();
    });

    it('moveImageData should call clearCanvas twice', () => {
        service.currentLine = [{ x: 2, y: 2 }, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledTimes(2);
    });

    it('moveImageData should correctly set currentLine when the magnetism is not activated', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(service.currentLine).toEqual([
            { x: -49, y: -49 },
            { x: 2, y: 2 },
        ]);
    });

    it('moveImageData should correctly set currentLine when the magnetism is not activated', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(service.currentLine).toEqual([
            { x: -49, y: -49 },
            { x: 2, y: 2 },
        ]);
    });

    it('moveImageData should correctly set currentLine when the magnetism is activated', () => {
        service.magnetismService.isActivated = true;
        service.magnetismService.mouseReference = { x: 5, y: 5 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(service.currentLine).toEqual([
            { x: -49, y: -49 },
            { x: 2, y: 2 },
        ]);
    });

    it('moveImageData should correctly set lastPos when the magnetism is activated', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.magnetismService.isActivated = true;
        service.magnetismService.mouseReference = { x: 5, y: 5 };
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(service.magnetismService.mouseReference).toEqual({ x: 6, y: 6 });
    });

    it('moveImageData should correctly set mouseReference when the magnetism is not activated', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(service.lastPos).toEqual({ x: 1, y: 1 });
    });

    it(`moveImageData should call drawRectangle, drawAnchorPoints, drawEllipse
  ,fixImageData and putImageData twice`, () => {
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        const fixImageDataSpy = spyOn(service, 'fixImageData').and.stub();
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(drawAnchorPointsSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalledTimes(2);
        expect(fixImageDataSpy).toHaveBeenCalled();
    });

    it('onMouseUp should do nothing if mouseDown is false or resizeActive is true', () => {
        service.mouseDown = false;
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
        service.mouseDown = true;
        service.drawingService.resizeActive = true;
        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it(' mouseUp should call enableUndoRedo', () => {
        service.mouseDown = true;
        service['drawingService'].resizeActive = false;
        const enableUndoRedoSpy = spyOn(service.undoRedoManager, 'enableUndoRedo');
        service.mouseDownCoord = { x: 0, y: 0 };
        service.startingPoint = mockStartingPoint;
        service.endPoint = mockEndingPoint;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.onMouseUp(mouseEvent);
        expect(enableUndoRedoSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set mouseDown as false if it was true', () => {
        service.mouseDown = true;
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        service.mouseDownCoord = { x: 0, y: 0 };
        service.startingPoint = mockStartingPoint;
        service.endPoint = mockEndingPoint;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set hasBeenReseted as false if it was true and return', () => {
        service.mouseDown = true;
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        service.hasBeenReseted = true;
        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should call fixImageData and return if isMovingImg is true', () => {
        service.mouseDown = true;
        const fixCurrentLineSpy = spyOn(service, 'fixCurrentLine').and.callThrough();
        const fixImageDataSpy = spyOn(service, 'fixImageData').and.stub();
        service.currentlySelecting = true;
        service.isMovingImg = true;
        service.imageData = new ImageData(100, 100);
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseUp(mouseEvent);
        expect(fixImageDataSpy).toHaveBeenCalled();
        expect(fixCurrentLineSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should set endPoint as mousePosition if shiftIsPressed is false', () => {
        service.mouseDown = true;
        service.imageData = new ImageData(100, 100);
        service.startingPoint = mockStartingPoint;
        service.endPoint = mockEndingPoint;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseUp(mouseEvent);
        expect(service.endPoint).toEqual(service.getPositionFromMouse(mouseEvent));
    });

    it(`onMouseUp should call clearCanvas, fixCurrentLine, drawRectangle, 
    drawAnchorPoint and drawEllipse`, () => {
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        const fixCurrentLineSpy = spyOn(service, 'fixCurrentLine').and.callThrough();
        service.mouseDown = true;
        service.currentlySelecting = true;
        service.shiftIsPressed = true;
        service.currentLine = [
            { x: 10, y: 10 },
            { x: 5, y: 5 },
        ];
        service.onMouseUp(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(drawAnchorPointsSpy).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(fixCurrentLineSpy).toHaveBeenCalled();
    });

    it('onMouseUp shouldnt call getPositionFromMouse if shiftIsPressed is true', () => {
        service.mouseDown = true;
        service.shiftIsPressed = true;
        service.startingPoint = mockStartingPoint;
        service.endPoint = mockEndingPoint;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.onMouseUp(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should set changeAnchor as false, call setImageData, fixCurrentLine and getPositionFromMouse if changeAnchor is true', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        const setImageDataSpy = spyOn(service, 'setImageData').and.stub();
        const fixCurrentLineSpy = spyOn(service, 'fixCurrentLine').and.stub();
        service.changeAnchor = true;
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(setImageDataSpy).toHaveBeenCalled();
        expect(fixCurrentLineSpy).toHaveBeenCalled();
        expect(service.changeAnchor).toBeFalse();
    });

    it('onShift sets isShiftPressed true', () => {
        service.shiftIsPressed = false;
        service.onShift();
        expect(service.shiftIsPressed).toEqual(true);
    });

    it('onShift doesnt add event listeners if isShiftPressed is true', () => {
        service.shiftIsPressed = true;
        const eventListenerSpy = spyOn(window, 'addEventListener').and.stub();
        service.onShift();
        expect(eventListenerSpy).not.toHaveBeenCalled();
    });

    it('fixImageData should call checkIfInsideEllipse for every pixel in the currentLine selection', () => {
        const checkIfInsideEllipseSpy = spyOn(service.selecHelper, 'checkIfInsideEllipse').and.stub();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.imageData = new ImageData(100, 100);
        const numberOfTimes: number = -51 * -51;
        service.fixImageData();
        expect(checkIfInsideEllipseSpy).toHaveBeenCalledTimes(numberOfTimes);
    });

    it('fixImageData should call getABHKXaxis', () => {
        const getABHKXaxisSpy = spyOn(service.selecHelper, 'getABHKXaxis').and.callThrough();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.imageData = new ImageData(100, 100);
        service.fixImageData();
        expect(getABHKXaxisSpy).toHaveBeenCalled();
    });

    it(`onMouseMove should do nothing if mouseDown is false or resizeActive is true or hasBeenReseted is true`, () => {
        service.mouseDown = false;
        drawServiceSpy.resizeActive = false;
        service.hasBeenReseted = false;
        service.isMovingImg = false;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse');
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
        service.mouseDown = true;
        drawServiceSpy.resizeActive = true;
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
        drawServiceSpy.resizeActive = false;
        service.hasBeenReseted = true;
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call moveImageData if mouseDown is true, isMovingImg is true and the magnetism is not activated', () => {
        service.mouseDown = true;
        service.isMovingImg = true;
        const moveImageDataSpy = spyOn(service, 'moveImageData').and.stub();
        service.onMouseMove(mouseEvent);
        expect(moveImageDataSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call moveImageData and dispatch if mouseDown is true, isMovingImg is true and the magnetism is activated', () => {
        service.magnetismService.isActivated = true;
        service.mouseDown = true;
        service.isMovingImg = true;
        const moveImageDataSpy = spyOn(service, 'moveImageData').and.stub();
        const dispatchSpy = spyOn(service.magnetismService, 'dispatch').and.returnValue({ x: 0, y: 0 });
        service.onMouseMove(mouseEvent);
        expect(moveImageDataSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('onMouseMove shouldnt call moveImageData if mouseDown is true and isMovingImg is false', () => {
        service.mouseDown = true;
        service.isMovingImg = false;
        const moveImageDataSpy = spyOn(service, 'moveImageData').and.stub();
        service.startingPoint = mockStartingPoint;
        service.endPoint = mockEndingPoint;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseMove(mouseEvent);
        expect(moveImageDataSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call closestSquare if shiftIsPressed is true', () => {
        service.mouseDown = true;
        service.shiftIsPressed = true;
        const closestSquareSpy = spyOn(service.squareHelperService, 'closestSquare').and.callThrough();
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseMove(mouseEvent);
        expect(closestSquareSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call clearCanvas, drawRectangle and drawEllipse if isMovingImg is false', () => {
        service.mouseDown = true;
        service.isMovingImg = false;
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseMove(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMouseMove should call moveAnchor if changeAnchor is true', () => {
        service.mouseDown = true;
        service.changeAnchor = true;
        const moveAnchorSpy = spyOn(service, 'moveAnchor').and.stub();
        service.onMouseMove(mouseEvent);
        expect(moveAnchorSpy).toHaveBeenCalled();
    });

    it('drawAnchorPoints should call beginPath,fill and arc 8 times', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.anchorPoints = [];
        const beginPathSpy = spyOn(drawServiceSpy.baseCtx, 'beginPath').and.stub();
        const fillSpy = spyOn(drawServiceSpy.baseCtx, 'fill').and.stub();
        const arcSpy = spyOn(drawServiceSpy.baseCtx, 'arc').and.stub();
        service.drawAnchorPoints(drawServiceSpy.baseCtx, service.currentLine);
        expect(beginPathSpy).toHaveBeenCalledTimes(8);
        expect(fillSpy).toHaveBeenCalledTimes(8);
        expect(arcSpy).toHaveBeenCalledTimes(8);
    });

    it('drawAnchorPoints should correctly set the anchorPoints', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.anchorPoints = [];
        const expectedResult: Vec2[] = [
            mockStartingPoint,
            { x: -24.5, y: mockStartingPoint.y },
            { x: mockEndingPoint.x, y: mockStartingPoint.y },
            { x: mockEndingPoint.x, y: -24.5 },
            mockEndingPoint,
            { x: -24.5, y: mockEndingPoint.y },
            { x: mockStartingPoint.x, y: mockEndingPoint.y },
            { x: mockStartingPoint.x, y: -24.5 },
        ];
        service.drawAnchorPoints(drawServiceSpy.baseCtx, service.currentLine);
        expect(service.anchorPoints).toEqual(expectedResult);
    });

    it('drawRectangle should call strokeRect and closePath', () => {
        const strokeRectSpy = spyOn(drawServiceSpy.baseCtx, 'strokeRect').and.stub();
        const closePathSpy = spyOn(drawServiceSpy.baseCtx, 'closePath').and.stub();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.drawRectangle(drawServiceSpy.baseCtx, service.currentLine);
        expect(closePathSpy).toHaveBeenCalled();
        expect(strokeRectSpy).toHaveBeenCalled();
    });

    it('drawEllipse should call arc if shiftIsPressed is true', () => {
        service.shiftIsPressed = true;
        const arcSpy = spyOn(drawServiceSpy.baseCtx, 'arc').and.stub();
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.drawEllipse(drawServiceSpy.baseCtx, mockStartingPoint, mockEndingPoint, false);
        expect(arcSpy).toHaveBeenCalled();
    });
    it('drawEllipse should call ellipse if shiftIsPressed is false', () => {
        service.shiftIsPressed = false;
        const ellipseSpy = spyOn(drawServiceSpy.baseCtx, 'ellipse').and.stub();
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.drawEllipse(drawServiceSpy.baseCtx, mockStartingPoint, mockEndingPoint, false);
        expect(ellipseSpy).toHaveBeenCalled();
    });

    it('drawEllipse should call fill if erase is true', () => {
        service.shiftIsPressed = false;
        const fillSpy = spyOn(drawServiceSpy.baseCtx, 'fill').and.stub();
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.drawEllipse(drawServiceSpy.baseCtx, mockStartingPoint, mockEndingPoint, true);
        expect(fillSpy).toHaveBeenCalled();
    });

    it(`move functions should correctly set the offset`, () => {
        service.lastPos = { x: 0, y: 0 };
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.offsetYModifier = 0;
        service.offsetXModifier = 0;
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        const waitTimerSpy = spyOn(service, 'waitTimer').and.stub();

        service.moveUp();
        expect(service.offsetYModifier).toEqual(-3);

        service.moveDown();
        expect(service.offsetYModifier).toEqual(0);

        service.moveLeft();
        expect(service.offsetXModifier).toEqual(-3);

        service.moveRight();
        expect(service.offsetXModifier).toEqual(0);

        expect(waitTimerSpy).toHaveBeenCalledTimes(4);
    });

    it('arrow keys detection shouldnt be executed twice if there wasnt a keyup event', () => {
        service.lastPos = { x: 0, y: 0 };
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.offsetYModifier = 0;
        service.offsetXModifier = 0;
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);

        service.moveUp();
        service.moveUp();
        expect(service.offsetYModifier).toEqual(-3);

        service.moveDown();
        service.moveDown();
        expect(service.offsetYModifier).toEqual(0);

        service.moveLeft();
        service.moveLeft();
        expect(service.offsetXModifier).toEqual(-3);

        service.moveRight();
        service.moveRight();
        expect(service.offsetXModifier).toEqual(0);
    });

    it('move fonctions should call magnetism handlers if magnetismService is activated', () => {
        service.lastPos = { x: 0, y: 0 };
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.magnetismService.mouseReference = { x: 0, y: 0 };
        service.offsetYModifier = 0;
        service.offsetXModifier = 0;
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.magnetismService.isActivated = true;
        const moveRightHandlerSPy = spyOn(service.magnetismService, 'moveRightHandler').and.returnValue({ x: 0, y: 0 });
        const moveLeftHandlerSPy = spyOn(service.magnetismService, 'moveLeftHandler').and.returnValue({ x: 0, y: 0 });
        const moveUpHandlerSPy = spyOn(service.magnetismService, 'moveUpHandler').and.returnValue({ x: 0, y: 0 });
        const moveDownHandlerSPy = spyOn(service.magnetismService, 'moveDownHandler').and.returnValue({ x: 0, y: 0 });

        service.moveUp();
        expect(moveUpHandlerSPy).toHaveBeenCalled();

        service.moveDown();
        expect(moveDownHandlerSPy).toHaveBeenCalled();

        service.moveLeft();
        expect(moveLeftHandlerSPy).toHaveBeenCalled();

        service.moveRight();
        expect(moveRightHandlerSPy).toHaveBeenCalled();
    });

    it('resizeSelection should call clearCanvas twice', () => {
        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.resizeSelection(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledTimes(2);
    });

    it('resizeSelection should call drawEllipse, drawAnchorPoints and drawRectangle', () => {
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.stub();
        const drawAnchorPointSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();

        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        service.currentLine = [{ x: 2, y: 2 }, mockEndingPoint];
        service.resizeSelection(mouseEvent);
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawAnchorPointSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('keyUpHandler should correctly set the offsetModifier and arrowCheck', () => {
        const mockArrowDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        const mockArrowUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        const mockArrowLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        const mockArrowRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });

        service.downArrowCheck = true;
        service.upArrowCheck = true;
        service.leftArrowCheck = true;
        service.rightArrowCheck = true;

        service.keyupHandler(mockArrowDown);
        expect(service.offsetYModifier).toEqual(-3);
        expect(service.downArrowCheck).toBeFalse();

        service.keyupHandler(mockArrowUp);
        expect(service.offsetYModifier).toEqual(0);
        expect(service.upArrowCheck).toBeFalse();

        service.keyupHandler(mockArrowLeft);
        expect(service.offsetXModifier).toEqual(3);
        expect(service.leftArrowCheck).toBeFalse();

        service.keyupHandler(mockArrowRight);
        expect(service.offsetYModifier).toEqual(0);
        expect(service.rightArrowCheck).toBeFalse();
    });

    it('moveAnchor should call sendAnchorData, moveAnchor, getAnchorData and resizeSelection', () => {
        const sendAnchorDataSpy = spyOn(service, 'sendAnchorData').and.stub();
        const moveAnchorSpy = spyOn(service.anchorService, 'moveAnchor').and.stub();
        const getAnchorDataSpy = spyOn(service, 'getAnchorData').and.stub();
        const resizeSelectionSpy = spyOn(service, 'resizeSelection').and.stub();

        service.moveAnchor(mouseEvent);
        expect(sendAnchorDataSpy).toHaveBeenCalled();
        expect(moveAnchorSpy).toHaveBeenCalled();
        expect(getAnchorDataSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('deleteSelection should call drawEllipse and getImageData once', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.returnValue();
        const getImageSpy = spyOn(service, 'getImageData').and.returnValue(new ImageData(2, 3));
        service.deleteSelection();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(getImageSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call drawEllipse once when the clipboard is not empty', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.currentLine = [{ x: 0, y: 0 }];
        service.endPoint = { x: 1, y: 1 };
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        service.pasteSelection();
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call getImageData when the clipboard is not empty ', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.currentLine = [{ x: 0, y: 0 }];
        service.endPoint = { x: 1, y: 1 };
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawEllipse').and.returnValue();
        const getImageDataSpy = spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        service.pasteSelection();
        expect(getImageDataSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call drawRectangle and drawAnchorPoints when the clipboard is not empty', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.currentLine = [{ x: 0, y: 0 }];
        service.endPoint = { x: 1, y: 1 };
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawEllipse').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.returnValue();
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.returnValue();
        service.pasteSelection();
        expect(drawRectangleSpy).toHaveBeenCalled();
        expect(drawAnchorPointsSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call putImageData when the clipboad is not empty', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.currentLine = [{ x: 0, y: 0 }];
        service.endPoint = { x: 1, y: 1 };
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawEllipse').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        const putImageDataSpy = spyOn(service.drawingService.previewCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call clearCanvas when the clipboard is not empty', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.currentLine = [{ x: 0, y: 0 }];
        service.endPoint = { x: 1, y: 1 };
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawEllipse').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('pasteSelection should do and call nothing when the clipboard is empty', () => {
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.clipboardService.alreadyCopied = false;
        service.clipboardService.copy = new ImageData(2, 3);
        const drawEllipseSpy = spyOn(service, 'drawEllipse').and.returnValue();
        const getImageDataSpy = spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.returnValue();
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.returnValue();
        const putImageDataSpy = spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(putImageDataSpy).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawAnchorPointsSpy).not.toHaveBeenCalled();
        expect(getImageDataSpy).not.toHaveBeenCalled();
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it('pasteSelection should set the currentLine to the left top corner of the canvas when the clipboard is not empty', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawEllipse').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
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
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawEllipse').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(service.imageData.height).toEqual(service.clipboardService.copy.height);
        expect(service.imageData.width).toEqual(service.clipboardService.copy.width);
        expect(service.imageData.data).toEqual(service.clipboardService.copy.data);
    });

    it('copySelection should do nothing when currentLine < 0', () => {
        service.currentLine = [];
        service.clipboardService.alreadyCopied = false;
        service.copySelection();
        expect(service.clipboardService.alreadyCopied).toBeFalse();
    });

    it('copySelection should  set the right image data and alreadyCopied as true when currentLine > 0', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.clipboardService.alreadyCopied = false;
        service.imageData = new ImageData(1, 2);
        service.copySelection();
        expect(service.clipboardService.alreadyCopied).toBeTrue();
        expect(service.clipboardService.copy).toEqual(service.imageData);
    });
});

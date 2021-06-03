import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleSelectionService } from '@app/services/tools/rectangle-selection.service';

describe('SelectionService', () => {
    let service: RectangleSelectionService;
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
        service = TestBed.inject(RectangleSelectionService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count

        baseCtxStub.canvas.width = 100;
        baseCtxStub.canvas.height = 100;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mockStartingPoint = { x: -50, y: -50 };
        mockEndingPoint = { x: 1, y: 1 };
        service.anchorPoints = [];

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('selectAll should call drawRectangle and drawAnchorPoints', () => {
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();
        const drawAnchorPointSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        const getImageDataSpy = spyOn(service, 'getImageData').and.stub();
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 5, y: 5 },
        ];
        service.selectAll();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawAnchorPointSpy).toHaveBeenCalled();
    });

    it('onMouseDown should do nothing if its on left click', () => {
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;

        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.onMouseDown(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });

    it(' mouseDown should call disableUndoRedo', () => {
        service.mouseDown = false;
        const disableUndoRedoSpy = spyOn(service.undoRedoManager, 'disableUndoRedo');
        service.onMouseDown(mouseEvent);
        expect(disableUndoRedoSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call checkIfInsideRectangle if currentLine length > 0', () => {
        const checkIfInsideRectangleSpy = spyOn(service.selecHelper, 'checkIfInsideRectangle').and.stub();
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 5, y: 5 },
        ];
        service.onMouseDown(mouseEvent);
        expect(checkIfInsideRectangleSpy).toHaveBeenCalled();
    });

    it('onMouseDown shouldnt call checkIfInsideRectangle if currentLine length <= 0', () => {
        const checkIfInsideRectangleSpy = spyOn(service.selecHelper, 'checkIfInsideRectangle').and.stub();
        service.currentLine = [];
        service.onMouseDown(mouseEvent);
        expect(checkIfInsideRectangleSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should call resetState if checkIfInsideRectangle returns false', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.mouseDown = true;
        const resetStateSpy = spyOn(service, 'resetState').and.stub();
        service.onMouseDown(mouseEvent);
        expect(resetStateSpy).toHaveBeenCalled();
    });

    it('onMouseDown shouldnt call resetState if checkIfInsideRectangle returns true', () => {
        const resetStateSpy = spyOn(service, 'resetState').and.stub();
        service.mouseDown = true;
        service.currentLine = [mockStartingPoint, { x: 50, y: 50 }];
        service.currentlySelecting = true;
        service.onMouseDown(mouseEvent);
        expect(resetStateSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown shouldnt call getImageData if currentlySelecting is true', () => {
        const getImageDataSpy = spyOn(service, 'getImageData').and.stub();
        service.mouseDown = true;
        service.currentLine = [mockStartingPoint, { x: 50, y: 50 }];
        service.currentlySelecting = true;
        service.onMouseDown(mouseEvent);
        expect(getImageDataSpy).not.toHaveBeenCalled();
    });

    it(`onMouseDown should call clearCanvas if currentLine length > 0, checkIfInsideRectangle
      return true and currentlySelecting is true`, () => {
        service.mouseDown = true;
        service.currentLine = [mockStartingPoint, { x: 50, y: 50 }];
        service.currentlySelecting = true;
        service.onMouseDown(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('mouseDown should call getPositionFromMouse if currentLine lenght <= 0', () => {
        service.mouseDown = true;
        service.currentLine = [];
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.onMouseDown(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });

    it('onMouseDown should set changeAnchor to true if click is on anchor', () => {
        service.changeAnchor = false;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.anchorPoints = [{ x: mouseEvent.offsetX, y: mouseEvent.offsetY }];
        service.onMouseDown(mouseEvent);
        expect(service.changeAnchor).toBeTrue();
    });

    it('checkIfInsideRectangle should return false if event is outside rectangle', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        expect(service.selecHelper.checkIfInsideRectangle(mouseEvent, service.currentLine)).toBeFalse();
    });

    it('checkIfInsideRectangle should return true if event is inside rectangle', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
        ];
        expect(service.selecHelper.checkIfInsideRectangle(mouseEvent, service.currentLine)).toBeTrue();
    });

    it('setShiftIsPressed should have called drawLine if checkIfSquare returns false', () => {
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();
        service.mouseDown = true;
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.startingPoint = { x: 1, y: 5 };
        service.endPoint = { x: 5, y: 5 };

        service.setShiftIsPressed(event);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('setShiftIsPressed shouldnt call drawLine if checkIfSquare returns true', () => {
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();

        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.startingPoint = { x: 1, y: 1 };
        service.endPoint = { x: 5, y: 5 };

        service.setShiftIsPressed(event);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('setShiftIsPressed does nothing if the key isnt shift', () => {
        service.shiftIsPressed = false;
        const event = new KeyboardEvent('keydown', { key: 'A' });
        service.setShiftIsPressed(event);
        expect(service.shiftIsPressed).toBeFalse();
    });

    it('setShiftNonPressed sets shifts shiftIsPressed to false when mouseDown is true', () => {
        service.mouseDown = true;
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 5, y: 5 };
        service.setShiftNonPressed(event);
        expect(service.shiftIsPressed).toEqual(false);
    });

    it('setShiftNonPressed sets shiftIsPressed to false when mouseDown is false', () => {
        service.mouseDown = false;
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.setShiftNonPressed(event);
        expect(service.shiftIsPressed).toEqual(false);
    });

    it('setShiftNonPressed does nothing if key isnt shift', () => {
        service.shiftIsPressed = true;
        const event = new KeyboardEvent('keydown', { key: 'A' });
        service.setShiftNonPressed(event);
        expect(service.shiftIsPressed).toBeTrue();
    });

    it('setShiftNonPressed should call moveAnchor if changeAnchor is true', () => {
        service.mouseDown = false;
        service.currentMousePos = { x: 0, y: 0 };
        service.changeAnchor = true;
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        const moveAnchorSpy = spyOn(service, 'moveAnchor').and.stub();
        service.setShiftNonPressed(event);
        expect(moveAnchorSpy).toHaveBeenCalled();
    });

    it('getImageData should call getImageData twice, clearRect and putImageData', () => {
        const getImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'getImageData').and.stub();
        // const clearRectSpy = spyOn(drawServiceSpy.baseCtx, 'clearRect').and.stub();
        const putImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'putImageData').and.stub();
        service.currentLine = [
            { x: 51, y: 51 },
            { x: 50, y: 50 },
        ];
        service.getImageData();
        expect(getImageDataSpy).toHaveBeenCalledTimes(2);
        // expect(clearRectSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('getImageData should set currentlySelecting as true', () => {
        service.currentlySelecting = false;
        service.currentLine = [mockStartingPoint, { x: 50, y: 50 }];
        service.getImageData();
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

    it('moveImageData should correctly set lastPos', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(service.lastPos).toEqual({ x: 1, y: 1 });
    });

    it('moveImageData should correctly set lastPos', () => {
        service.magnetismService.isActivated = true;
        service.magnetismService.mouseReference = { x: 5, y: 5 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(service.magnetismService.mouseReference).toEqual({ x: 6, y: 6 });
    });

    it(`moveImageData should call drawLine, drawAnchorPoints and putImageData twice`, () => {
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.lastPos = { x: 0, y: 0 };
        service.imageData = new ImageData(100, 100);
        service.backgroundImageData = new ImageData(100, 100);
        service.moveImageData(1, 1);

        expect(drawAnchorPointsSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalledTimes(2);
    });
    it('onMouseUp should do nothing if mouseDown is false or resizeActive is true', () => {
        service.mouseDown = false;
        const drawAnchorPointSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawAnchorPointSpy).not.toHaveBeenCalled();
        service.mouseDown = true;
        service.drawingService.resizeActive = true;
        service.onMouseUp(mouseEvent);
        expect(drawAnchorPointSpy).not.toHaveBeenCalled();
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
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        service.mouseDownCoord = { x: 0, y: 0 };
        service.startingPoint = mockStartingPoint;
        service.endPoint = mockEndingPoint;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseUp(mouseEvent);
        expect(drawAnchorPointsSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set hasBeenReseted as false if it was true and return', () => {
        service.mouseDown = true;
        const drawAnchorPointSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        service.hasBeenReseted = true;
        service.onMouseUp(mouseEvent);
        expect(drawAnchorPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should call fixImageData and putImageData and return if isMovingImg is true', () => {
        service.mouseDown = true;
        const putImageDataSpy = spyOn(baseCtxStub, 'putImageData').and.stub();
        const drawAnchorPointSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        service.isMovingImg = true;
        service.imageData = new ImageData(100, 100);
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.onMouseUp(mouseEvent);

        expect(putImageDataSpy).toHaveBeenCalled();
        expect(drawAnchorPointSpy).not.toHaveBeenCalled();
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

    it(`onMouseUp should call drawAnchorPoint`, () => {
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(drawAnchorPointsSpy).toHaveBeenCalled();
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

    it('onMouseUp should call getImageData if currentlySelecting is false', () => {
        service.mouseDown = true;
        const getImageDataSpy = spyOn(service, 'getImageData').and.stub();
        service.hasBeenReseted = false;
        service.currentlySelecting = false;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.shiftIsPressed = true;
        service.onMouseUp(mouseEvent);
        expect(getImageDataSpy).toHaveBeenCalled();
    });

    it('onMouseUp shouldnt call getImageData if currentlySelecting is true', () => {
        service.mouseDown = true;
        const getImageDataSpy = spyOn(service, 'getImageData').and.stub();
        service.hasBeenReseted = false;
        service.currentlySelecting = true;
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.shiftIsPressed = true;
        service.onMouseUp(mouseEvent);
        expect(getImageDataSpy).not.toHaveBeenCalled();
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

    it(' onMouseMove should  call drawLine if shiftIsPresse & moveDown are true and we already have a square', () => {
        service.mouseDown = true;
        service.shiftIsPressed = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 5, y: 1 };
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should  call drawLine if shiftIsPresse & moveDown are true and we dont already have a square', () => {
        service.mouseDown = true;
        service.shiftIsPressed = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 9, y: 1 };
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if shiftIsPresse is false & moveDown is true', () => {
        service.mouseDown = true;
        service.shiftIsPressed = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 9, y: 1 };
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should  not call drawLine if mouseDown is false true', () => {
        service.mouseDown = false;
        const drawLineSpy = spyOn(service, 'drawRectangle').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should set currentLine as startingPoint and endPoint is shiftIsPressed and it forms a square', () => {
        service.mouseDown = true;
        service.shiftIsPressed = true;
        service.startingPoint = { x: 0, y: 0 };
        const expectedResult: Vec2[] = [
            { x: 0, y: 0 },
            { x: 25, y: 25 },
        ];
        service.onMouseMove(mouseEvent);
        expect(service.currentLine).toEqual(expectedResult);
    });

    it('onMouseMove should call moveImageData if isMovingImg is true and the magnetism is not activated', () => {
        const moveImageDataSpy = spyOn(service, 'moveImageData').and.stub();
        service.isMovingImg = true;
        service.mouseDown = true;
        service.lastPos = { x: 0, y: 0 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        service.onMouseMove(mouseEvent);
        expect(moveImageDataSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call moveAnchor if changeAnchor is true', () => {
        service.mouseDown = true;
        service.changeAnchor = true;
        const moveAnchorSpy = spyOn(service, 'moveAnchor').and.stub();
        service.onMouseMove(mouseEvent);
        expect(moveAnchorSpy).toHaveBeenCalled();
    });
    it('onMouseMove should call moveImageData and dispatch if isMovingImg is true and the magnetism is activated', () => {
        service.magnetismService.isActivated = true;
        const moveImageDataSpy = spyOn(service, 'moveImageData').and.stub();
        service.isMovingImg = true;
        service.mouseDown = true;
        service.lastPos = { x: 0, y: 0 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        const dispatchSpy = spyOn(service.magnetismService, 'dispatch').and.returnValue({ x: 2, y: 3 });
        service.onMouseMove(mouseEvent);
        expect(moveImageDataSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call moveImageData and dispatch if isMovingImg is true and the magnetism is activated', () => {
        service.magnetismService.isActivated = true;
        const moveImageDataSpy = spyOn(service, 'moveImageData').and.stub();
        service.isMovingImg = true;
        service.mouseDown = true;
        service.lastPos = { x: 0, y: 0 };
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        const dispatchSpy = spyOn(service.magnetismService, 'dispatch').and.returnValue({ x: 2, y: 3 });
        service.onMouseMove(mouseEvent);
        expect(moveImageDataSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
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

    it('drawLine should call strokeRect and closePath', () => {
        const strokeRectSpy = spyOn(drawServiceSpy.baseCtx, 'strokeRect').and.stub();
        const closePathSpy = spyOn(drawServiceSpy.baseCtx, 'closePath').and.stub();
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.drawRectangle(drawServiceSpy.baseCtx, service.currentLine);
        expect(closePathSpy).toHaveBeenCalled();
        expect(strokeRectSpy).toHaveBeenCalled();
    });

    it('resizeSelection should call clearCanvas twice', () => {
        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.resizeSelection(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledTimes(2);
    });

    it('resizeSelection should call drawRectangle, drawAnchorPoints and drawRectangle', () => {
        const drawAnchorPointSpy = spyOn(service, 'drawAnchorPoints').and.stub();
        const drawRectangleSpy = spyOn(service, 'drawRectangle').and.stub();
        service.backgroundImageData = new ImageData(100, 100);
        service.imageData = new ImageData(100, 100);
        service.currentLine = [{ x: 2, y: 2 }, mockEndingPoint];
        service.resizeSelection(mouseEvent);
        expect(drawAnchorPointSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });
    it('deleteSelection should call deleteImageDataRectangle and getImageData', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        const deleteImageDataRectangleSpy = spyOn(service.clipboardService, 'deleteImageDataRectangle').and.returnValue();
        const getImageDataSpy = spyOn(service, 'getImageData').and.returnValue(new ImageData(2, 6));
        service.deleteSelection();
        expect(deleteImageDataRectangleSpy).toHaveBeenCalled();
        expect(getImageDataSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call getImageData when the clipboard is not empty ', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawRectangle').and.returnValue();
        const getImageDataSpy = spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(getImageDataSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call putImageData two times when the clipboard is not empty ', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        const putImageDataSpy = spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(putImageDataSpy).toHaveBeenCalledTimes(2);
    });

    it('pasteSelection should call clearCanvas when the clipboard is not empty ', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('pasteSelection should call drawLine when the clipboard is not empty ', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        const drawLineSpy = spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('pasteSelection should call drawAnchorPoints when the clipboard is not empty ', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(drawAnchorPointsSpy).toHaveBeenCalled();
    });

    it('pasteSelection should set the imageData equal to copy when the clipboard is not empty ', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawRectangle').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        spyOn(service, 'drawAnchorPoints').and.returnValue();
        spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(service.imageData.height).toEqual(service.clipboardService.copy.height);
        expect(service.imageData.width).toEqual(service.clipboardService.copy.width);
        expect(service.imageData.data).toEqual(service.clipboardService.copy.data);
    });

    it('pasteSelection should set the currentLine to the left top corner of the canvas when the clipboard is not empty', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = true;
        service.clipboardService.copy = new ImageData(2, 3);
        spyOn(service, 'drawRectangle').and.returnValue();
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

    it('pasteSelection should do and call nothing when the clipboard is empty', () => {
        service.currentLine = [mockStartingPoint, mockEndingPoint];
        service.clipboardService.alreadyCopied = false;
        service.clipboardService.copy = new ImageData(2, 3);
        const drawLineSpy = spyOn(service, 'drawRectangle').and.returnValue();
        const getImageDataSpy = spyOn(service.drawingService.baseCtx, 'getImageData').and.returnValue(new ImageData(2, 3));
        const drawAnchorPointsSpy = spyOn(service, 'drawAnchorPoints').and.returnValue();
        const putImageDataSpy = spyOn(service.drawingService.baseCtx, 'putImageData').and.returnValue();
        service.pasteSelection();
        expect(drawAnchorPointsSpy).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
        expect(putImageDataSpy).not.toHaveBeenCalled();
        expect(getImageDataSpy).not.toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });
});

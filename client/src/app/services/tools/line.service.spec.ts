import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ToolStyles } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';
import { LineCommandService } from './tool-commands/line-command.service';

describe('LineService', () => {
    let service: LineService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    const MOCK_STARTING_POINT: Vec2 = { x: 0, y: 0 };
    const MOCK_SEGMENT_ONE: Vec2[] = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
    ];
    const MOCK_ENDING_POINT: Vec2 = { x: 1, y: 1 };
    let command: LineCommandService;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(LineService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numers
        // tslint:disable:max-file-line-count
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        command = new LineCommandService();

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('clearArrays should call clearLinesAndJunctions', () => {
        const clearLineAndJunctionsSpy = spyOn(service, 'clearLineAndJunctions').and.stub();
        service.clearArrays();
        expect(clearLineAndJunctionsSpy).toHaveBeenCalled();
    });

    it('onEscape should set isStarted to false', () => {
        service.isStarted = true;
        service.onEscape();
        expect(service.isStarted).toBeFalse();
    });

    it('onEscape should call clearCanvas', () => {
        service.onEscape();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onEscape should calle clearLineAndJunctions', () => {
        const clearLineAndJunctionsSpy = spyOn(service, 'clearLineAndJunctions').and.stub();
        service.onEscape();
        expect(clearLineAndJunctionsSpy).toHaveBeenCalled();
    });

    it('clearLineAndJunctions should clear currentLine', () => {
        const emptyArray: Vec2[][] = [];
        service.currentLine.push([MOCK_STARTING_POINT, MOCK_ENDING_POINT]);
        service.clearLineAndJunctions();
        expect(service.currentLine).toEqual(emptyArray);
    });
    it('clearLineAndJunctions should clear segmentStyles', () => {
        const emptyArray: ToolStyles[] = [];
        const mockToolStyle: ToolStyles = { primaryColor: 'blue', lineWidth: 5 };
        service.segmentStyles.push(mockToolStyle);
        service.clearLineAndJunctions();
        expect(service.segmentStyles).toEqual(emptyArray);
    });
    it('clearLineAndJunctions should clear junctions', () => {
        const emptyArray: Vec2[] = [];
        const mockJunctionCenter: Vec2 = { x: 1, y: 1 };
        service.junctions.push(mockJunctionCenter);
        service.clearLineAndJunctions();
        expect(service.junctions).toEqual(emptyArray);
    });
    it('clearLineAndJunctions should clear junctionsRadius', () => {
        const emptyArray: number[] = [];
        const mockJunctionRadius = 10;
        service.junctionsRadius.push(mockJunctionRadius);
        service.clearLineAndJunctions();
        expect(service.junctionsRadius).toEqual(emptyArray);
    });

    it(' onMouseUp should call setStyleAndStartDrawing if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.mouseDown = true;
        const drawLineSpy = spyOn(service, 'setStylesAndStartDrawing').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call setStylesAndStartDrawing if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        const drawLineSpy = spyOn(service, 'setStylesAndStartDrawing').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should not call setStylesAndStartDrawing if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        const drawLineSpy = spyOn(service, 'setStylesAndStartDrawing').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' mouseClick should set startingPosition to correct position when the line is not started', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.isStarted = false;
        service.onMouseClick(mouseEvent);
        expect(service.startingPoint).toEqual(expectedResult);
    });

    it('onBackspace should only do something if currentLine isnt empty', () => {
        const currentLineSpy = spyOn(service.currentLine, 'pop').and.stub();
        service.onBackspace();
        expect(currentLineSpy).not.toHaveBeenCalled();
    });

    it('onBackspace should set startingPoint to the previous segments startingPoint if currentLine isnt empty', () => {
        const onBackspaceMock = spyOn(service, 'onBackspace').and.callFake(() => {
            if (service.currentLine.length > 0) {
                service.startingPoint = service.currentLine[service.currentLine.length - 1][0];
            }
        });
        service.startingPoint = MOCK_SEGMENT_ONE[1];
        service.currentLine = [MOCK_SEGMENT_ONE];
        onBackspaceMock();
        expect(service.startingPoint).toBe(MOCK_SEGMENT_ONE[0]);
    });

    it('onBackspace should call pop() on currentLine, segmentStyles, junctions and junctionsRadius if currentLine isnt empty', () => {
        const currentLineSpy = spyOn(service.currentLine, 'pop').and.stub();
        const segmentStylesSpy = spyOn(service.segmentStyles, 'pop').and.stub();
        const junctionsSpy = spyOn(service.junctions, 'pop').and.stub();
        const junctionsRadiusSpy = spyOn(service.junctionsRadius, 'pop').and.stub();
        const onBackspaceMock = spyOn(service, 'onBackspace').and.callFake(() => {
            if (service.currentLine.length > 0) {
                service.startingPoint = service.currentLine[service.currentLine.length - 1][0];
                service.currentLine.pop();
                service.segmentStyles.pop();
                service.junctions.pop();
                service.junctionsRadius.pop();
            }
        });
        service.currentLine.push(MOCK_SEGMENT_ONE);
        onBackspaceMock();
        expect(currentLineSpy).toHaveBeenCalled();
        expect(segmentStylesSpy).toHaveBeenCalled();
        expect(junctionsRadiusSpy).toHaveBeenCalled();
        expect(junctionsSpy).toHaveBeenCalled();
    });

    it('onBackspace should call clearcanvas, redrawCurrentLine if currentLine isnt empty', () => {
        const redrawCurrentLineSpy = spyOn(service, 'redrawCurrentLine').and.stub();
        service.currentLine.push(MOCK_SEGMENT_ONE);
        service.mouseDownCoord = { x: 0, y: 0 };
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 1, y: 1 };
        service.onBackspace();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(redrawCurrentLineSpy).toHaveBeenCalled();
    });

    it('onShift should do nothing if blockOnShift is true', () => {
        const setShiftIsPressedSpy = spyOn(service, 'setShiftIsPressed').and.stub();
        service.blockOnShift = true;
        service.onShift();
        expect(setShiftIsPressedSpy).not.toHaveBeenCalled();
    });

    it('onShift should call setShiftIsPressed and add an event listener is blockOnShift is false', () => {
        const setShiftIsPressedSpy = spyOn(service, 'setShiftIsPressed').and.stub();
        const windowEventListenerSpy = spyOn(window, 'addEventListener').and.stub();
        service.onShift();
        expect(setShiftIsPressedSpy).toHaveBeenCalled();
        expect(windowEventListenerSpy).toHaveBeenCalled();
    });

    it('onShift should set blockOnShift as true if it was false', () => {
        service.blockOnShift = false;
        service.onShift();
        expect(service.blockOnShift).toBeTrue();
    });

    it('setShiftIsPressed should put shiftIsPressed to true', () => {
        service.shiftIsPressed = false;
        service.setShiftIsPressed();
        expect(service.shiftIsPressed).toBeTrue();
    });

    it(`setShiftIsPressed should call clearCanvas, redrawCurrentLine and drawLine
         if line is started and shiftAngleCalculator returns false `, () => {
        const redrawCurrentLineSpy = spyOn(service, 'redrawCurrentLine').and.stub();
        const mockEndingPoint = { x: 5, y: 1 };
        service.isStarted = true;
        service.startingPoint = MOCK_STARTING_POINT;
        service.endPoint = mockEndingPoint;
        service.setShiftIsPressed();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(redrawCurrentLineSpy).toHaveBeenCalled();
    });
    it('setShiftIsPressed shouldnt call clearCanvas, redrawCurrentLine and drawLine if isStarted and shiftAngleCalculator returns true', () => {
        const redrawCurrentLineSpy = spyOn(service, 'redrawCurrentLine').and.stub();
        service.isStarted = true;
        service.startingPoint = MOCK_STARTING_POINT;
        service.endPoint = MOCK_ENDING_POINT;
        service.setShiftIsPressed();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(redrawCurrentLineSpy).not.toHaveBeenCalled();
    });

    it('setShiftNonPressed should do nothing if key isnt shift', () => {
        service.shiftIsPressed = true;
        const mockKeyboardEvent: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'A',
        });
        service.setShiftNonPressed(mockKeyboardEvent);
        expect(service.shiftIsPressed).toBeTrue();
    });

    it('setShiftNonPressed should call clearCanvas, redrawCurrentLine and drawLine if isStarted is true', () => {
        const redrawCurrentLineSpy = spyOn(service, 'redrawCurrentLine').and.stub();
        service.shiftIsPressed = true;
        service.isStarted = true;
        const mockKeyboardEvent: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.mousePosition = { x: 0, y: 0 };
        service.startingPoint = { x: 0, y: 0 };
        service.setShiftNonPressed(mockKeyboardEvent);
        expect(redrawCurrentLineSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it('setShiftNonPressed shouldnt call clearCanvas, redrawCurrentLine and drawLine if isStarted is false', () => {
        const redrawCurrentLineSpy = spyOn(service, 'redrawCurrentLine').and.stub();
        service.shiftIsPressed = true;
        service.isStarted = false;
        const mockKeyboardEvent: KeyboardEvent = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.setShiftNonPressed(mockKeyboardEvent);
        expect(redrawCurrentLineSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('pushNewJunction should add a new center to junctions and a new radius to junctionRadius', () => {
        const mockCenter: Vec2 = { x: 5, y: 5 };
        const mockRadius = 5;
        service.pushNewJunction(mockCenter, mockRadius);
        expect(service.junctions[service.junctions.length - 1]).toEqual(mockCenter);
        expect(service.junctionsRadius[service.junctionsRadius.length - 1]).toEqual(mockRadius);
    });

    it('drawJunction should do nothing if hasJunction is false', () => {
        const beginPathSpy = spyOn(drawingServiceSpy.baseCtx, 'beginPath').and.stub();
        command.hasJunction = false;
        const mockCenter: Vec2 = { x: 0, y: 0 };
        const mockRadius = 1;
        command.drawJunction(drawingServiceSpy.baseCtx, mockCenter, mockRadius);
        expect(beginPathSpy).not.toHaveBeenCalled();
    });

    it('drawJunction should call beginPath, arc, fillstyle and fill if hasJunction is true', () => {
        const beginPathSpy = spyOn(drawingServiceSpy.baseCtx, 'beginPath').and.stub();
        const arcSpy = spyOn(drawingServiceSpy.baseCtx, 'arc').and.stub();
        const fillSpy = spyOn(drawingServiceSpy.baseCtx, 'fill').and.stub();
        const mockCenter: Vec2 = { x: 0, y: 0 };
        const mockRadius = 1;
        command.hasJunction = true;
        command.drawJunction(drawingServiceSpy.baseCtx, mockCenter, mockRadius);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(arcSpy).toHaveBeenCalled();
        expect(fillSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.baseCtx.fillStyle).toEqual('#000000');
    });

    it('redrawCurrentLine should call clearLineAndJunctions only if ctx is baseCtx', () => {
        const clearLineAndJunctionsSpy = spyOn(service, 'clearLineAndJunctions').and.stub();
        service.redrawCurrentLine(service.drawingService.baseCtx, command);
        expect(clearLineAndJunctionsSpy).toHaveBeenCalled();
    });

    /*it('drawLine should call setColors and setStyles', () => {
        const setColorsSpy = spyOn(service, 'setColors').and.stub();
        const setStylesSpy = spyOn(service, 'setStyles').and.stub();
        service.drawLine(drawingServiceSpy.baseCtx, [MOCK_STARTING_POINT, MOCK_ENDING_POINT]);
        expect(setColorsSpy).toHaveBeenCalled();
        expect(setStylesSpy).toHaveBeenCalled();
    });

    it('drawLine should call lineTo, moveTo, beginPath and stroke', () => {
        const lineToSpy = spyOn(drawingServiceSpy.baseCtx, 'lineTo').and.stub();
        const beginPathSpy = spyOn(drawingServiceSpy.baseCtx, 'beginPath').and.stub();
        const strokeSpy = spyOn(drawingServiceSpy.baseCtx, 'stroke').and.stub();
        const mockPath: Vec2[] = [MOCK_STARTING_POINT, MOCK_ENDING_POINT];
        service.drawLine(drawingServiceSpy.baseCtx, mockPath);
        expect(lineToSpy).toHaveBeenCalled();
        expect(beginPathSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('drawLine should set drawingStarted to true only if the ctx is baseCtx', () => {
        service.drawLine(service.drawingService.baseCtx, [MOCK_STARTING_POINT, MOCK_ENDING_POINT]);
        expect(service.drawingService.drawingStarted).toBeTrue();
        service.drawingService.drawingStarted = false;
        service.drawLine(service.drawingService.previewCtx, [MOCK_STARTING_POINT, MOCK_ENDING_POINT]);
        expect(service.drawingService.drawingStarted).toBeFalse();
    });*/

    it(' mouseDown should call disableUndoRedo()', () => {
        const disableUndoRedoSpy = spyOn(service.undoRedoManager, 'disableUndoRedo');
        service.onMouseClick(mouseEvent);
        expect(disableUndoRedoSpy).toHaveBeenCalled();
    });

    it(' mouseClick should set endingPosition to mouse position when the line is started and shift isnt pressed', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.startingPoint = MOCK_STARTING_POINT;
        service.isStarted = true;
        service.onMouseClick(mouseEvent);
        expect(service.endPoint).toEqual(expectedResult);
    });

    it('mouseclick should set isStarted to true if it was false', () => {
        service.isStarted = false;
        service.onMouseClick(mouseEvent);
        expect(service.isStarted).toBeTrue();
    });

    it('mouseClick should set calledFromMouseClick false if shiftIsPressed is true', () => {
        service.startingPoint = MOCK_STARTING_POINT;
        service.endPoint = MOCK_ENDING_POINT;
        service.mousePosition = MOCK_ENDING_POINT;
        service.isStarted = true;
        service.calledFromMouseClick = true;
        service.shiftIsPressed = true;
        service.onMouseClick(mouseEvent);
        expect(service.calledFromMouseClick).toBeFalse();
    });

    it('mouseClick should set startingPoint as mouse position if it isnt started', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseClick(mouseEvent);
        expect(service.startingPoint).toEqual(expectedResult);
    });

    it('mouseClick should call pushNewJunction and drawJunction if it isnt started', () => {
        const pushNewJunctionSpy = spyOn(service, 'pushNewJunction').and.stub();
        service.onMouseClick(mouseEvent);
        expect(pushNewJunctionSpy).toHaveBeenCalled();
    });

    it('mouseClick should call pushNewJunction, drawLine and drawJunction if it isnt started and resizeActive is false', () => {
        const pushNewJunctionSpy = spyOn(service, 'pushNewJunction').and.stub();
        service.isStarted = true;
        service.startingPoint = MOCK_STARTING_POINT;
        service.endPoint = MOCK_ENDING_POINT;
        drawingServiceSpy.resizeActive = false;
        service.onMouseClick(mouseEvent);
        expect(pushNewJunctionSpy).toHaveBeenCalled();
    });

    it('mouseClick shouldnt call pushNewJunction, drawLine and drawJunction if it isnt started and resizeActive is true', () => {
        const pushNewJunctionSpy = spyOn(service, 'pushNewJunction').and.stub();
        service.isStarted = true;
        drawingServiceSpy.resizeActive = true;
        service.onMouseClick(mouseEvent);
        expect(pushNewJunctionSpy).not.toHaveBeenCalled();
    });

    it('mouseMove should do nothing if isStarted is false', () => {
        service.isStarted = false;
        const getPositionSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.onMouseMove(mouseEvent);
        expect(getPositionSpy).not.toHaveBeenCalled();
    });
    it(' mouseMove should set endPosition to current mouse position when called', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.startingPoint = MOCK_STARTING_POINT;
        service.isStarted = true;
        service.onMouseMove(mouseEvent);
        expect(service.endPoint).toEqual(expectedResult);
    });

    it('onMouseMove should set angledEndPoint and endPoint to what closestAngledPoint returns if shiftIsPressed is true', () => {
        service.startingPoint = MOCK_STARTING_POINT;
        service.shiftIsPressed = true;
        service.isStarted = true;
        mouseEvent = {
            offsetX: 5,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        const mockEndingPoint = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        const expectedResult = service.lineHelper.closestAngledPoint(MOCK_STARTING_POINT, mockEndingPoint);
        service.onMouseMove(mouseEvent);
        expect(service.endPoint).toEqual(expectedResult);
        expect(service.angledEndPoint).toEqual(expectedResult);
    });

    it('onDoubleClick should set the endPoint as the starting point of the line if the click is done < 20px from the original point', () => {
        service.isStarted = true;
        const mockStartingPoint = { x: 15, y: 15 };
        const mockEndingPointSegmentOne = { x: 20, y: 20 };
        service.currentLine.push([mockStartingPoint, mockEndingPointSegmentOne]);
        service.startingPoint = mockEndingPointSegmentOne;
        service.onDoubleClick(mouseEvent);
        expect(service.endPoint).toEqual(mockStartingPoint);
    });

    it('onDoubleClick should set endPoint as mouse position if shift isnt pressed', () => {
        service.isStarted = true;
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.currentLine.push([MOCK_STARTING_POINT, MOCK_ENDING_POINT]);
        service.startingPoint = MOCK_ENDING_POINT;
        service.onDoubleClick(mouseEvent);
        expect(service.endPoint).toEqual(expectedResult);
    });

    it('onDoubleClick should set endPoint as angledEndPoint if shift if pressed', () => {
        service.shiftIsPressed = true;
        service.isStarted = true;
        service.angledEndPoint = { x: 5, y: 5 };
        const expectedResult: Vec2 = { x: 5, y: 5 };
        service.currentLine.push([MOCK_STARTING_POINT, MOCK_ENDING_POINT]);
        service.startingPoint = MOCK_ENDING_POINT;
        service.onDoubleClick(mouseEvent);
        expect(service.endPoint).toEqual(expectedResult);
    });

    it('onDoubleClick should do nothing if isStarted is false', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.isStarted = false;
        service.onDoubleClick(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });
});

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SquareHelperService } from '@app/services/tools/square-helper.service';
import { RectangleCommandService } from '@app/services/tools/tool-commands/rectangle-command.service';
import { RectangleService } from './rectangle.service';

describe('RectangleService', () => {
    let service: RectangleService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearBackground']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(RectangleService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable *
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

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should not call getPositionFromMouse if shiftIsPressed is true', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        const mockPath: Vec2[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.currentLine = mockPath;
        service.mouseDown = true;
        service.shiftIsPressed = true;
        service.onMouseUp(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should  call drawLine if shiftIsPresse & moveDown are true and we already have a square', () => {
        service.mouseDown = true;
        service.shiftIsPressed = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 5, y: 1 };
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should  call drawLine if shiftIsPresse & moveDown are true and we dont already have a square', () => {
        service.mouseDown = true;
        service.shiftIsPressed = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 9, y: 1 };
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if shiftIsPresse is false & moveDown is true', () => {
        service.mouseDown = true;
        service.shiftIsPressed = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 9, y: 1 };
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should  not call drawLine if mouseDown is false true', () => {
        service.mouseDown = false;
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
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

    it('setShiftIsPressed should have called drawLine if checkIfSquare returns false', () => {
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();

        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.startingPoint = { x: 1, y: 5 };
        service.endPoint = { x: 5, y: 5 };
        service.isStarted = true;
        service.setShiftIsPressed(event);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('setShiftIsPressed shouldnt call drawLine if checkIfSquare returns true', () => {
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();

        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.startingPoint = { x: 1, y: 1 };
        service.endPoint = { x: 5, y: 5 };
        service.isStarted = true;
        service.setShiftIsPressed(event);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('setShiftIsPressed does nothing if the key isnt shift', () => {
        service.shiftIsPressed = false;
        service.isStarted = true;
        const event = new KeyboardEvent('keydown', { key: 'A' });
        service.setShiftIsPressed(event);
        expect(service.shiftIsPressed).toBeFalse();
    });

    it('setShiftIsPressed does nothing if isStarted is false', () => {
        service.isStarted = false;
        service.shiftIsPressed = false;
        const event = new KeyboardEvent('keydown', { key: 'A' });
        service.setShiftIsPressed(event);
        expect(service.shiftIsPressed).toBeFalse();
    });

    it('setShiftNonPressed sets shifts shiftIsPressed and eventTest to false when mouseDown is true', () => {
        service.mouseDown = true;
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service['startingPoint'] = { x: 1, y: 5 };
        service['endPoint'] = { x: 5, y: 5 };
        service.setShiftNonPressed(event);
        expect(service.shiftIsPressed).toEqual(false);
        expect(service.eventListenerIsSet).toEqual(false);
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

    it('onShift returns eventTest true', () => {
        service.eventListenerIsSet = false;
        service.onShift();
        expect(service.eventListenerIsSet).toEqual(true);
    });

    it('onShift adds 2 eventlisteners if eventListenerIsSet is false', () => {
        const eventListenerSpy = spyOn(window, 'addEventListener').and.stub();
        service.eventListenerIsSet = false;
        service.onShift();
        expect(eventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it('onShift does nothing if eventListenerIsSet is true', () => {
        const eventListenerSpy = spyOn(window, 'addEventListener').and.stub();
        service.eventListenerIsSet = true;
        service.onShift();
        expect(eventListenerSpy).not.toHaveBeenCalled();
    });

    it('drawLine should calls fillRect when toolStyle.fill is true', () => {
        const rectangleSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'fillRect',
        ]);
        service.startingPoint = { x: 1, y: 1 };
        service.endPoint = { x: 2, y: 2 };
        service.currentLine = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.toolStyles.fill = true;
        service.drawLine(rectangleSpyObject, new RectangleCommandService(new SquareHelperService()));
        expect(rectangleSpyObject.fillRect).toHaveBeenCalled();
    });

    it('drawLine should calls moveTo and lineTo 4 times', () => {
        const rectangleSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);
        service.startingPoint = { x: 1, y: 1 };
        service.endPoint = { x: 2, y: 2 };
        service.currentLine = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.drawLine(rectangleSpyObject, new RectangleCommandService(new SquareHelperService()));
        expect(rectangleSpyObject.lineTo).toHaveBeenCalledTimes(4);
        expect(rectangleSpyObject.moveTo).toHaveBeenCalledTimes(4);
    });

    it('drawLine should set strokeStyle as primaryColor if contour is false', () => {
        const mockPath: Vec2[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.startingPoint = mockPath[0];
        service.endPoint = mockPath[1];
        service.currentLine = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.contour = false;
        drawingServiceSpy.baseCtx.strokeStyle = 'blue';
        service.drawLine(drawingServiceSpy.baseCtx, new RectangleCommandService(new SquareHelperService()));
        expect(drawingServiceSpy.baseCtx.strokeStyle).toEqual('#000000');
    });

    it('drawLine should set drawingStarted to true if ctx is baseCtx', () => {
        drawingServiceSpy.drawingStarted = false;
        service.currentLine = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.drawLine(drawingServiceSpy.baseCtx, new RectangleCommandService(new SquareHelperService()));
        expect(drawingServiceSpy.drawingStarted).toBeTrue();
    });
});

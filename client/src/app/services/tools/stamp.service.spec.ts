import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from './stamp.service';
import { StampCommandService } from './tool-commands/stamp-command.service';

describe('StampService', () => {
    let service: StampService;
    let mouseEvent: MouseEvent;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpyObject: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:no-empty

        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        drawingServiceSpy.canvas = document.createElement('canvas');
        ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'moveTo',
            'lineTo',
            'stroke',
            'save',
            'translate',
            'rotate',
            'drawImage',
            'restore',
            'canvas',
        ]);
        drawingServiceSpy.previewCtx = ctxSpyObject;
        drawingServiceSpy.baseCtx = ctxSpyObject;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(StampService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('resetWheelIfBeyondRange should not reset the angle if it is larger than 0 and smaller than 360', () => {
        service.rotationAngle = 10;
        service.resetWheelIfBeyondRange();
        expect(service.rotationAngle).toEqual(10);
    });

    it('resetWheelIfBeyondRange should reset the angle to 360 if it is smaller or equal to 0', () => {
        service.rotationAngle = -1;
        service.resetWheelIfBeyondRange();
        expect(service.rotationAngle).toEqual(360);
    });

    it('resetWheelIfBeyondRange should reset the angle to 0 if it is larger or equal to 360', () => {
        service.rotationAngle = 369;
        service.resetWheelIfBeyondRange();
        expect(service.rotationAngle).toEqual(0);
    });

    it('draw() should set isEventListenerSet to false', () => {
        service.isEventListenerSet = true;
        const stampCommand: StampCommandService = new StampCommandService();
        service.undoRedoManager.redoStack = [stampCommand];
        service.draw(ctxSpyObject, stampCommand);
        expect(service.isEventListenerSet).toEqual(false);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const stampCommand: StampCommandService = new StampCommandService();
        service.undoRedoManager.redoStack = [stampCommand];
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should call enableUndoRedo()', () => {
        const denableUndoRedoSpy = spyOn(service.undoRedoManager, 'enableUndoRedo');
        service.onMouseDown(mouseEvent);
        expect(denableUndoRedoSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseDown should clear redoStack', () => {
        spyOn(service, 'draw').and.stub();
        service.mouseDown = true;
        const stampCommand: StampCommandService = new StampCommandService();
        service.undoRedoManager.redoStack = [stampCommand];

        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseDown(mouseEvent);
        expect(service.undoRedoManager.redoStack).toEqual([]);
    });

    it(' onMouseMove should set mouseDownCoord to correct position', () => {
        const stampCommand: StampCommandService = new StampCommandService();
        service.undoRedoManager.redoStack = [stampCommand];
        const expectedResult: Vec2 = { x: 66, y: 250 };
        const mouseMoveEvent = {
            offsetX: 66,
            offsetY: 250,
        } as MouseEvent;
        spyOn(service, 'draw').and.stub();
        service.onMouseMove(mouseMoveEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' onMouseMove should erase the stamp preview if the mouse is on the toolbar', () => {
        const stampCommand: StampCommandService = new StampCommandService();
        service.undoRedoManager.redoStack = [stampCommand];
        const mouseMoveEvent = {
            screenX: 100,
            clientY: 250,
        } as MouseEvent;
        spyOn(service, 'draw').and.stub();
        service.onMouseMove(mouseMoveEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseMove should erase the stamp preview if the mouse is on top of the page (above the canvas)', () => {
        const stampCommand: StampCommandService = new StampCommandService();
        service.undoRedoManager.redoStack = [stampCommand];
        const mouseMoveEvent = {
            screenX: 500,
            clientY: 50,
        } as MouseEvent;
        spyOn(service, 'draw').and.stub();
        service.onMouseMove(mouseMoveEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseMove should not draw if resizeActive is true', () => {
        service['drawingService'].resizeActive = true;
        const stampCommand: StampCommandService = new StampCommandService();
        service.undoRedoManager.redoStack = [stampCommand];
        const mouseMoveEvent = {
            screenX: 500,
            clientY: 50,
        } as MouseEvent;
        const drawSpy = spyOn(service, 'draw').and.stub();
        service.onMouseMove(mouseMoveEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' onMouseWheel should not draw if resizeActive is true', () => {
        service['drawingService'].resizeActive = true;
        const drawSpy = spyOn(service, 'draw').and.stub();
        const forwardWheelEvent = { deltaY: 100, altKey: false, stopPropagation: () => {}, preventDefault: () => {} } as WheelEvent;
        service.onMouseWheel(forwardWheelEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' onMouseWheel should prevent the default bahaviour (scroling the page)', () => {
        const forwardWheelEvent = { deltaY: 100, altKey: false, stopPropagation: () => {}, preventDefault: () => {} } as WheelEvent;
        const preventDefaultSpy = spyOn(forwardWheelEvent, 'preventDefault').and.callThrough();
        service.onMouseWheel(forwardWheelEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it(' onMouseWheel should incrase the orientation angle by 15 with each forward stroke of the mouse wheel', () => {
        const drawSpy = spyOn(service, 'draw');
        service.rotationAngle = 50;
        const forwardWheelEvent = { deltaY: 100, altKey: false, stopPropagation: () => {}, preventDefault: () => {} } as WheelEvent;
        service.onMouseWheel(forwardWheelEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(service.rotationAngle).toEqual(65);
    });

    it(' onMouseWheel should decrease the orientation angle by 15 with each backward stroke of the mouse wheel', () => {
        const drawSpy = spyOn(service, 'draw');
        service.rotationAngle = 30;
        const backwardWheelEvent = { deltaY: -100, altKey: false, stopPropagation: () => {}, preventDefault: () => {} } as WheelEvent;
        service.onMouseWheel(backwardWheelEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(service.rotationAngle).toEqual(15);
    });

    it('onAlt returns eventTest true', () => {
        service.isEventListenerSet = false;
        service.onAlt();
        expect(service.isEventListenerSet).toEqual(true);
    });

    it('onAlt adds 2 eventlisteners if eventListenerIsSet is false', () => {
        const eventListenerSpy = spyOn(window, 'addEventListener').and.stub();
        service.isEventListenerSet = false;
        service.onAlt();
        expect(eventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it('onAlt does nothing if eventListenerIsSet is true', () => {
        const eventListenerSpy = spyOn(window, 'addEventListener').and.stub();
        service.isEventListenerSet = true;
        service.onAlt();
        expect(eventListenerSpy).not.toHaveBeenCalled();
    });

    it('setAltIsPressed sets the rotationRate to 1', () => {
        const altEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        service.setAltIsPressed(altEvent);
        expect(service.rotationRate).toEqual(1);
    });

    it('setAltIsNotPressed sets the rotationRate to 15', () => {
        const altEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        service.setAltIsNotPressed(altEvent);
        expect(service.rotationRate).toEqual(15);
    });

    it('setAltIsPressed does nothing if the key isnt alt', () => {
        const event = new KeyboardEvent('keydown', { key: 'A' });
        service.setAltIsPressed(event);
        expect(service.rotationRate).toEqual(15); // instead of 1
    });

    it('setAltIsNotPressed does nothing if the key isnt alt', () => {
        const event = new KeyboardEvent('keydown', { key: 'A' });
        service.setAltIsNotPressed(event);
        expect(service.rotationRate).toEqual(15); // instead of 1
    });
});

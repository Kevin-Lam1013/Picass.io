import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AirbrushService } from './airbrush.service';
import { AirbrushCommandService } from './tool-commands/airbrush-command.service';

describe('AirbrushService', () => {
    let service: AirbrushService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        jasmine.clock().install();

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(AirbrushService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable: no-unused-expression
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 65,
            offsetY: 1000,
            button: 0,
        } as MouseEvent;
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedPosition: Vec2 = { x: 65, y: 1000 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedPosition);
    });

    it(' mouseDown should call clearArrays() method', () => {
        const clearArraysSpy = spyOn(service, 'clearArrays').and.stub();
        service.onMouseDown(mouseEvent);
        expect(clearArraysSpy).toHaveBeenCalled();
    });

    it('clearArrays should set pathData to []', () => {
        service.clearArrays();
        expect(service['pathData']).toEqual([]);
    });

    it(' mouseDown should call disableUndoRedo() method', () => {
        const disableUndoRedoSpy = spyOn(service.undoRedoManager, 'disableUndoRedo');
        service.onMouseDown(mouseEvent);
        expect(disableUndoRedoSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should call spray every 100 ms', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.mouseDown = true;
        service.onMouseDown(mouseEvent);
        const spraySpy = spyOn(service, 'spray').and.stub();
        setTimeout(() => {
            service.spray;
        }, 100);
        expect(spraySpy).not.toHaveBeenCalled();
        jasmine.clock().tick(101);
        expect(spraySpy).toHaveBeenCalled();
    });

    it('onMouseDown should not call spray if mouseDown for less than 100 ms', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.mouseDown = true;
        service.onMouseDown(mouseEvent);
        const spraySpy = spyOn(service, 'spray').and.stub();
        setTimeout(() => {
            service.spray;
        }, 100);
        jasmine.clock().tick(99);
        expect(spraySpy).not.toHaveBeenCalled();
    });

    it(' onMouseDown should do nothing if mouseDown is false and resizeActive is true', () => {
        service.mouseDown = false;
        drawingServiceSpy.resizeActive = true;
        service.onMouseDown(mouseEvent);
        const clearArraysSpy = spyOn(service, 'clearArrays').and.stub();
        const spraySpy = spyOn(service, 'spray').and.stub();
        expect(spraySpy).not.toHaveBeenCalled();
        expect(clearArraysSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should do nothing if mouseDown is false', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        const clearArraysSpy = spyOn(service, 'clearArrays').and.stub();
        const spraySpy = spyOn(service, 'spray').and.stub();

        expect(spraySpy).not.toHaveBeenCalled();
        expect(clearArraysSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should do nothing if resizeActive is true false', () => {
        service.mouseDown = true;
        drawingServiceSpy.resizeActive = true;
        service.onMouseMove(mouseEvent);
        const clearArraysSpy = spyOn(service, 'clearArrays').and.stub();
        const spraySpy = spyOn(service, 'spray').and.stub();
        expect(spraySpy).not.toHaveBeenCalled();
        expect(clearArraysSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should set mouseDownCoord to correct position', () => {
        const expectedPosition: Vec2 = { x: 65, y: 1000 };
        service.mouseDown = true;
        service['pathData'] = [];
        service.onMouseMove(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedPosition);
    });

    it(' onMouseMove should push current mouse coord to pathData', () => {
        const expectedPosition: Vec2 = { x: 65, y: 1000 };
        service.mouseDown = true;
        service['pathData'] = [];
        service.onMouseMove(mouseEvent);
        expect(service['pathData'][0]).toEqual(expectedPosition);
    });

    it(' onMouseMove should call spray if mouseDown is true ', () => {
        service.mouseDown = true;
        const spraySpy = spyOn(service, 'spray').and.stub();
        service['pathData'] = [];
        service.onMouseMove(mouseEvent);
        expect(spraySpy).toHaveBeenCalled();
    });

    it(' mouseMove should call disableUndoRedo() method', () => {
        const disableUndoRedoSpy = spyOn(service.undoRedoManager, 'disableUndoRedo');
        service.mouseDown = true;
        service['pathData'] = [];
        service.onMouseMove(mouseEvent);
        expect(disableUndoRedoSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should set mouse down to false all the time', () => {
        service.mouseDown = true;
        drawingServiceSpy.resizeActive = true;
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it(' mouseUp should call enableUndoRedo() method', () => {
        const enableUndoRedoSpy = spyOn(service.undoRedoManager, 'enableUndoRedo');
        service.mouseDown = true;
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.mouseDownCoord = { x: 2, y: 2 };
        service.onMouseUp(mouseEvent);
        expect(enableUndoRedoSpy).toHaveBeenCalled();
    });

    it(' mouseUp should call clearRedoStack() method', () => {
        const clearRedoStackSpy = spyOn(service.undoRedoManager, 'clearRedoStack');
        service.mouseDown = true;
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.mouseDownCoord = { x: 2, y: 2 };
        service.onMouseUp(mouseEvent);
        expect(clearRedoStackSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should set mouse down to false ', () => {
        service.mouseDown = true;
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.mouseDownCoord = { x: 2, y: 2 };
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it(' spray should call setColors method', () => {
        const setColorsSpy = spyOn(service, 'setColors');
        service['pathData'] = [];
        const airbrushCommand: AirbrushCommandService = new AirbrushCommandService();
        service.spray(service['drawingService'].baseCtx, { x: 50, y: 50 }, airbrushCommand);
        expect(setColorsSpy).toHaveBeenCalled();
    });

    it(' spray should call setStyles method', () => {
        const setStylesSpy = spyOn(service, 'setStyles');
        service['pathData'] = [];
        const airbrushCommand: AirbrushCommandService = new AirbrushCommandService();
        service.spray(service['drawingService'].baseCtx, { x: 50, y: 50 }, airbrushCommand);
        expect(setStylesSpy).toHaveBeenCalled();
    });
});

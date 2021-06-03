import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AutoSaveService } from './auto-save.service';

describe('AutoSaveService', () => {
    let service: AutoSaveService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpyObject: jasmine.SpyObj<CanvasRenderingContext2D>;
    let dummyCanvas: ElementRef<HTMLCanvasElement>;
    const dummyNativeElement = document.createElement('canvas');

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']); // un genre de proxy
        drawingServiceSpy.canvas = document.createElement('canvas');
        drawingServiceSpy.canvasSize = { x: 500, y: 500 };
        ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', ['fillStyle', 'fillRect', 'canvas']);
        drawingServiceSpy.baseCtx = ctxSpyObject;
        dummyCanvas = new ElementRef<HTMLCanvasElement>(dummyNativeElement);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(AutoSaveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('saveDrawingDefault should affect the localStorage with appropriate values from the drawingService', () => {
        service.saveDrawingDefault();
        expect(service.localStorage.getItem('savedDrawing')).toEqual(drawingServiceSpy.canvas.toDataURL('image/png', 1.0));
        expect(service.localStorage.getItem('canvasWidth')).toEqual(service.drawingService.canvasSize.x.toString());
        expect(service.localStorage.getItem('canvasHeight')).toEqual(service.drawingService.canvasSize.y.toString());
    });

    it('saveDrawing should save the dimentions and the dataURL of the canvas give in parameters', () => {
        const canvasSize: Vec2 = { x: 500, y: 250 };
        service.saveDrawing(canvasSize, dummyCanvas.nativeElement);
        expect(service.localStorage.getItem('savedDrawing')).toEqual(dummyCanvas.nativeElement.toDataURL('image/png', 1.0));
        expect(service.localStorage.getItem('canvasWidth')).toEqual(canvasSize.x.toString());
        expect(service.localStorage.getItem('canvasHeight')).toEqual(canvasSize.y.toString());
    });

    it('restoreOldDrawing should not save any dimentions if there are no drawing saved', () => {
        localStorage.clear();
        service.restoreOldDrawing();
        expect(service.localStorage.getItem('oldDrawing')).toEqual(null);
        expect(service.localStorage.getItem('oldCanvasWidth')).toEqual(null);
        expect(service.localStorage.getItem('oldCanvasHeight')).toEqual(null);
    });

    it('clearLocalStorage should clear the storage', () => {
        const clearSpy = spyOn(localStorage, 'clear').and.callThrough();
        service.clearLocalStorage();
        expect(clearSpy).toHaveBeenCalled();
        expect(service.localStorage.getItem('savedDrawing')).toEqual(null);
        expect(service.localStorage.getItem('canvasWidth')).toEqual(null);
        expect(service.localStorage.getItem('canvasHeight')).toEqual(null);
        expect(service.localStorage.getItem('oldDrawing')).toEqual(null);
        expect(service.localStorage.getItem('oldCanvasWidth')).toEqual(null);
        expect(service.localStorage.getItem('oldCanvasHeight')).toEqual(null);
    });

    it('checkIfDrawingStarted should set drawingStarted to false if there are no saved drawing', () => {
        localStorage.clear();
        service.checkIfDrawingStarted();
        expect(service.drawingService.drawingStarted).toBe(false);
    });

    it('checkIfDrawingStarted should set drawingStarted to true if there are is a  saved drawing', () => {
        localStorage.clear();
        localStorage.setItem('savedDrawing', 'drawingsURI');
        service.checkIfDrawingStarted();
        expect(service.drawingService.drawingStarted).toBe(true);
    });

    it('getSavedCanvasSize should set savedCanvasSize to the values found the local storage if a drawing was started', () => {
        localStorage.setItem('canvasWidth', '400');
        localStorage.setItem('canvasHeight', '300');
        service.drawingService.drawingStarted = true;
        service.getSavedCanvasSize();
        expect(service.savedCanvasSize).toEqual({ x: 400, y: 300 });
    });

    it('getSavedCanvasSize should return default canvas size when no drawing was saved', () => {
        localStorage.setItem('canvasWidth', '400');
        localStorage.setItem('canvasHeight', '300');
        service.drawingService.drawingStarted = false;
        service.getSavedCanvasSize();
        expect(service.savedCanvasSize).toEqual({ x: 1000, y: 800 });
    });
});

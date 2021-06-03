import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { PipetteService } from '@app/services/tools/pipette.service';

describe('PipetteService', () => {
    let service: PipetteService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let magnifierCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearBackground']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['pushToQueueOnConfirm']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
            ],
        });
        service = TestBed.inject(PipetteService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
        magnifierCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.magnifierCtx = magnifierCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should make mouseDown false and call assignPrimaryColor if left mouse button is clicked', () => {
        const assignPrimaryColorSpy = spyOn(service, 'assignPrimaryColor').and.callThrough();
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(false);
        expect(assignPrimaryColorSpy).toHaveBeenCalledWith(mouseEventLClick, drawServiceSpy.baseCtx);
    });

    it('onMouseDown should make mouseDown false and call assignSecondaryColor if right mouse button is clicked', () => {
        const assignSecondaryColorSpy = spyOn(service, 'assignSecondaryColor').and.callThrough();
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
        expect(assignSecondaryColorSpy).toHaveBeenCalledWith(mouseEventRClick, drawServiceSpy.baseCtx);
    });

    it('onMouseDown should keep mouseDown true if neither right nor left mouse button are clicked', () => {
        const assignPrimaryColorSpy = spyOn(service, 'assignPrimaryColor').and.callThrough();
        const assignSecondaryColorSpy = spyOn(service, 'assignSecondaryColor').and.callThrough();
        const mouseEventMClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventMClick);
        expect(service.mouseDown).toEqual(true);
        expect(assignPrimaryColorSpy).not.toHaveBeenCalledWith(mouseEventMClick, drawServiceSpy.baseCtx);
        expect(assignSecondaryColorSpy).not.toHaveBeenCalledWith(mouseEventMClick, drawServiceSpy.baseCtx);
    });

    it('magnifyingPreview should disable image smoothing and create a white reticule', () => {
        const event = {
            offsetX: 25,
            offsetY: 25,
        } as MouseEvent;
        service.magnifyingPreview(event);
        expect(service.magnifierCtx.imageSmoothingEnabled).toEqual(false);
        expect(service.magnifierCtx.strokeStyle).toEqual('#ffffff');
        expect(service.magnifierCtx.lineWidth).toEqual(0.5);
    });

    it('magnifyingPreview should call drawImage and strokeRect', () => {
        const drawImageSpy = spyOn(service.magnifierCtx, 'drawImage').and.stub();
        const strokeRectSpy = spyOn(service.magnifierCtx, 'strokeRect').and.stub();
        const event = {
            offsetX: 25,
            offsetY: 25,
        } as MouseEvent;
        service.magnifyingPreview(event);
        expect(drawImageSpy).toHaveBeenCalledWith(drawServiceSpy.baseCtx.canvas, event.offsetX - 1.5, event.offsetY - 2.5, 4, 4, 0, 0, 160, 160);
        expect(strokeRectSpy).toHaveBeenCalledWith(78, 78, 4, 4);
    });

    it('magnifyingPreview displays in inline-block if the cursor is inside the right or bottom edges of the canvas', () => {
        const event = {
            offsetX: 25,
            offsetY: 25,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 200;
        drawServiceSpy.baseCtx.canvas.height = 200;
        service.magnifyingPreview(event);
        expect(magnifierCtxStub.canvas.style.display).toEqual('inline-block');
    });

    it('magnifyingPreview does not display if the cursor is outside the right or bottom edges of the canvas', () => {
        const event = {
            offsetX: 25,
            offsetY: 25,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 10;
        drawServiceSpy.baseCtx.canvas.height = 10;
        service.magnifyingPreview(event);
        expect(magnifierCtxStub.canvas.style.display).toEqual('none');
    });

    it('magnifyingPreview does not display if the cursor on the toolbar', () => {
        const event = {} as MouseEvent;
        Object.defineProperty(MouseEvent, 'event.screenX', { value: 0 }); // event.screenX is a read-only value, thus it cannot be change. This branch cannot be tested.
        service.magnifyingPreview(event);
        expect(magnifierCtxStub.canvas.style.display.length).toEqual(0);
    });

    it('magnifyingPreview should not display when the cursor is above the canvas', () => {
        const event = {} as MouseEvent;
        Object.defineProperty(MouseEvent, ' drawServiceSpy.baseCtx.canvas.clientTop', { value: 200 });
        Object.defineProperty(MouseEvent, 'event.clientY', { value: 0 }); // event.clientY is a read-only value, thus it cannot be change. This branch cannot be tested.
        service.magnifyingPreview(event);
        expect(magnifierCtxStub.canvas.style.display.length).toEqual(0);
    });

    it('assignPrimaryColor should make drawingStarted true if the cursor is inside the right and bottom edges of the canvas and the ctx in parameters is baseCtx', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 200;
        drawServiceSpy.baseCtx.canvas.height = 200;
        service.assignPrimaryColor(mouseEventLClick, drawServiceSpy.baseCtx);
        expect(drawServiceSpy.drawingStarted).toEqual(true);
    });

    it('assignSecondaryColor should make drawingStarted true if the cursor is inside the right and bottom edges of the canvas and the ctx in parameters is baseCtx', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 200;
        drawServiceSpy.baseCtx.canvas.height = 200;
        service.assignSecondaryColor(mouseEventRClick, drawServiceSpy.baseCtx);
        expect(drawServiceSpy.drawingStarted).toEqual(true);
    });

    it('assignPrimaryColor should make selectedPosition take the same position as the cursor if the cursor is inside the right and bottom edges of the canvas', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 200;
        drawServiceSpy.baseCtx.canvas.height = 200;
        service.assignPrimaryColor(mouseEventLClick, drawServiceSpy.baseCtx);
        expect(service.selectedPosition.x).toEqual(25);
        expect(service.selectedPosition.y).toEqual(25);
    });

    it('assignSecondaryColor should make selectedPosition take the same position as the cursor if the cursor is inside the right and bottom edges of the canvas ', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 200;
        drawServiceSpy.baseCtx.canvas.height = 200;
        service.assignSecondaryColor(mouseEventRClick, drawServiceSpy.baseCtx);
        expect(service.selectedPosition.x).toEqual(25);
        expect(service.selectedPosition.y).toEqual(25);
    });

    it('assignPrimaryColor should not call getImageData and pushToQueueOnConfirm if the cursor is not inside the right and bottom edges of the canvas', () => {
        const getImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'drawImage').and.stub();
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 2;
        drawServiceSpy.baseCtx.canvas.height = 2;
        service.assignPrimaryColor(mouseEventLClick, drawServiceSpy.baseCtx);
        expect(getImageDataSpy).not.toHaveBeenCalled();
        expect(colorServiceSpy.pushToQueueOnConfirm).not.toHaveBeenCalled();
    });

    it('assignSecondaryColor should not call getImageData and pushToQueueOnConfirm if the cursor is not inside the right and bottom edges of the canvas', () => {
        const getImageDataSpy = spyOn(drawServiceSpy.baseCtx, 'drawImage').and.stub();
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        drawServiceSpy.baseCtx.canvas.width = 2;
        drawServiceSpy.baseCtx.canvas.height = 2;
        service.assignSecondaryColor(mouseEventRClick, drawServiceSpy.baseCtx);
        expect(getImageDataSpy).not.toHaveBeenCalled();
        expect(colorServiceSpy.pushToQueueOnConfirm).not.toHaveBeenCalled();
    });
});

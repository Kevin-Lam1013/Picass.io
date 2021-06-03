import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilCommandService } from './tool-commands/pencil-command.service';
import { ResizeCommandService } from './tool-commands/resize-command.service';
import { UndoRedoManagerService } from './undo-redo-manager.service';

describe('UndoRedoManagerService', () => {
    let service: UndoRedoManagerService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'clearBackground']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service = TestBed.inject(UndoRedoManagerService);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('stack should be empty', () => {
        const stack: UndoRedoCommand[] = [];
        expect(service.isEmpty(stack)).toBeTrue();
    });

    it('redoStack should be empty after clearRedoStack is called', () => {
        const command: PencilCommandService = new PencilCommandService();
        service.redoStack.push(command);
        service.clearRedoStack();
        expect(service.redoStack.length).toEqual(0);
    });

    it('resizeRedoStack should be empty after clearRedoStack is called', () => {
        const resize: Vec2 = { x: 500, y: 500 };
        service.resizeRedoStack.push(resize);
        service.clearRedoStack();
        expect(service.resizeRedoStack.length).toEqual(0);
    });

    it('undoStack should be empty after clearRedoStack is called', () => {
        const command: PencilCommandService = new PencilCommandService();
        service.undoStack.push(command);
        service.clearUndoStack();
        expect(service.undoStack.length).toEqual(0);
    });

    it('resizeUndoStack should be empty after clearRedoStack is called', () => {
        const resize: Vec2 = { x: 500, y: 500 };
        service.resizeUndoStack.push(resize);
        service.clearUndoStack();
        expect(service.resizeUndoStack.length).toEqual(0);
    });

    it('undoDisabled should be false after calling enableUndoRedo()', () => {
        service.undoDisabled = true;
        service.enableUndoRedo();
        expect(service.undoDisabled).toEqual(false);
    });

    it('redoDisabled should be false after calling enableUndoRedo()', () => {
        service.redoDisabled = true;
        service.enableUndoRedo();
        expect(service.redoDisabled).toEqual(false);
    });

    it('undoDisabled should be true after calling disableUndoRedo()', () => {
        service.undoDisabled = false;
        service.disableUndoRedo();
        expect(service.undoDisabled).toEqual(true);
    });

    it('redoDisabled should be true after calling disableUndoRedo()', () => {
        service.redoDisabled = false;
        service.disableUndoRedo();
        expect(service.redoDisabled).toEqual(true);
    });

    it('calling undo should push what was popped from undoStack onto redoStack if undoStack is not empty, undo is not disabled, the last undo isnt a resize', () => {
        const width = 15;
        const height = 25;
        const canvas = canvasTestHelper['createCanvas'](width, height);
        service['drawingService'].canvas = canvas;
        const pencilCommand: PencilCommandService = new PencilCommandService();
        service.undoStack = [pencilCommand];
        service.undoDisabled = false;
        service.resizeUndoStack = [];
        service.resizeRedoStack = [];
        service.undo();
        expect(service.undoStack.length).toEqual(0);
        expect(service.redoStack.length).toEqual(1);
    });

    it('executeAllCommand should call drawGrid and drawImage when the command is a resize', () => {
        const resizeCom = new ResizeCommandService(service['drawingService']);
        spyOn(resizeCom, 'copyCanvas').and.returnValue();
        spyOn(resizeCom, 'relocateHandles').and.returnValue();
        service.undoStack.push(resizeCom);
        service.resizeUndoStack.push({ x: 100, y: 100 });
        const imageSPy = spyOn(service, 'drawImage').and.returnValue();
        const gridSpy = spyOn(service, 'drawGrid').and.returnValue();
        service.executeAllPreviousCommands();
        expect(gridSpy).toHaveBeenCalled();
        expect(imageSPy).toHaveBeenCalled();
    });

    it('executeAllCommand should not call drawGrid and drawLine when the command isnt a resize', () => {
        const pencilCom = new PencilCommandService();
        spyOn(pencilCom, 'execute').and.returnValue();
        service.undoStack.push(pencilCom);
        service.resizeUndoStack.push({ x: 100, y: 100 });
        const imageSPy = spyOn(service, 'drawImage').and.returnValue();
        const gridSpy = spyOn(service, 'drawGrid').and.returnValue();
        service.executeAllPreviousCommands();
        expect(gridSpy).not.toHaveBeenCalled();
        expect(imageSPy).not.toHaveBeenCalled();
    });

    it('drawImage should call drawImage of the baseCtx', async (done) => {
        const drawSpy = spyOn(service['drawingService'].baseCtx, 'drawImage').and.returnValue();
        const resizeCom = new ResizeCommandService(service['drawingService']);
        service.drawImage(resizeCom);
        setTimeout(() => {
            expect(drawSpy).toHaveBeenCalled();
            done();
        }, 100);
    });

    it('drawGrid should call drawGrid of gridService', async (done) => {
        const gridSpy = spyOn(service.gridService, 'drawGrid').and.returnValue();
        service.gridService.isGridVisible = true;
        service.drawGrid();
        setTimeout(() => {
            expect(gridSpy).toHaveBeenCalled();
            done();
        }, 100);
    });

    it('drawGrid should not call drawGrid of gridService if gris is not visible', async (done) => {
        const gridSpy = spyOn(service.gridService, 'drawGrid').and.returnValue();
        service.gridService.isGridVisible = false;
        service.drawGrid();
        setTimeout(() => {
            expect(gridSpy).not.toHaveBeenCalled();
            done();
        }, 100);
    });

    it('undo should call drawGrid and drawImage when the command is a resize', () => {
        const resizeCom = new ResizeCommandService(service['drawingService']);
        spyOn(resizeCom, 'setPreview').and.returnValue();
        spyOn(resizeCom, 'execute').and.returnValue();
        service.undoStack.push(resizeCom);
        service.undoDisabled = false;
        service.resizeUndoStack.push({ x: 100, y: 100 });
        const imageSPy = spyOn(service, 'drawImage').and.returnValue();
        const gridSpy = spyOn(service, 'drawGrid').and.returnValue();
        service.undo();
        expect(gridSpy).toHaveBeenCalled();
        expect(imageSPy).toHaveBeenCalled();
    });

    it('redo should call drawGrid and drawImage when the command is a resize', () => {
        const resizeCom = new ResizeCommandService(service['drawingService']);
        spyOn(resizeCom, 'setPreview').and.returnValue();
        spyOn(resizeCom, 'execute').and.returnValue();
        service.redoStack.push(resizeCom);
        service.redoDisabled = false;
        service.resizeUndoStack.push({ x: 100, y: 100 });
        const imageSPy = spyOn(service, 'drawImage').and.returnValue();
        const gridSpy = spyOn(service, 'drawGrid').and.returnValue();
        service.redo();
        expect(gridSpy).toHaveBeenCalled();
        expect(imageSPy).toHaveBeenCalled();
    });

    it('redo should call not drawGrid and drawImage when the command isnt a resize', () => {
        const pencilCom = new PencilCommandService();
        spyOn(pencilCom, 'execute').and.returnValue();
        service.redoStack.push(pencilCom);
        service.redoDisabled = false;
        service.resizeUndoStack.push({ x: 100, y: 100 });
        const imageSPy = spyOn(service, 'drawImage').and.returnValue();
        const gridSpy = spyOn(service, 'drawGrid').and.returnValue();
        service.redo();
        expect(gridSpy).not.toHaveBeenCalled();
        expect(imageSPy).not.toHaveBeenCalled();
    });

    it('redo should call not drawGrid and drawImage when the stack is empty', () => {
        const imageSPy = spyOn(service, 'drawImage').and.returnValue();
        const gridSpy = spyOn(service, 'drawGrid').and.returnValue();
        service.redo();
        expect(gridSpy).not.toHaveBeenCalled();
        expect(imageSPy).not.toHaveBeenCalled();
    });

    it('redo should call resizeCommand.setPreview if drawingStarted (and the local storage is not empty)', () => {
        const resizeCom = new ResizeCommandService(service['drawingService']);
        const setPreviewSpy = spyOn(resizeCom, 'setPreview').and.returnValue();
        service['drawingService'].drawingStarted = true;
        localStorage.setItem('oldDrawing', 'https://homepages.cae.wisc.edu/~ece533/images/boat.png');
        service.redo();
        expect(setPreviewSpy).not.toHaveBeenCalled();
    });

    it('undo should not call drawImage if a drawing is not staring', () => {
        const resizeCom = new ResizeCommandService(service['drawingService']);
        const setPreviewSpy = spyOn(resizeCom, 'setPreview').and.stub();
        service['drawingService'].drawingStarted = false;
        service.undo();
        expect(setPreviewSpy).not.toHaveBeenCalled();
    });
});

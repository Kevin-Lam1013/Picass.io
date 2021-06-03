import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KeyboardShortcutManagerService } from './keyboard-shortcut-manager.service';

describe('KeyboardShortcutManagerService', () => {
    let service: KeyboardShortcutManagerService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpyObject: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        // tslint:disable:no-magic-numbers
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', ['clearRect']);
        drawingServiceSpy.previewCtx = ctxSpyObject;
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(KeyboardShortcutManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onKeyPress should call localShortcutHandler when the shortcut exists within the current tool', () => {
        service.toolManager.setTool(service.toolManager.rectangleService);
        const currentToolSpy = spyOn(service.toolManager.currentTool, 'localShortCutHandler').and.callThrough();
        service.onKeyPress('Shift');
        expect(currentToolSpy).toHaveBeenCalled();
    });

    it(' onKeyPress should call setTool when the shortcut does not exist within the current tool but it is used to change to another tool', () => {
        service.toolManager.setTool(service.toolManager.rectangleService);
        const toolManagerSpy = spyOn(service.toolManager, 'setTool');
        service.onKeyPress('e');
        expect(toolManagerSpy).toHaveBeenCalled();
    });

    it(' onKeyPress should not call setTool or localShortcutHandler if the shorcut does not exist', () => {
        const currentToolSpy = spyOn(service.toolManager.currentTool, 'localShortCutHandler');
        const toolManagerSpy = spyOn(service.toolManager, 'setTool');
        service.onKeyPress('!2_k');
        expect(toolManagerSpy).not.toHaveBeenCalled();
        expect(currentToolSpy).not.toHaveBeenCalled();
    });

    it(' onKeyPress should set the witdhValue of the tool manager when the shortcut is used to change to another tool', () => {
        service.toolManager.setTool(service.toolManager.rectangleService);
        service.toolManager.eraserService.toolStyles.lineWidth = 14;
        service.onKeyPress('e');
        expect(service.toolManager.widthValue).toEqual(14);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onKeyPress should do nothing if allowKeyPressEvents is false', () => {
        const hasSpy = spyOn(service.toolManager.currentTool.localShortcuts, 'has').and.stub();
        service.toolManager.allowKeyPressEvents = false;
        service.toolManager.currentTool = service.toolManager.pencilService;
        service.onKeyPress('e');
        expect(hasSpy).not.toHaveBeenCalled();
    });

    it('deleteHandler should call delete selection for  rectangle', () => {
        service.toolManager.rectangleSelection.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.rectangleSelection;
        const deleteSelectionSpy = spyOn(service.toolManager.rectangleSelection, 'deleteSelection').and.returnValue();
        service.deleteHandler(service.toolManager);
        expect(deleteSelectionSpy).toHaveBeenCalled();
    });

    it('deleteHandler should call delete selection for  ellipse', () => {
        service.toolManager.ellipseSelection.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.ellipseSelection;
        const deleteSelectionSpy = spyOn(service.toolManager.ellipseSelection, 'deleteSelection').and.returnValue();
        service.deleteHandler(service.toolManager);
        expect(deleteSelectionSpy).toHaveBeenCalled();
    });

    it('deleteHandler should call delete selection for  lasso', () => {
        service.toolManager.lassoService.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.lassoService;
        const deleteSelectionSpy = spyOn(service.toolManager.lassoService, 'deleteSelection').and.returnValue();
        service.deleteHandler(service.toolManager);
        expect(deleteSelectionSpy).toHaveBeenCalled();
    });

    it('copyHandler should call copy selection for  rectangle', () => {
        service.toolManager.rectangleSelection.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.rectangleSelection;
        const copySelectionSpy = spyOn(service.toolManager.rectangleSelection, 'copySelection').and.returnValue();
        service.copyHandler(service.toolManager);
        expect(copySelectionSpy).toHaveBeenCalled();
    });

    it('copyHandler should call copy selection for  ellipse', () => {
        service.toolManager.ellipseSelection.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.ellipseSelection;
        const copySelectionSpy = spyOn(service.toolManager.ellipseSelection, 'copySelection').and.returnValue();
        service.copyHandler(service.toolManager);
        expect(copySelectionSpy).toHaveBeenCalled();
    });

    it('copyHandler should call copy selection for lasso', () => {
        service.toolManager.lassoService.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.lassoService;
        const copySelectionSpy = spyOn(service.toolManager.lassoService, 'copySelection').and.returnValue();
        service.copyHandler(service.toolManager);
        expect(copySelectionSpy).toHaveBeenCalled();
    });

    it('pasteHandler should call delete selection for  rectangle', () => {
        service.toolManager.rectangleSelection.clipboardService.alreadyCopied = true;
        service.toolManager.currentTool = service.toolManager.rectangleSelection;
        const pasteSelectionSpy = spyOn(service.toolManager.rectangleSelection, 'pasteSelection').and.returnValue();
        service.pasteHandler(service.toolManager);
        expect(pasteSelectionSpy).toHaveBeenCalled();
    });

    it('pasteHandler should call delete selection for  ellipse', () => {
        service.toolManager.ellipseSelection.clipboardService.alreadyCopied = true;
        service.toolManager.currentTool = service.toolManager.ellipseSelection;
        const pasteSelectionSpy = spyOn(service.toolManager.ellipseSelection, 'pasteSelection').and.returnValue();
        service.pasteHandler(service.toolManager);
        expect(pasteSelectionSpy).toHaveBeenCalled();
    });

    it('pasteHandler should call delete selection for  lasso', () => {
        service.toolManager.lassoService.clipboardService.alreadyCopied = true;
        service.toolManager.currentTool = service.toolManager.lassoService;
        const pasteSelectionSpy = spyOn(service.toolManager.lassoService, 'pasteSelection').and.returnValue();
        service.pasteHandler(service.toolManager);
        expect(pasteSelectionSpy).toHaveBeenCalled();
    });

    it('cutHandler should call copy selection for  rectangle', () => {
        service.toolManager.rectangleSelection.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.rectangleSelection;
        const copySelectionSpy = spyOn(service.toolManager.rectangleSelection, 'copySelection').and.returnValue();
        const deleteSelectionSpy = spyOn(service.toolManager.rectangleSelection, 'deleteSelection').and.returnValue();
        service.cutHandler(service.toolManager);
        expect(copySelectionSpy).toHaveBeenCalled();
        expect(deleteSelectionSpy).toHaveBeenCalled();
    });

    it('cutHandler should call copy selection for  ellipse', () => {
        service.toolManager.ellipseSelection.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.ellipseSelection;
        const copySelectionSpy = spyOn(service.toolManager.ellipseSelection, 'copySelection').and.returnValue();
        const deleteSelectionSpy = spyOn(service.toolManager.ellipseSelection, 'deleteSelection').and.returnValue();
        service.cutHandler(service.toolManager);
        expect(copySelectionSpy).toHaveBeenCalled();
        expect(deleteSelectionSpy).toHaveBeenCalled();
    });

    it('cutHandler should call copy selection for lasso', () => {
        service.toolManager.lassoService.currentlySelecting = true;
        service.toolManager.currentTool = service.toolManager.lassoService;
        const copySelectionSpy = spyOn(service.toolManager.lassoService, 'copySelection').and.returnValue();
        const deleteSelectionSpy = spyOn(service.toolManager.lassoService, 'deleteSelection').and.returnValue();
        service.cutHandler(service.toolManager);
        expect(copySelectionSpy).toHaveBeenCalled();
        expect(deleteSelectionSpy).toHaveBeenCalled();
    });

    it('magnetismHandler should call switchOnOrOff for  rectangle', () => {
        service.toolManager.currentTool = service.toolManager.rectangleSelection;
        const magnetismSpy = spyOn(service.toolManager.rectangleSelection.magnetismService, 'switchOnOrOff').and.returnValue();
        service.magnetismHandler(service.toolManager);
        expect(magnetismSpy).toHaveBeenCalled();
    });

    it('magnetismHandler should call switchOnOrOff for  ellipse', () => {
        service.toolManager.currentTool = service.toolManager.ellipseSelection;
        const magnetismSpy = spyOn(service.toolManager.ellipseSelection.magnetismService, 'switchOnOrOff').and.returnValue();
        service.magnetismHandler(service.toolManager);
        expect(magnetismSpy).toHaveBeenCalled();
    });

    it('magnetismHandler should call switchOnOrOff for  lasso', () => {
        service.toolManager.currentTool = service.toolManager.lassoService;
        const magnetismSpy = spyOn(service.toolManager.lassoService.magnetismService, 'switchOnOrOff').and.returnValue();
        service.magnetismHandler(service.toolManager);
        expect(magnetismSpy).toHaveBeenCalled();
    });

    it('textToolShortcutListener should call all key shortcuts of textService', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const onKeyDownSpy = spyOn(service.toolManager.textService, 'onKeyDown').and.returnValue();
        const enterKeySpy = spyOn(service.toolManager.textService, 'enterKey').and.returnValue();
        const escapeKeySpy = spyOn(service.toolManager.textService, 'escapeKey').and.returnValue();
        const arrowUpSpy = spyOn(service.toolManager.textService, 'arrowUp').and.returnValue();
        const arrowDownSpy = spyOn(service.toolManager.textService, 'arrowDown').and.returnValue();
        const arrowLeftSpy = spyOn(service.toolManager.textService, 'arrowLeft').and.returnValue();
        const arrowRightSpy = spyOn(service.toolManager.textService, 'arrowRight').and.returnValue();
        const backspaceKeySpy = spyOn(service.toolManager.textService, 'backspaceKey').and.returnValue();
        const deleteKeySpy = spyOn(service.toolManager.textService, 'deleteKey').and.returnValue();
        service.textToolShortcutListener(service.toolManager, keyEvent);
        expect(onKeyDownSpy).toHaveBeenCalled();
        expect(enterKeySpy).toHaveBeenCalled();
        expect(escapeKeySpy).toHaveBeenCalled();
        expect(arrowUpSpy).toHaveBeenCalled();
        expect(arrowDownSpy).toHaveBeenCalled();
        expect(arrowLeftSpy).toHaveBeenCalled();
        expect(arrowRightSpy).toHaveBeenCalled();
        expect(backspaceKeySpy).toHaveBeenCalled();
        expect(deleteKeySpy).toHaveBeenCalled();
    });
});

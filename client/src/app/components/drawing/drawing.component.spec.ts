import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil-service';
import { ShortcutEventOutput, ShortcutInput } from 'ng-keyboard-shortcuts';

class ToolStub extends Tool {}

const TIMEOUT_WAIT = 15000;

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let drawingStub: DrawingService;

    // Configuration du spy
    // tslint:disable:no-string-literal
    // tslint:disable:no-magic-numbers
    // tslint:disable:max-file-line-count
    // tslint:disable:no-empty

    beforeEach(async(() => {
        toolStub = new ToolStub({} as DrawingService);
        drawingStub = new DrawingService();

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PencilService, useValue: toolStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a default WIDTH and HEIGHT', () => {
        const height = component.height;
        const width = component.width;
        expect(height).toEqual(component.autoSaveService.getSavedCanvasSize().y);
        expect(width).toEqual(component.autoSaveService.getSavedCanvasSize().x);
    });

    it('should get stubTool', () => {
        const currentTool = component.currentTool;
        expect(currentTool).toEqual(toolStub);
    });

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const event = { pageX: 10000000 } as MouseEvent;
        const mouseEventSpy = spyOn(component.currentTool, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it('onMouseMove should call ellipse onMouseMove if its the current tool and mouse is down', () => {
        const event = {} as MouseEvent;
        const ellipseMouseMoveSpy = spyOn(component.toolManager.ellipseService, 'onMouseMove').and.stub();
        component.toolManager.setTool(component.toolManager.ellipseService);
        component.toolManager.ellipseService.mouseDown = true;
        component.onMouseMove(event);
        expect(ellipseMouseMoveSpy).toHaveBeenCalled();
    });

    it('onMouseMove should change the cursor dependingly on the current tool (if stamp, then none)', () => {
        const event = {} as MouseEvent;
        component.toolManager.setTool(component.toolManager.stampService);
        component.onMouseMove(event);
        expect(component.baseCanvas.nativeElement.style.cursor).toBe('none');
        expect(component.previewCanvas.nativeElement.style.cursor).toBe('none');
        expect(component.gridCanvas.nativeElement.style.cursor).toBe('none');
        expect(component.backgroundLayer.nativeElement.style.cursor).toBe('none');
    });

    it('onMouseMove should change the cursor dependingly on the current tool (if noTool, then default)', () => {
        const event = {} as MouseEvent;
        component.toolManager.setTool(component.toolManager.noToolService);
        component.onMouseMove(event);
        expect(component.baseCanvas.nativeElement.style.cursor).toBe('default');
        expect(component.previewCanvas.nativeElement.style.cursor).toBe('default');
        expect(component.gridCanvas.nativeElement.style.cursor).toBe('default');
        expect(component.backgroundLayer.nativeElement.style.cursor).toBe('default');
    });

    it(" should call the tool's mouse down when receiving a mouse down event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse up when receiving a mouse up event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(' ngAfterViewInit should add 5 event listeners', () => {
        const enventListenerSpy = spyOn(window, 'addEventListener').and.callThrough();
        component.ngAfterViewInit();
        expect(enventListenerSpy).toHaveBeenCalledTimes(5);
    });

    it('component should call keyupHandler on keyup if currentTool is ellipseSelection or rectangleSelection', () => {
        const mockArrowUp = new KeyboardEvent('keyup', { key: 'ArrowUp' });
        const mockArrowDown = new KeyboardEvent('keyup', { key: 'ArrowDown' });
        const mockArrowLeft = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
        const mockArrowRight = new KeyboardEvent('keyup', { key: 'ArrowRight' });
        component.toolManager.currentTool = component.toolManager.ellipseSelection;
        const keyupHandlerSpy = spyOn(component.toolManager.ellipseSelection, 'keyupHandler').and.callThrough();
        component.toolManager.ellipseSelection.offsetYModifier = 0;
        component.toolManager.ellipseSelection.offsetXModifier = 0;

        window.dispatchEvent(mockArrowUp);
        setTimeout(() => {
            return;
        }, 200);

        window.dispatchEvent(mockArrowDown);
        setTimeout(() => {
            return;
        }, 200);

        window.dispatchEvent(mockArrowLeft);
        setTimeout(() => {
            return;
        }, 200);

        window.dispatchEvent(mockArrowRight);
        setTimeout(() => {
            return;
        }, 200);

        expect(keyupHandlerSpy).toHaveBeenCalledTimes(4);
        expect(component.toolManager.ellipseSelection.offsetYModifier).toEqual(0);
        expect(component.toolManager.ellipseSelection.offsetXModifier).toEqual(0);
    });

    it('component should call onMouseWheel when the mouse wheel is being turned if currentTool is stampService', () => {
        component.toolManager.currentTool = component.toolManager.stampService;
        const onMouseWheelSpy = spyOn(component.toolManager.stampService, 'onMouseWheel').and.callThrough();
        // dispatching a wheelEvent
        // https://stackoverflow.com/questions/6756331/chrome-dispatching-wheel-event
        const wheelEvent = document.createEvent('WheelEvent');
        wheelEvent.initEvent('mousewheel', true, true);
        window.dispatchEvent(wheelEvent);
        component.toolManager.stampService.onMouseWheel(wheelEvent);
        setTimeout(() => {
            return;
        }, 200);
        expect(onMouseWheelSpy).toHaveBeenCalled();
        expect(onMouseWheelSpy).toHaveBeenCalledWith(wheelEvent);
    });

    it(' onMouseClick should call onMouseClick of current tool if there is a single click', async (done) => {
        const event = {} as MouseEvent;
        const onMouseCLickSpy = spyOn(component.toolManager.currentTool, 'onMouseClick').and.callThrough();
        component.onMouseClick(event);
        setTimeout(() => {
            expect(onMouseCLickSpy).toHaveBeenCalled();
            done();
        }, component.timeOutDuration);
    });

    it('onMouseClick does nothing if clickCount != 1', () => {
        component.clickCount = -1;
        const event = {} as MouseEvent;
        const onMouseCLickSpy = spyOn(component.toolManager.currentTool, 'onMouseClick').and.stub();
        component.onMouseClick(event);
        expect(onMouseCLickSpy).not.toHaveBeenCalled();
    });

    it(' onMouseClick should call onDoubleClick of current tool if there is a double click', async (done) => {
        const event = {} as MouseEvent;
        const onDoubleCLickSpy = spyOn(component.toolManager.currentTool, 'onDoubleClick').and.callThrough();
        component.onMouseClick(event);
        setTimeout(() => {
            expect(onDoubleCLickSpy).not.toHaveBeenCalled();
            component.clickCount++;
            done();
        }, component.timeOutDuration / 16);

        setTimeout(() => {
            expect(onDoubleCLickSpy).toHaveBeenCalled();
            done();
        }, TIMEOUT_WAIT);
    });

    it(' onMouseClick should reset the click count to 0 after processing the event', async (done) => {
        const event = {} as MouseEvent;
        component.onMouseClick(event);
        setTimeout(() => {
            expect(component.clickCount).toEqual(0);
            done();
        }, component.timeOutDuration);
    });

    it(' ngAfterViewInit should call preventDefault', async (done) => {
        const event = new MouseEvent('contextmenu');
        const preventDefaultSpy = spyOn(event, 'preventDefault').and.callThrough();
        component.ngAfterViewInit();
        window.dispatchEvent(event);
        setTimeout(() => {
            expect(preventDefaultSpy).toHaveBeenCalled();
            done();
        }, 50);
    });

    it(' ngAfterViewInit should make baseCtx white and call fillRect', () => {
        component.baseCanvas.nativeElement.width = 5;
        component.baseCanvas.nativeElement.height = 1555;
        const fillRectSpy = spyOn(component['baseCtx'], 'fillRect').and.callThrough();
        component.ngAfterViewInit();
        expect(component['baseCtx'].fillStyle).toEqual('#ffffff');
        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 5, 1555);
    });

    it(' ctrl + a should call setTool of toolManager', () => {
        const ctrlA = component.shortcuts.find((x) => x.key === 'ctrl + a');
        const ctrlO = component.shortcuts.find((x) => x.key === 'ctrl + o');
        const ctrlOSpy = spyOn(ctrlO as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' });
        const setToolSpy = spyOn(component.toolManager, 'setTool').and.callThrough();
        ctrlA?.command({ event: keyboardEvent, key: 'a' } as ShortcutEventOutput);
        expect(setToolSpy).toHaveBeenCalled();
        expect(ctrlOSpy).not.toHaveBeenCalled();
    });

    it(' ctrl + z should call undo of undoRedoManager', () => {
        const ctrlZ = component.shortcuts.find((x) => x.key === 'ctrl + z');
        const ctrlA = component.shortcuts.find((x) => x.key === 'ctrl + a');
        const ctrlASpy = spyOn(ctrlA as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'z' });
        const undoSpy = spyOn(component.undoRedoManager, 'undo').and.callThrough();
        ctrlZ?.command({ event: keyboardEvent, key: 'z' } as ShortcutEventOutput);
        expect(undoSpy).toHaveBeenCalled();
        expect(ctrlASpy).not.toHaveBeenCalled();
    });

    it('del should call deleteSelection when the current tool is rectangleSelection and is currently selection', () => {
        component.toolManager.rectangleSelection.currentlySelecting = true;
        component.toolManager.currentTool = component.toolManager.rectangleSelection;
        const del = component.shortcuts.find((x) => x.key === 'del');
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: false, key: 'del' });
        const deleSelectionSpy = spyOn(component.shortcutKeyboardManager, 'deleteHandler').and.returnValue();
        del?.command({ event: keyboardEvent, key: 'del' } as ShortcutEventOutput);
        expect(deleSelectionSpy).toHaveBeenCalled();
    });

    it('ctrl + c should call copySelection when the currentTool is rectangleSelection and is currently selecting', () => {
        component.toolManager.rectangleSelection.currentlySelecting = true;
        component.toolManager.currentTool = component.toolManager.rectangleSelection;
        const ctrlC = component.shortcuts.find((x) => x.key === 'ctrl + c');
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'c' });
        const copySelectionSpy = spyOn(component.shortcutKeyboardManager, 'copyHandler').and.returnValue();
        ctrlC?.command({ event: keyboardEvent, key: 'c' } as ShortcutEventOutput);
        expect(copySelectionSpy).toHaveBeenCalled();
    });

    it('ctrl + v shoudl call pasteSelection when the current tool is rectangleSelection and the clipboard is not empty', () => {
        component.toolManager.rectangleSelection.clipboardService.alreadyCopied = true;
        component.toolManager.currentTool = component.toolManager.rectangleSelection;
        const ctrlV = component.shortcuts.find((x) => x.key === 'ctrl + v');
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'v' });
        const pasteSelectionSpy = spyOn(component.shortcutKeyboardManager, 'pasteHandler').and.returnValue();
        ctrlV?.command({ event: keyboardEvent, key: 'v' } as ShortcutEventOutput);
        expect(pasteSelectionSpy).toHaveBeenCalled();
    });

    it('ctrl + x shoudl call copySlection and deleteSelection when the currentTool is rectangleSelection and is currently selecting', () => {
        component.toolManager.rectangleSelection.currentlySelecting = true;
        component.toolManager.currentTool = component.toolManager.rectangleSelection;
        const ctrlX = component.shortcuts.find((x) => x.key === 'ctrl + x');
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'x' });
        const copySelectionSpy = spyOn(component.shortcutKeyboardManager, 'cutHandler').and.returnValue();
        ctrlX?.command({ event: keyboardEvent, key: 'x' } as ShortcutEventOutput);
        expect(copySelectionSpy).toHaveBeenCalled();
    });

    it('m should call swithOnOrOff to set to true isActivated when he is initually false when the current tool is rectangleSelection', () => {
        component.toolManager.currentTool = component.toolManager.rectangleSelection;
        const mKey = component.shortcuts.find((x) => x.key === 'm');
        const switchOnOrOffSpy = spyOn(component.shortcutKeyboardManager, 'magnetismHandler').and.returnValue();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: false, key: 'm' });
        mKey?.command({ event: keyboardEvent, key: 'm' } as ShortcutEventOutput);
        expect(switchOnOrOffSpy).toHaveBeenCalled();
    });

    it(' ctrl + shift + z should call  call redo of undoRedoManager', () => {
        const ctrlShiftZ = component.shortcuts.find((x) => x.key === 'ctrl + shift + z');
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'z' });
        const redoSpy = spyOn(component.undoRedoManager, 'redo').and.returnValue();
        ctrlShiftZ?.command({ event: keyboardEvent, key: 'z' } as ShortcutEventOutput);
        expect(redoSpy).toHaveBeenCalled();
    });

    it('addEvenListener when it is keyup should call keyupHandler when the current tool is rectangleSelection', () => {
        const mockKeyUp = new KeyboardEvent('keyup', { key: 'e' });
        component.toolManager.currentTool = component.toolManager.rectangleSelection;
        const keyupHandlerSpy = spyOn(component.toolManager.rectangleSelection, 'keyupHandler').and.returnValue();
        window.dispatchEvent(mockKeyUp);
        setTimeout(() => {
            return;
        }, 200);
        component.ngAfterViewInit();
        expect(keyupHandlerSpy).toHaveBeenCalled();
    });

    it('addEventListener when there is a wheel event should call onMouseWHeel when the current tool is stampService', () => {
        const mockWheelEvent = new WheelEvent('wheel', {});
        const onMouseWheelSpy = spyOn(component.toolManager.stampService, 'onMouseWheel').and.returnValue();
        component.toolManager.currentTool = component.toolManager.stampService;
        window.dispatchEvent(mockWheelEvent);
        setTimeout(() => {
            return;
        }, 200);
        component.ngAfterViewInit();
        expect(onMouseWheelSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call resize and disableUndoRedo when mouseDOwn is true', () => {
        component.resizeServiceCommand.mouseDown = true;
        component.toolManager.currentTool = component.toolManager.pencilService;
        const event = { pageX: 10000000 } as MouseEvent;
        const resizeSpy = spyOn(component.resizeServiceCommand, 'resize').and.returnValue();
        const disableUndoRedoSpy = spyOn(component.undoRedoManager, 'disableUndoRedo').and.returnValue();
        component.onMouseMove(event);
        expect(resizeSpy).toHaveBeenCalled();
        expect(disableUndoRedoSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call disableUndoRedo and startResize when mouseDown is true', () => {
        component.resizeServiceCommand.mouseDown = true;
        component.toolManager.currentTool = component.toolManager.pencilService;
        const event = { pageX: 10000000 } as MouseEvent;
        const startResizeSpy = spyOn(component.resizeServiceCommand, 'startResize').and.returnValue();
        const disableUndoRedoSpy = spyOn(component.undoRedoManager, 'disableUndoRedo').and.returnValue();
        component.onMouseDown(event);
        expect(startResizeSpy).toHaveBeenCalled();
        expect(disableUndoRedoSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call clearRedoStack, enableUndoRedo and resetSideBools', () => {
        const event = { pageX: 10000000 } as MouseEvent;
        component.resizeServiceCommand.mouseDown = true;
        const clearRedoStackSpy = spyOn(component.undoRedoManager, 'clearRedoStack').and.returnValue();
        const enableUndoRedoSpy = spyOn(component.undoRedoManager, 'enableUndoRedo').and.returnValue();
        const resetSideBoolsSpy = spyOn(component.resizeServiceCommand, 'resetSideBools').and.returnValue();
        component.onMouseUp(event);
        expect(clearRedoStackSpy).toHaveBeenCalled();
        expect(enableUndoRedoSpy).toHaveBeenCalled();
        expect(resetSideBoolsSpy).toHaveBeenCalled();
    });

    it(' ctrl + o should call clearArrays of toolManager', () => {
        const ctrlO = component.shortcuts.find((x) => x.key === 'ctrl + o');
        const ctrlA = component.shortcuts.find((x) => x.key === 'ctrl + a');
        const ctrlASpy = spyOn(ctrlA as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'o' });
        spyOn(window, 'confirm').and.returnValue(true);
        const clearArraysSpy = spyOn(component.toolManager, 'clearArrays').and.callThrough();
        const reloadSpy = spyOn(component, 'reload').and.callFake(() => {});
        component.toolManager.newDrawing = true;
        ctrlO?.command({ event: keyboardEvent, key: 'o' } as ShortcutEventOutput);
        expect(clearArraysSpy).toHaveBeenCalled();
        expect(component.canvasSize).toEqual({ x: 1000, y: 800 });
        expect(reloadSpy).toHaveBeenCalled();
        expect(ctrlASpy).not.toHaveBeenCalled();
    });

    it(' f5 should call save the drawing and then call reload()', () => {
        const f5 = component.shortcuts.find((x) => x.key === 'f5');
        const ctrlA = component.shortcuts.find((x) => x.key === 'ctrl + a');
        const ctrlASpy = spyOn(ctrlA as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'f5' });
        const saveDrawingSpy = spyOn(component.autoSaveService, 'saveDrawing').and.stub();
        const reloadSpy = spyOn(component, 'reload').and.callFake(() => {});
        f5?.command({ event: keyboardEvent, key: 'f5' } as ShortcutEventOutput);
        setTimeout(() => {
            expect(saveDrawingSpy).toHaveBeenCalled();
            expect(reloadSpy).toHaveBeenCalled();
        }, 1000);
        expect(ctrlASpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should call clearRedoStack, enableUndoRedo and resetSideBools', async (done) => {
        const event = { pageX: 10000000 } as MouseEvent;
        component.resizeServiceCommand.mouseDown = true;
        component.gridService.isGridVisible = true;
        const gridSpy = spyOn(component.gridService, 'drawGrid').and.returnValue();

        component.onMouseUp(event);

        setTimeout(() => {
            expect(gridSpy).toHaveBeenCalled();
            done();
        }, 1000);
    });
});

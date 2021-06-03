import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MouseButton } from '@app/enums/enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from './text.service';
import { TextCommandService } from './tool-commands/text-command.service';

describe('TextService', () => {
    let service: TextService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
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
        service = TestBed.inject(TextService);
        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        // tslint:disable *
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('reverseBold should set bold to true if bold is initially false and to call clearAndDrawPreview', () => {
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.bold = false;
        service.reverseBold();
        expect(service.bold).toBeTruthy();
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('reverseBold should set bold to false if bold is initially true and to call clearAndDrawPreview', () => {
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.bold = true;
        service.reverseBold();
        expect(service.bold).toBeFalsy();
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('reverseItalic should set italic to true if bold is initially false and to call clearAndDrawPreview', () => {
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.italic = false;
        service.reverseItalic();
        expect(service.italic).toBeTruthy();
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('reverseItalic should set italic to false if bold is initially true and to call clearAndDrawPreview', () => {
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.italic = true;
        service.reverseItalic();
        expect(service.italic).toBeFalsy();
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('changeFontSize should set fontSize to given value and to call clearAndDrawPreview', () => {
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.fontSize = 0;
        service.changeFontSize(30);
        expect(service.fontSize).toEqual(30);
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('changeFont should set font to given value and to call clearAndDrawPreview', () => {
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.font = 'Arial';
        service.changeFont('Times New Roman');
        expect(service.font).toEqual('Times New Roman');
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('changeAlignment should set alignment to given value and to call clearAndDrawPreview', () => {
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.alignment = 'left';
        service.changeAlignment('right');
        expect(service.alignment).toEqual('right');
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('resetState should call clearCanvas', () => {
        service.resetState();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('resetState should call drawText', () => {
        service.textArray = ['hello'];
        const drawTextSpy = spyOn(service, 'drawText');
        service.resetState();
        expect(drawTextSpy).toHaveBeenCalled();
    });

    it('resetState should push a new command into the undoStack', () => {
        service.textArray = ['hello'];
        service.undoRedoManager.undoStack = [];
        service.resetState();
        expect(service.undoRedoManager.undoStack.length).toEqual(1);
    });

    it('resetState should call clearRedoStack of undoRedoManager', () => {
        service.textArray = ['hello'];
        const clearRedoStackSpy = spyOn(service.undoRedoManager, 'clearRedoStack');
        service.resetState();
        expect(clearRedoStackSpy).toHaveBeenCalled();
    });

    it('resetState should set cursorPosition to 0,0', () => {
        service.cursorPosition = { x: 5, y: 5 };
        service.resetState();
        expect(service.cursorPosition).toEqual({ x: 0, y: 0 });
    });

    it('resetState should set hasBeenReset to true', () => {
        service.hasBeenReset = false;
        service.resetState();
        expect(service.hasBeenReset).toBeTruthy();
    });

    it('resetState should set creatingTextBox to false', () => {
        service.creatingTextBox = true;
        service.resetState();
        expect(service.creatingTextBox).toBeFalsy();
    });

    it('resetState should call clearArrays', () => {
        const clearArraysSpy = spyOn(service, 'clearArrays');
        service.resetState();
        expect(clearArraysSpy).toHaveBeenCalled();
    });

    it('resetState should set textBoxActive to false', () => {
        service.textBoxActive = true;
        service.resetState();
        expect(service.textBoxActive).toBeFalsy();
    });

    it('checkIfInsideRectangle should return true if mouseDown is within text box', () => {
        const mouseDown = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
        ];
        service.checkIfInsideRectangle(mouseDown);
        expect(service.checkIfInsideRectangle(mouseDown)).toEqual(true);
    });

    it('clearArrays should empty textArray', () => {
        service.textArray = ['hello'];
        service.clearArrays();
        expect(service.textArray).toEqual(['']);
    });

    it('clearArrays should empty currentLine', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
        ];
        service.clearArrays();
        expect(service.currentLine).toEqual([]);
    });

    it('onMouseDown should disable UndoRedo if mouseDown is true', () => {
        const mouseDown = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.undoRedoManager.undoDisabled = false;
        service.undoRedoManager.redoDisabled = false;
        service.onMouseDown(mouseDown);
        expect(service.undoRedoManager.undoDisabled).toBeTruthy();
        expect(service.undoRedoManager.redoDisabled).toBeTruthy();
    });

    it('onMouseDown shouldnt disable UndoRedo if mouseDown is false', () => {
        const mouseDown = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
        service.undoRedoManager.undoDisabled = false;
        service.undoRedoManager.redoDisabled = false;
        service.onMouseDown(mouseDown);
        expect(service.undoRedoManager.undoDisabled).toBeFalsy();
        expect(service.undoRedoManager.redoDisabled).toBeFalsy();
    });

    it('onMouseDown should call resetState if mouse is down and box is drawn', () => {
        const resetStateSpy = spyOn(service, 'resetState');
        const mouseDown = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseDown(mouseDown);
        expect(resetStateSpy).toHaveBeenCalled();
    });

    it('onMouseDown should call resetState if mouse is down and box is drawn', () => {
        const resetStateSpy = spyOn(service, 'resetState');
        spyOn(service, 'checkIfInsideRectangle').and.returnValue(true);
        const mouseDown = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseDown(mouseDown);
        expect(resetStateSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should set mouseDownCoord as the current mouse position if currentLine is empty', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        const mouseDown = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.currentLine = [];
        service.onMouseDown(mouseDown);
        expect(service.mouseDownCoord).toEqual({ x: 25, y: 25 });
    });

    it('onMouseDown should set startingPoint as mouseDownCoord if currentLine is empty', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.startingPoint = { x: 50, y: 30 };
        const mouseDown = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.currentLine = [];
        service.onMouseDown(mouseDown);
        expect(service.startingPoint).toEqual({ x: 25, y: 25 });
    });

    it('onMouseMove should disable UndoRedo if mouseDown is true, resize not active and hasnt been reset', () => {
        const mouseMove = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.undoRedoManager.undoDisabled = false;
        service.undoRedoManager.redoDisabled = false;
        service.onMouseMove(mouseMove);
        expect(service.undoRedoManager.undoDisabled).toBeTruthy();
        expect(service.undoRedoManager.redoDisabled).toBeTruthy();
    });

    it('onMouseMove shouldnt disable UndoRedo if mouseDown is false, resize not active and hasnt been reset', () => {
        const mouseMove = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
        service.mouseDown = false;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.undoRedoManager.undoDisabled = false;
        service.undoRedoManager.redoDisabled = false;
        service.onMouseMove(mouseMove);
        expect(service.undoRedoManager.undoDisabled).toBeFalsy();
        expect(service.undoRedoManager.redoDisabled).toBeFalsy();
    });

    it('onMouseMove should set hasBeenReset to false', () => {
        const mouseMove = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.onMouseMove(mouseMove);
        expect(service.hasBeenReset).toBeFalsy();
    });

    it('onMouseMove set endpoint as current mouse position', () => {
        const mouseMove = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.onMouseMove(mouseMove);
        expect(service.endPoint).toEqual({ x: 25, y: 25 });
    });

    it('onMouseMove set currentLine as [startingpoint, endpoint]', () => {
        service.startingPoint = { x: 0, y: 0 };
        const mouseMove = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.onMouseMove(mouseMove);
        expect(service.currentLine).toEqual([
            { x: 0, y: 0 },
            { x: 25, y: 25 },
        ]);
    });

    it('onMouseMove should call clearCanvas', () => {
        const mouseMove = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.onMouseMove(mouseMove);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMouseMove should call drawTextBox', () => {
        const drawTextBoxSpy = spyOn(service, 'drawTextBox');
        const mouseMove = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.onMouseMove(mouseMove);
        expect(drawTextBoxSpy).toHaveBeenCalled();
    });

    it('onMouseUp should enable UndoRedo if mouseDown is true, resize not active', () => {
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        drawingServiceSpy.resizeActive = false;
        service.undoRedoManager.undoDisabled = true;
        service.undoRedoManager.redoDisabled = true;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseUp(mouseUp);
        expect(service.undoRedoManager.undoDisabled).toBeFalsy();
        expect(service.undoRedoManager.redoDisabled).toBeFalsy();
    });

    it('onMouseUp shouldnt enable UndoRedo if mouseDown is false, resize active', () => {
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
        service.mouseDown = false;
        drawingServiceSpy.resizeActive = true;
        service.undoRedoManager.undoDisabled = true;
        service.undoRedoManager.redoDisabled = true;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseUp(mouseUp);
        expect(service.undoRedoManager.undoDisabled).toBeTruthy();
        expect(service.undoRedoManager.redoDisabled).toBeTruthy();
    });

    it('onMouseUp should set endPoint as current mousePosition if textBox isnt active and not in rectangle', () => {
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        drawingServiceSpy.resizeActive = false;
        service.hasBeenReset = false;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.textBoxActive = false;
        service.onMouseUp(mouseUp);
        expect(service.endPoint).toEqual({ x: 25, y: 25 });
    });

    it('onMouseUp shouldnt set endPoint as current mousePosition if textBox is active and not in rectangle', () => {
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        drawingServiceSpy.resizeActive = false;
        service.hasBeenReset = false;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.textBoxActive = true;
        service.onMouseUp(mouseUp);
        expect(service.endPoint).not.toEqual({ x: 25, y: 25 });
    });

    it('onMouseUp should set hasBeenReset and mouseDown to false if hasBeenReset is true', () => {
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        drawingServiceSpy.resizeActive = false;
        service.hasBeenReset = false;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseUp(mouseUp);
        expect(service.hasBeenReset).toBeFalsy();
        expect(service.mouseDown).toBeFalsy();
    });

    it('onMouseUp should set hasBeenReset and mouseDown to false if hasBeenReset is true and return true', () => {
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        spyOn(service.undoRedoManager, 'enableUndoRedo').and.returnValue();
        service.mouseDown = true;
        drawingServiceSpy.resizeActive = false;
        service.hasBeenReset = true;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseUp(mouseUp);
        expect(service.hasBeenReset).toBeFalsy();
        expect(service.mouseDown).toBeFalsy();
    });

    it('onMouseUp set endpoint as current mouse position', () => {
        service.endPoint = { x: 0, y: 0 };
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseUp(mouseUp);
        expect(service.endPoint).toEqual({ x: 25, y: 25 });
    });

    it('onMouseUp set currentLine as [startingpoint, endpoint]', () => {
        service.startingPoint = { x: 0, y: 0 };
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseUp(mouseUp);
        expect(service.currentLine).toEqual([
            { x: 0, y: 0 },
            { x: 25, y: 25 },
        ]);
    });

    it('onMouseUp should set mouseDown to false', () => {
        service.startingPoint = { x: 0, y: 0 };
        const mouseUp = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.onMouseUp(mouseUp);
        expect(service.mouseDown).toBeFalsy();
    });

    it('drawTextBox should set textBoxActive to true', () => {
        service.mouseDown = true;
        service.hasBeenReset = false;
        drawingServiceSpy.resizeActive = false;
        service.currentLine = [
            { x: 30, y: 30 },
            { x: 50, y: 50 },
        ];
        service.drawTextBox(previewCtxStub, service.currentLine);
        expect(service.textBoxActive).toBeTruthy();
    });

    it('enterKey should increment cursorPosition.y', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 0, y: 0 };
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.enterKey(keyEvent);
        expect(service.cursorPosition.y).toEqual(1);
    });

    it('enterKey should split the word at cursorPosition.y at a given cursorPosition.x index', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 1, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.enterKey(keyEvent);
        expect(service.textArray).toEqual(['h', 'ello']);
    });

    it('enterKey should set the cursorPosition.x index to 0', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 1, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.enterKey(keyEvent);
        expect(service.cursorPosition.x).toEqual(0);
    });

    it('enterKey should expand textBox vertically when reached the bottom of the textbox', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 1, y: 0 };
        service.textArray = ['hello', 'how', 'are', 'you'];
        service.fontSize = 30;
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 20, y: 20 };
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.enterKey(keyEvent);
        expect(service.endPoint.y).toEqual(50);
    });

    it('enterKey shouldnt expand textBox vertically when reached the bottom of the textbox if key is wrong', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 1, y: 0 };
        service.textArray = ['hello'];
        service.fontSize = 30;
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 20, y: 70 };
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.enterKey(keyEvent);
        expect(service.endPoint.y).toEqual(70);
    });

    it('enterKey shouldnt expand textBox vertically when it hasnt reached the bottom of the textbox if key is right', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 1, y: 0 };
        service.textArray = ['hello'];
        service.fontSize = 30;
        service.startingPoint = { x: 0, y: 0 };
        service.endPoint = { x: 20, y: 70 };
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.enterKey(keyEvent);
        expect(service.endPoint.y).toEqual(70);
    });

    it('enterKey should call clearAndDrawPreview', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 1, y: 0 };
        service.textArray = ['hello'];
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.enterKey(keyEvent);
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('Backspace should reduce the cursorPosition.x index by 1', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.backspaceKey(keyEvent);
        expect(service.cursorPosition.x).toEqual(4);
    });

    it('Backspace should remove the last letter of the text at a textArray[cursorPosition.y]', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.backspaceKey(keyEvent);
        expect(service.textArray[service.cursorPosition.y]).toEqual('hell');
    });

    it('Backspace shouldnt remove the last letter of the text at a textArray[cursorPosition.y] if key is wrong', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.backspaceKey(keyEvent);
        expect(service.textArray[service.cursorPosition.y]).toEqual('hello');
    });

    it('Backspace should call clearAndDrawPreview', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.textArray = ['hello'];
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.backspaceKey(keyEvent);
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('Delete should reduce the text length by 1', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Delete' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 4, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.deleteKey(keyEvent);
        expect(service.textArray[0].length).toEqual(4);
    });

    it('Delete shouldnt reduce the text length by 1 if key is wrong', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 4, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.deleteKey(keyEvent);
        expect(service.textArray[0].length).toEqual(5);
    });

    it('Backspace should remove the last letter of the text at a textArray[cursorPosition.y]', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.textArray = ['hello'];
        spyOn(service, 'clearAndDrawPreview').and.stub();
        service.backspaceKey(keyEvent);
        expect(service.textArray[service.cursorPosition.y]).toEqual('hell');
    });

    it('Escape should call clearCanvas', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.escapeKey(keyEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('Escape should set textBoxActive to false', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.escapeKey(keyEvent);
        expect(service.textBoxActive).toBeFalsy();
    });

    it('Escape should call clearArrays', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        const clearArraysSpy = spyOn(service, 'clearArrays');
        service.escapeKey(keyEvent);
        expect(clearArraysSpy).toHaveBeenCalled();
    });

    it('Escape should reset cursorPosition', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.escapeKey(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 0, y: 0 });
    });

    it('Escape shouldnt reset cursorPosition if key is wrong', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 0 };
        service.escapeKey(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 5, y: 0 });
    });

    it('ArrowUp should decrement cursorPosition.y and call clearAndDrawPreview', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 1 };
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowUp(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 5, y: 0 });
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('ArrowUp shouldnt decrement cursorPosition.y and not call clearAndDrawPreview if key is incorrect', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 1 };
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowUp(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 5, y: 1 });
        expect(clearAndDrawPreviewSpy).not.toHaveBeenCalled();
    });

    it('ArrowDown should increment cursorPosition.y and call clearAndDrawPreview', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 1 };
        service.textArray.length = 3;
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowDown(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 5, y: 2 });
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('ArrowDown shouldnt increment cursorPosition.y and not call clearAndDrawPreview if key is incorrect', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 1 };
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowDown(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 5, y: 1 });
        expect(clearAndDrawPreviewSpy).not.toHaveBeenCalled();
    });

    it('ArrowLeft should decrement cursorPosition.x and call clearAndDrawPreview', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 1 };
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowLeft(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 4, y: 1 });
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('ArrowLeft shouldnt decrement cursorPosition.x and not call clearAndDrawPreview if key is incorrect', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 5, y: 1 };
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowLeft(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 5, y: 1 });
        expect(clearAndDrawPreviewSpy).not.toHaveBeenCalled();
    });

    it('ArrowRight should increment cursorPosition.x and call clearAndDrawPreview', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 4, y: 1 };
        service.textArray[1] = 'hello';
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowRight(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 5, y: 1 });
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('ArrowRight shouldnt increment cursorPosition.x and not call clearAndDrawPreview if the key is incorrect', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 4, y: 1 };
        service.textArray[1] = 'hello';
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.arrowRight(keyEvent);
        expect(service.cursorPosition).toEqual({ x: 4, y: 1 });
        expect(clearAndDrawPreviewSpy).not.toHaveBeenCalled();
    });

    it('switchStartingAndEndPoints should switch endPoint.x and startingPoint.x if startingPoint.x is greater than endPoint.x', () => {
        service.startingPoint = { x: 20, y: 10 };
        service.endPoint = { x: 10, y: 20 };
        service.switchStartingAndEndPoints();
        expect(service.startingPoint).toEqual({ x: 10, y: 10 });
        expect(service.endPoint).toEqual({ x: 20, y: 20 });
    });

    it('switchStartingAndEndPoints should switch endPoint.y and startingPoint.y if startingPoint.y is greater than endPoint.y', () => {
        service.startingPoint = { x: 10, y: 20 };
        service.endPoint = { x: 20, y: 10 };
        service.switchStartingAndEndPoints();
        expect(service.startingPoint).toEqual({ x: 10, y: 10 });
        expect(service.endPoint).toEqual({ x: 20, y: 20 });
    });

    it('drawText should call setColors', () => {
        const setColorsSpy = spyOn(service, 'setColors');
        const textCommand = new TextCommandService();
        service.drawText(baseCtxStub, textCommand);
        expect(setColorsSpy).toHaveBeenCalled();
    });

    it('drawText should call switchStartingAndEndPoints', () => {
        const switchStartingAndEndPointsSpy = spyOn(service, 'switchStartingAndEndPoints');
        const textCommand = new TextCommandService();
        service.drawText(baseCtxStub, textCommand);
        expect(switchStartingAndEndPointsSpy).toHaveBeenCalled();
    });

    it('drawText should call setTextAttributes of textCommand', () => {
        const textCommand = new TextCommandService();
        const setTextAttributesSpy = spyOn(textCommand, 'setTextAttributes');
        service.drawText(baseCtxStub, textCommand);
        expect(setTextAttributesSpy).toHaveBeenCalled();
    });

    it('drawText should call execute of textCommand', () => {
        const textCommand = new TextCommandService();
        const executeSpy = spyOn(textCommand, 'execute');
        service.drawText(baseCtxStub, textCommand);
        expect(executeSpy).toHaveBeenCalled();
    });

    it('checkIfInKeyArray should return true if key exists in array', () => {
        const array = ['hello', 'my', 'name', 'is', 'Bob'];
        const key = 'Bob';
        service.checkIfInKeyArray(key, array);
        expect(service.checkIfInKeyArray(key, array)).toBeTruthy();
    });

    it('checkIfInKeyArray should return false if key doesnt exists in array', () => {
        const array = ['hello', 'my', 'name', 'is', 'Bob'];
        const key = 'Joe';
        service.checkIfInKeyArray(key, array);
        expect(service.checkIfInKeyArray(key, array)).toBeFalsy();
    });

    it('clearAndDrawPreview should call clearCanvas', () => {
        service.textBoxActive = true;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.clearAndDrawPreview();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('clearAndDrawPreview shouldnt call clearCanvas if text box isnt active', () => {
        service.textBoxActive = false;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.clearAndDrawPreview();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('clearAndDrawPreview should call drawTextBox', () => {
        const drawTextBoxSpy = spyOn(service, 'drawTextBox');
        service.textBoxActive = true;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.clearAndDrawPreview();
        expect(drawTextBoxSpy).toHaveBeenCalled();
    });

    it('clearAndDrawPreview should call drawText', () => {
        const drawTextSpy = spyOn(service, 'drawText');
        service.textBoxActive = true;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.clearAndDrawPreview();
        expect(drawTextSpy).toHaveBeenCalled();
    });

    it('clearAndDrawPreview should call drawCursor', () => {
        const drawCursorSpy = spyOn(service, 'drawCursor');
        service.textBoxActive = true;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.clearAndDrawPreview();
        expect(drawCursorSpy).toHaveBeenCalled();
    });

    it('onKeyDown should add a letter to textArray at cursorPosition.y', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.onKeyDown(keyEvent);
        expect(service.textArray[service.cursorPosition.y]).toEqual('Bob');
    });

    it('onKeyDown should increment cursorPosition.x', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.onKeyDown(keyEvent);
        expect(service.cursorPosition.x).toEqual(3);
    });

    it('onKeyDown shouldnt increment cursorPosition.x if textbox isnt active', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = false;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.onKeyDown(keyEvent);
        expect(service.cursorPosition.x).toEqual(2);
    });

    it('onKeyDown shouldnt increment cursorPosition.x if textbox is active but key is in useful or useless key arrays', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'F1' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.onKeyDown(keyEvent);
        expect(service.cursorPosition.x).toEqual(2);
    });

    it('onKeyDown should increase endpoint if alignment is left and text is larger than textbox', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.startingPoint = { x: 10, y: 20 };
        service.endPoint = { x: 10, y: 20 };
        service.fontSize = 30;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.alignment = 'left';
        service.onKeyDown(keyEvent);
        expect(service.endPoint.x).toEqual(40);
    });

    it('onKeyDown shouldnt increase endpoint if alignment is left and text isnt larger than textbox', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.startingPoint = { x: 10, y: 20 };
        service.endPoint = { x: 50, y: 20 };
        service.fontSize = 30;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.alignment = 'left';
        service.onKeyDown(keyEvent);
        expect(service.endPoint.x).toEqual(50);
    });

    it('onKeyDown should decrement startingPoint if alignment is right and text is larger than textbox', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.startingPoint = { x: 10, y: 20 };
        service.endPoint = { x: 10, y: 20 };
        service.fontSize = 30;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.alignment = 'right';
        service.onKeyDown(keyEvent);
        expect(service.startingPoint.x).toEqual(-20);
    });

    it('onKeyDown should decrement startingPoint and increment endpoint by half if alignment is center and text is larger than textbox', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.startingPoint = { x: 10, y: 20 };
        service.endPoint = { x: 10, y: 20 };
        service.fontSize = 30;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.alignment = 'center';
        service.onKeyDown(keyEvent);
        expect(service.startingPoint.x).toEqual(-5);
        expect(service.endPoint.x).toEqual(25);
    });

    it('onKeyDown should call clearAndDrawPreview', () => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        service.textBoxActive = true;
        service.cursorPosition = { x: 2, y: 0 };
        service.textArray = ['Bo'];
        service.startingPoint = { x: 10, y: 20 };
        service.endPoint = { x: 10, y: 20 };
        service.fontSize = 30;
        service.currentLine = [
            { x: 10, y: 20 },
            { x: 10, y: 20 },
        ];
        service.alignment = 'center';
        const clearAndDrawPreviewSpy = spyOn(service, 'clearAndDrawPreview');
        service.onKeyDown(keyEvent);
        expect(clearAndDrawPreviewSpy).toHaveBeenCalled();
    });

    it('drawCursor should call setLineDash', () => {
        const setLineDashSpy = spyOn(drawingServiceSpy.previewCtx, 'setLineDash');
        service.drawCursor();
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('drawCursor should call beginPath', () => {
        const beginPathSpy = spyOn(drawingServiceSpy.previewCtx, 'beginPath');
        service.drawCursor();
        expect(beginPathSpy).toHaveBeenCalled();
    });

    it('drawCursor should call moveTo and lineTo if alignment is left', () => {
        const moveToSpy = spyOn(drawingServiceSpy.previewCtx, 'moveTo');
        const lineToSpy = spyOn(drawingServiceSpy.previewCtx, 'lineTo');
        service.alignment = 'left';
        service.drawCursor();
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('drawCursor should call moveTo and lineTo if alignment is right', () => {
        const moveToSpy = spyOn(drawingServiceSpy.previewCtx, 'moveTo');
        const lineToSpy = spyOn(drawingServiceSpy.previewCtx, 'lineTo');
        service.alignment = 'right';
        service.drawCursor();
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('drawCursor should call moveTo and lineTo if alignment is center', () => {
        const moveToSpy = spyOn(drawingServiceSpy.previewCtx, 'moveTo');
        const lineToSpy = spyOn(drawingServiceSpy.previewCtx, 'lineTo');
        service.alignment = 'center';
        service.drawCursor();
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
    });

    it('drawCursor should call stroke', () => {
        const strokeSpy = spyOn(drawingServiceSpy.previewCtx, 'stroke');
        service.drawCursor();
        expect(strokeSpy).toHaveBeenCalled();
    });
});

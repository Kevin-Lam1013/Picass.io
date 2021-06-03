import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolManagerService } from './tool-manager.service';

describe('ToolManagerService', () => {
    let service: ToolManagerService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpyObject: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']); // un genre de proxy
        ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', ['fillStyle', 'fillRect', 'canvas']);
        drawingServiceSpy.baseCtx = ctxSpyObject;
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(ToolManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // source : https://stackoverflow.com/questions/52091882/angular-unit-testing-subject
    it(' setTool should call the next() method to set the Subject', () => {
        const nextSpy = spyOn(service.currentToolChange, 'next').and.stub();
        service.setTool(service.lineService);
        expect(nextSpy).toHaveBeenCalled();
    });

    it(' setTool should call resetState from textService if current tool is textService', () => {
        service.currentTool = service.textService;
        const resetStateSpy = spyOn(service.textService, 'resetState');
        service.setTool(service.pencilService);
        expect(resetStateSpy).toHaveBeenCalled();
    });

    it(' setTool should set current tool to line', () => {
        service.setTool(service.lineService);
        expect(service.currentTool).toEqual(service.lineService);
    });

    it(' setTool should set current tool to eraser', () => {
        service.setTool(service.eraserService);
        expect(service.currentTool).toEqual(service.eraserService);
    });

    it(' setTool should set current tool to pencil', () => {
        service.setTool(service.pencilService);
        expect(service.currentTool).toEqual(service.pencilService);
    });

    it(' setTool should set current tool to rectangle', () => {
        service.setTool(service.rectangleService);
        expect(service.currentTool).toEqual(service.rectangleService);
    });

    it(' setTool should set current tool to ellipse', () => {
        service.setTool(service.ellipseService);
        expect(service.currentTool).toEqual(service.ellipseService);
    });

    it(' setTool should set current tool to rectangle', () => {
        service.setTool(service.pipetteService);
        expect(service.currentTool).toEqual(service.pipetteService);
    });

    it(' setTool should call setColors', () => {
        const setColorSpy = spyOn(service.eraserService, 'setColors');
        service.setTool(service.eraserService);
        expect(setColorSpy).toHaveBeenCalled();
    });

    it(' clearArrays should call clearCanvas twice when the client has confirmed his choice to start a new drawing', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        drawingServiceSpy.drawingStarted = true;
        service.clearArrays();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledTimes(2);
    });

    it(' clearArrays should not call clearCanvaswhen the client has not confirmed his choice to start a new drawing', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        drawingServiceSpy.drawingStarted = true;
        service.clearArrays();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it(' clearArrays should call clearArrays for every tool when the client has confirmed his choice to start a new drawing', () => {
        spyOn(window, 'confirm').and.returnValue(true);

        for (const tool of service.tools) {
            drawingServiceSpy.drawingStarted = true;
            const clearArraySpy = spyOn(tool, 'clearArrays');
            service.clearArrays();
            expect(clearArraySpy).toHaveBeenCalled();
        }
    });

    it(' clearArrays should set drawingStarted to false when the client has confirmed his choice to start a new drawing ', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        drawingServiceSpy.drawingStarted = true;
        service.clearArrays();
        expect(drawingServiceSpy.drawingStarted).toEqual(false);
    });

    it('disableShortcut should set allowKeyPressEvents to false', () => {
        service.allowKeyPressEvents = true;
        service.disableShortcut();
        expect(service.allowKeyPressEvents).toEqual(false);
    });

    it('enableShortcut should set allowKeyPressEvents to true', () => {
        service.allowKeyPressEvents = false;
        service.enableShortcut();
        expect(service.allowKeyPressEvents).toEqual(true);
    });

    it(' onPressPalette should toggle the showPallet value', () => {
        service.showPalette = false;
        service.onPressPalette();
        expect(service.showPalette).toEqual(true);
        service.onPressPalette();
        expect(service.showPalette).toEqual(false);
    });

    it('uptadeSliderWidth should uptade the widthValue of the toolManager with the width of the current tool', () => {
        service.setTool(service.pencilService);
        service.currentTool.toolStyles.lineWidth = 10;
        service.updateSliderWidth();
        expect(service.widthValue).toEqual(10);
    });

    it(' disableShortcut shouls set allowKeyPressEvent to false', () => {
        service.allowKeyPressEvents = true;
        service.disableShortcut();
        expect(service.allowKeyPressEvents).toEqual(false);
    });

    it(' enableShortcut shouls set allowKeyPressEvent to true', () => {
        service.allowKeyPressEvents = false;
        service.enableShortcut();
        expect(service.allowKeyPressEvents).toEqual(true);
    });

    it(' rotateStamp sets the rotationAngle of the stamp service', () => {
        service.rotateStamp(50);
        expect(service.stampService.rotationAngle).toEqual(50);
    });

    it(' changeStamp size sets the stampSize of the stamp service', () => {
        service.changeStampSize(75);
        expect(service.stampService.stampSize).toEqual(75);
    });

    it(' setStampStyle sets the stamp image of the stamp service', () => {
        service.setStampStyle(5);
        expect(service.stampService.stampName).toEqual('assets/5.png');
    });

    it(' flipNonTooldBools should set nonTools to false if it was true', () => {
        service.nonTools = true;
        service.flipNonToolBool();
        expect(service.nonTools).toBeFalse();
    });

    it(' showSaveDrawing should set showSaveMenu to false if it was true', () => {
        service.showSaveMenu = true;
        service.showSaveDrawing();
        expect(service.showSaveMenu).toBeFalse();
    });
});

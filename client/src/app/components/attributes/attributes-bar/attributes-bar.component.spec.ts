import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ExportDrawingComponent } from '@app/components/export-drawing/export-drawing.component';
import { FormComponent } from '@app/components/form/form.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutEventOutput, ShortcutInput } from 'ng-keyboard-shortcuts';
import { AttributesBarComponent } from './attributes-bar.component';

class MatDialogMock {
    // tslint:disable-next-line:no-any
    openDialogs: MatDialogRef<any>[] = [];
    open(): {} {
        return {};
    }
}

describe('AttributesBarComponent', () => {
    let component: AttributesBarComponent;
    let fixture: ComponentFixture<AttributesBarComponent>;
    // tslint:disable:no-magic-numbers
    // tslint:disable:max-file-line-count
    // tslint:disable:no-empty
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpyObject: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        drawingServiceSpy.canvas = document.createElement('canvas');
        ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'moveTo',
            'lineTo',
            'stroke',
        ]);
        drawingServiceSpy.gridCtx = ctxSpyObject;
        TestBed.configureTestingModule({
            declarations: [AttributesBarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributesBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.modal = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('setRectangleStyle puts fill to true and contour to false when n = 1', () => {
        component.setRectangleStyle('1');
        expect(component.toolManager.rectangleService.toolStyles.fill).toEqual(true);
        expect(component.toolManager.rectangleService.contour).toEqual(false);
    });

    it('setRectangleStyle puts fill to false and contour to true when n = 2', () => {
        component.setRectangleStyle('2');
        expect(component.toolManager.rectangleService.toolStyles.fill).toEqual(false);
        expect(component.toolManager.rectangleService.contour).toEqual(true);
    });

    it('setRectangleStyle puts fill to true and contour to true when n = 3', () => {
        component.setRectangleStyle('3');
        expect(component.toolManager.rectangleService.toolStyles.fill).toEqual(true);
        expect(component.toolManager.rectangleService.contour).toEqual(true);
    });

    it('setEllipseStyle puts fill to true and contour to false when n = 1', () => {
        component.setEllipseStyle('1');
        expect(component.toolManager.ellipseService.toolStyles.fill).toEqual(true);
        expect(component.toolManager.ellipseService.border).toEqual(false);
    });

    it('setEllipseStyle puts fill to false and contour to true when n = 2', () => {
        component.setEllipseStyle('2');
        expect(component.toolManager.ellipseService.toolStyles.fill).toEqual(false);
        expect(component.toolManager.ellipseService.border).toEqual(true);
    });

    it('setEllipseStyle puts fill to true and contour to true when anything else than 0 and 1', () => {
        component.setEllipseStyle('3');
        expect(component.toolManager.ellipseService.toolStyles.fill).toEqual(true);
        expect(component.toolManager.ellipseService.border).toEqual(true);
    });

    it(' setLineJunction puts hasJunction of line service to false if n = 0', () => {
        component.setLineJunction('0');
        expect(component.toolManager.lineService.hasJunction).toEqual(false);
    });

    it(' setLineJunction puts hasJunction to true if n != 0', () => {
        component.setLineJunction('1');
        expect(component.toolManager.lineService.hasJunction).toEqual(true);
    });

    it(' changeDiametre sets the diameter of the line service', () => {
        component.changeDiameter(10);
        expect(component.toolManager.lineService.currentDiameter).toEqual(10);
    });

    it(' setLineJunction puts hasJunction to false is n = 0', () => {
        component.setLineJunction('0');
        expect(component.toolManager.lineService.hasJunction).toEqual(false);
    });

    it(' changeWidth should call changeWidth of the current tool', () => {
        const changeWidhtSpy = spyOn(component.toolManager.currentTool, 'changeWidth').and.callThrough();
        component.changeWidth(25);
        expect(changeWidhtSpy).toHaveBeenCalled();
    });

    it(' changeWidth should the widht of the tool manager', () => {
        component.changeWidth(25);
        expect(component.toolManager.widthValue).toEqual(25);
    });

    it(' changeEmissionRate should call the emissionRate of the airbrushService', () => {
        component.changeEmissionRate(25);
        expect(component.toolManager.airbrushService.emissionRate).toEqual(25);
    });

    it(' changeJetDiameter should change the diameter of the spray jet', () => {
        component.changeJetDiameter(1.5);
        expect(component.toolManager.airbrushService.jetDiameter).toEqual(1.5);
    });

    it(' changeDropletDiameter should the droplet diameter of the spray in airbushService', () => {
        component.changeDropletDiameter(0.2);
        expect(component.toolManager.airbrushService.dropletDiameter).toEqual(0.2);
    });

    it('setPolygonStyle puts fill to true and contour to false when n = 1', () => {
        component.setPolygonStyle('1');
        expect(component.toolManager.polygonService.toolStyles.fill).toEqual(true);
        expect(component.toolManager.polygonService.contour).toEqual(false);
    });

    it('setPolygonStyle puts fill to false and contour to true when n = 2', () => {
        component.setPolygonStyle('2');
        expect(component.toolManager.polygonService.toolStyles.fill).toEqual(false);
        expect(component.toolManager.polygonService.contour).toEqual(true);
    });

    it('setPolygonStyle puts fill to true and contour to true when n = 3', () => {
        component.setPolygonStyle('3');
        expect(component.toolManager.polygonService.toolStyles.fill).toEqual(true);
        expect(component.toolManager.polygonService.contour).toEqual(true);
    });

    it('export should open a modal window for the ExportDrawingComponent', () => {
        spyOn(component.modal, 'open').and.callThrough();
        component.export();
        expect(component.modal.open).toHaveBeenCalledWith(ExportDrawingComponent);
    });

    it('openSaveDrawingForm should open a modal window for the FormComponent', () => {
        spyOn(component.modal, 'open').and.callThrough();
        component.openSaveDrawingForm();
        expect(component.modal.open).toHaveBeenCalledWith(FormComponent);
    });

    it('openCarousel should open a modal window', () => {
        spyOn(component.modal, 'open').and.callThrough();
        component.openCarousel();
        expect(component.modal.open).toHaveBeenCalled();
    });

    it(' ctrl + g should call openCarousel but should not open the grid', () => {
        const ctrlG = component.shortcuts.find((x) => x.key === 'ctrl + g');
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'g' });
        const openCarouselSpy = spyOn(component, 'openCarousel').and.callThrough();
        const showGridSpy = spyOn(component.gridService, 'showGrid').and.callThrough();
        ctrlG?.command({ event: keyboardEvent, key: 'g' } as ShortcutEventOutput);
        expect(openCarouselSpy).toHaveBeenCalled();
        expect(showGridSpy).not.toHaveBeenCalled(); // not opening the grid
    });

    it(' ctrl + s should open the savingDrawingForm modal', () => {
        const ctrlS = component.shortcuts.find((x) => x.key === 'ctrl + s');
        const ctrlG = component.shortcuts.find((x) => x.key === 'ctrl + g');
        const ctrlGSpy = spyOn(ctrlG as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 's' });
        const openSaveDrawingFormSpy = spyOn(component, 'openSaveDrawingForm').and.callThrough();
        ctrlS?.command({ event: keyboardEvent, key: 's' } as ShortcutEventOutput);
        expect(openSaveDrawingFormSpy).toHaveBeenCalled();
        expect(ctrlGSpy).not.toHaveBeenCalled();
    });

    it(' ctrl + e should open the exportDrawing modal', () => {
        const ctrlE = component.shortcuts.find((x) => x.key === 'ctrl + e');
        const ctrlG = component.shortcuts.find((x) => x.key === 'ctrl + g');
        const ctrlGSpy = spyOn(ctrlG as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'e' });
        const exportSpy = spyOn(component, 'export').and.callThrough();
        ctrlE?.command({ event: keyboardEvent, key: 'e' } as ShortcutEventOutput);
        expect(exportSpy).toHaveBeenCalled();
        expect(ctrlGSpy).not.toHaveBeenCalled();
    });

    it('the shortcut = should call increaseSquareSizebyByFactor', () => {
        component.gridService.isGridVisible = true;
        component.toolManager.textService.textBoxActive = false;
        const equals = component.shortcuts.find((x) => x.key === '=');
        const ctrlG = component.shortcuts.find((x) => x.key === 'ctrl + g');
        const ctrlGSpy = spyOn(ctrlG as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: false, key: '=' });
        const exportSpy = spyOn(component.gridService, 'increaseSquareSizebyByFactor').and.callThrough();
        equals?.command({ event: keyboardEvent, key: '=' } as ShortcutEventOutput);
        expect(exportSpy).toHaveBeenCalled();
        expect(ctrlGSpy).not.toHaveBeenCalled();
    });

    it('shift + = ou = should call increaseSquareSizebyByFactor', () => {
        component.gridService.isGridVisible = true;
        component.toolManager.textService.textBoxActive = false;
        const ctrlEquals = component.shortcuts.find((x) => x.key === 'plus');
        const ctrlG = component.shortcuts.find((x) => x.key === 'ctrl + g');
        const ctrlGSpy = spyOn(ctrlG as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { shiftKey: true, key: 'plus' });
        const increaseSquareSizebyByFactorSpy = spyOn(component.gridService, 'increaseSquareSizebyByFactor').and.callThrough();
        ctrlEquals?.command({ event: keyboardEvent, key: '=' } as ShortcutEventOutput);
        expect(increaseSquareSizebyByFactorSpy).toHaveBeenCalled();
        expect(ctrlGSpy).not.toHaveBeenCalled();
    });

    it('the shortcut - should call decreaseSquareSizebyByFactor', () => {
        component.gridService.isGridVisible = true;
        component.toolManager.textService.textBoxActive = false;
        const equals = component.shortcuts.find((x) => x.key === '-');
        const ctrlG = component.shortcuts.find((x) => x.key === 'ctrl + g');
        const ctrlGSpy = spyOn(ctrlG as ShortcutInput, 'command').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: false, key: '-' });
        const decreaseSquareSizebyByFactorSpy = spyOn(component.gridService, 'decreaseSquareSizebyByFactor').and.callThrough();
        equals?.command({ event: keyboardEvent, key: '-' } as ShortcutEventOutput);
        expect(decreaseSquareSizebyByFactorSpy).toHaveBeenCalled();
        expect(ctrlGSpy).not.toHaveBeenCalled();
    });

    it('startNewDrawing should call clearArrays from the tool manager and reload the page', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const clearArraySpy = spyOn(component.toolManager, 'clearArrays').and.stub();
        component.toolManager.newDrawing = true;
        const reloadSpy = spyOn(component, 'reload').and.callFake(() => {});
        component.startNewDrawing();
        expect(clearArraySpy).toHaveBeenCalled();
        setTimeout(() => {
            expect(reloadSpy).toHaveBeenCalled();
        }, 500);
    });
});

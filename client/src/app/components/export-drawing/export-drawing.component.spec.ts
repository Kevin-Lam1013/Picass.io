import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportDrawingComponent } from './export-drawing.component';

@Injectable()
export class MockElementRef {
    nativeElement: {};
}

describe('ExportDrawingComponent', () => {
    let component: ExportDrawingComponent;
    let fixture: ComponentFixture<ExportDrawingComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let dummyCanvas: ElementRef<HTMLCanvasElement>;
    const dummyNativeElement = document.createElement('canvas');

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        drawingServiceSpy.clearCanvas.and.returnValue();
        drawingServiceSpy.canvas = document.createElement('canvas');
        dummyCanvas = new ElementRef<HTMLCanvasElement>(dummyNativeElement);

        TestBed.configureTestingModule({
            declarations: [ExportDrawingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                FormBuilder,
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialog, useValue: {} },
                { provide: MatSnackBar, useValue: {} },
            ],
        }).compileComponents();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('localExport calls toDataURL() from the canvas', () => {
        const exportDrawingSpy = spyOn(component, 'localExport').and.callThrough();
        component.filterPreviewCanvas = dummyCanvas;
        const toDataURLSpy = spyOn(component.filterPreviewCanvas.nativeElement, 'toDataURL').and.stub();
        component.localExport();
        expect(exportDrawingSpy).toHaveBeenCalled();
        expect(toDataURLSpy).toHaveBeenCalled();
    });

    it('applyFilter calls  drawImageOnFilterPreviewCanvas() once', () => {
        const drawImageOnFilterPreviewCanvasSpy = spyOn(component, 'drawImageOnFilterPreviewCanvas').and.callThrough();
        component.applyFilter();
        expect(drawImageOnFilterPreviewCanvasSpy).toHaveBeenCalled();
    });

    it('applyFilter changed the filter on the canvas before drawing on it', () => {
        component.filterPreviewCtx.filter = 'sepia(30%)';
        component.filterControl = new FormControl('grayscale(100%)', [Validators.required]);
        component.applyFilter();
        expect(component.filterPreviewCtx.filter).toEqual('grayscale(100%)');
    });

    it('disableShortcut should put allowKeyPressEvent to false', () => {
        component.disableShortcut();
        expect(component['toolManager'].allowKeyPressEvents).toEqual(false);
    });

    it('enableShortcut should put allowKeyPressEvent to ture', () => {
        component.enableShortcut();
        expect(component['toolManager'].allowKeyPressEvents).toEqual(true);
    });

    it('imgurExport should call toDataUrl from the canvas', async (done) => {
        component.filterPreviewCanvas = dummyCanvas;
        const toDataURLSpy = spyOn(component.filterPreviewCanvas.nativeElement, 'toDataURL').and.callThrough();
        const openSnackBarSpy = spyOn(component, 'openSnackBar').and.stub();
        component.imgurExport();
        setTimeout(() => {
            expect(toDataURLSpy).toHaveBeenCalled();
            expect(openSnackBarSpy).toHaveBeenCalled();
            done();
        }, 1000);
    });

    it('imgurExport should call openSnackBar', async (done) => {
        const openSnackBarSpy = spyOn(component, 'openSnackBar').and.stub();
        component.imgurExport();
        setTimeout(() => {
            expect(openSnackBarSpy).toHaveBeenCalled();
            done();
        }, 500);
    });

    it('exportDrawing should call localExport if destination is local', () => {
        const localExportSpy = spyOn(component, 'localExport').and.stub();
        Object.defineProperty(component.fileDestinationControl, 'value', { value: 'local' });
        component.exportDrawing();
        expect(localExportSpy).toHaveBeenCalled();
    });

    it('exportDrawing should call imgurExport if destination isnt local', () => {
        const imgurExportSpy = spyOn(component, 'imgurExport').and.stub();
        Object.defineProperty(component.fileDestinationControl, 'value', { value: '!local' });
        component.exportDrawing();
        expect(imgurExportSpy).toHaveBeenCalled();
    });
});

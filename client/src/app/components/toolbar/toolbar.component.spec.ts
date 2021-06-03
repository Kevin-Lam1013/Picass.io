import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutEventOutput, ShortcutInput } from 'ng-keyboard-shortcuts';
import { ToolbarComponent } from './toolbar.component';

class MatDialogMock {
    // tslint:disable-next-line:no-any
    openDialogs: MatDialogRef<any>[] = [];
    open(): {} {
        return {};
    }
}

describe('ToolbarComponent', () => {
    // tslint:disable:no-magic-numbers
    // tslint:disable:max-file-line-count
    let component: ToolbarComponent;
    let fixture: ComponentFixture<ToolbarComponent>;
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
            declarations: [ToolbarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        jasmine.clock().install();
        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' the shortcut g should call showGrid but should not open the carrousel', () => {
        const g = component.shortcuts.find((x) => x.key === 'g');
        const gSpy = spyOn(g as ShortcutInput, 'command').and.callThrough();
        const showGridSpy = spyOn(component.gridService, 'showGrid').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'g' });
        g?.command({ event: keyboardEvent, key: 'g' } as ShortcutEventOutput);
        expect(gSpy).toHaveBeenCalled();
        expect(showGridSpy).toHaveBeenCalled();
    });

    it(' the shortcut g shouldnt call showGrid if textbox is active', () => {
        const g = component.shortcuts.find((x) => x.key === 'g');
        component.toolManager.textService.textBoxActive = true;
        const gSpy = spyOn(g as ShortcutInput, 'command').and.callThrough();
        const showGridSpy = spyOn(component.gridService, 'showGrid').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { ctrlKey: true, key: 'g' });
        g?.command({ event: keyboardEvent, key: 'g' } as ShortcutEventOutput);
        expect(gSpy).toHaveBeenCalled();
        expect(showGridSpy).not.toHaveBeenCalled();
    });

    it('undo should call undo from undo-redo manager and to save the drawing after 1 second of waiting (and not before)', () => {
        const undoSpy = spyOn(component.undoRedoManager, 'undo').and.stub();
        const autoSaveSpy = spyOn(component.autoSave, 'saveDrawingDefault').and.stub();
        component.undo();
        expect(undoSpy).toHaveBeenCalled();
        expect(autoSaveSpy).not.toHaveBeenCalled();
        jasmine.clock().tick(1001);
        expect(autoSaveSpy).toHaveBeenCalled();
    });

    it('redo should call redo from undo-redo manager and to save the drawing after 1 second of waiting (and not before)', () => {
        const redoSpy = spyOn(component.undoRedoManager, 'redo').and.stub();
        const autoSaveSpy = spyOn(component.autoSave, 'saveDrawingDefault').and.stub();
        component.redo();
        expect(redoSpy).toHaveBeenCalled();
        expect(autoSaveSpy).not.toHaveBeenCalled();
        jasmine.clock().tick(1001);
        expect(autoSaveSpy).toHaveBeenCalled();
    });
});

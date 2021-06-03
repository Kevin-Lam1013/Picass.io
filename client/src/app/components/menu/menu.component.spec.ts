import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';
import { MenuComponent } from './menu.component';

class MatDialogMock {
    // tslint:disable-next-line:no-any
    openDialogs: MatDialogRef<any>[] = [];
    open(): {} {
        return {};
    }
}

describe('MenuComponent', () => {
    let component: MenuComponent;
    let fixture: ComponentFixture<MenuComponent>;
    let modal: MatDialog;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MenuComponent, CarrouselComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [HttpClient, HttpHandler, { provide: MatDialog, useClass: MatDialogMock }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        modal = TestBed.inject(MatDialog);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' isStarted should return the right boolean value ', () => {
        const drawingState: boolean = component.isStarted();
        expect(drawingState).toEqual(component.drawingService.drawingStarted);
    });

    it(' startNewDrawing should call clearArrays and if newDrawing is true it should clear local storage and set drawingStarted to false ', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const clearArraysSpy = spyOn(component.toolManager, 'clearArrays').and.stub();
        const clearStorage = spyOn(component.autoSaveService, 'clearLocalStorage').and.callThrough();
        component.toolManager.newDrawing = true;
        component.startNewDrawing();
        expect(clearArraysSpy).toHaveBeenCalled();
        expect(clearStorage).toHaveBeenCalled();
        expect(component.toolManager.drawingService.drawingStarted).toEqual(false);
    });

    it(' startNewDrawing should call clearArrays and if newDrawing is false then it should not create a new drawing (so the local storage should not be cleared)', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        const clearArraysSpy = spyOn(component.toolManager, 'clearArrays').and.callThrough();
        const clearStorage = spyOn(component.autoSaveService, 'clearLocalStorage').and.callThrough();
        component.toolManager.newDrawing = false;
        component.startNewDrawing();
        expect(clearArraysSpy).toHaveBeenCalled();
        expect(clearStorage).not.toHaveBeenCalled();
    });

    it(' startNewDrawing should call clearArrays and if newDrawing is false then it should not create a new drawing (so the local storage should not be cleared)', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        const clearArraysSpy = spyOn(component.toolManager, 'clearArrays').and.callThrough();
        const clearStorage = spyOn(component.autoSaveService, 'clearLocalStorage').and.callThrough();
        component.toolManager.newDrawing = false;
        component.startNewDrawing();
        expect(clearArraysSpy).toHaveBeenCalled();
        expect(clearStorage).not.toHaveBeenCalled();
    });

    it('openCarousel should open a modal window', () => {
        spyOn(modal, 'open').and.callThrough();
        component.openCarousel();
        expect(modal.open).toHaveBeenCalled();
    });
});

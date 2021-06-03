import { HttpClient, HttpHandler } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { throwError } from 'rxjs';
import { FormComponent } from './form.component';

describe('FormComponent', () => {
    let component: FormComponent;
    let fixture: ComponentFixture<FormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [FormComponent],
            providers: [FormBuilder, HttpClient, HttpHandler],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.ngOnInit();
        /* tslint:disable */
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('disableShortcut should put allowKeyPressEvent to false', () => {
        component.disableShortcut();
        expect(component['toolManager'].allowKeyPressEvents).toEqual(false);
    });

    it('enableShortcut should put allowKeyPressEvent to ture', () => {
        component.enableShortcut();
        expect(component['toolManager'].allowKeyPressEvents).toEqual(true);
    });

    it('ngOnInit should initialize the drawing form', () => {
        expect(component.drawingForm).not.toBeUndefined();
    });

    it('name should return the name of the form', () => {
        component.drawingForm.controls['name'] = ('nameTest' as unknown) as AbstractControl;
        let name = (component.name as unknown) as string;
        expect(name).toEqual('nameTest');
    });

    it('tagsForm should return the array containing the tags with the right length', () => {
        let tag1: AbstractControl = ('first' as unknown) as AbstractControl;
        component.drawingForm.controls['tags'] = component['builder'].array([tag1]);
        expect(component.tagsForms.length).toEqual(1);
    });

    it('tagsForm should return the array containing all the right tags', () => {
        let tag1: AbstractControl = ('first' as unknown) as AbstractControl;
        let tag2: AbstractControl = ('second' as unknown) as AbstractControl;
        component.drawingForm.controls['tags'] = component['builder'].array([tag1, tag2]);
        let arr = component.tagsForms;
        let firstTag: string = arr.at(0).value as string;
        let secondTag: string = arr.at(1).value as string;
        expect(firstTag).toEqual('first');
        expect(secondTag).toEqual('second');
    });

    it('addTags should not add a tag when already have 3 tags', () => {
        let tag1: AbstractControl = ('first' as unknown) as AbstractControl;
        let tag2: AbstractControl = ('second' as unknown) as AbstractControl;
        let tag3: AbstractControl = ('third' as unknown) as AbstractControl;
        component.drawingForm.controls['tags'] = component['builder'].array([tag1, tag2, tag3]);
        let spy = spyOn(component.tagsForms, 'push');
        component.addTags();
        expect(spy).not.toHaveBeenCalled();
    });

    it('addTags should add a tag when have fewer than 3 tags', () => {
        let tag1: AbstractControl = ('first' as unknown) as AbstractControl;
        let tag2: AbstractControl = ('second' as unknown) as AbstractControl;
        component.drawingForm.controls['tags'] = component['builder'].array([tag1, tag2]);
        let spy = spyOn(component.tagsForms, 'push').and.stub();
        component.addTags();
        expect(spy).toHaveBeenCalled();
    });

    it('removeTags should call remove a tags when the tags array is not empty', () => {
        let tag1: AbstractControl = ('first' as unknown) as AbstractControl;
        component.drawingForm.controls['tags'] = component['builder'].array([tag1]);
        let spy = spyOn(component.tagsForms, 'removeAt');
        component.removeTags();
        expect(spy).toHaveBeenCalled();
    });

    it('removeTags should call not remove a tags when the tags array is empty', () => {
        component.drawingForm.controls['tags'] = component['builder'].array([]);
        let spy = spyOn(component.tagsForms, 'removeAt');
        component.removeTags();
        expect(spy).not.toHaveBeenCalled();
    });

    it('dataUriToBlob should return a blob', () => {
        let uri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAMgCAYAAACw';
        let blob = component.dataURItoBlob(uri);
        expect(blob).toBeInstanceOf(Blob);
    });

    it('save should put is loading to false', () => {
        let tag1: AbstractControl = ('first' as unknown) as AbstractControl;
        component.drawingForm.controls['tags'] = component['builder'].array([tag1]);
        component.drawingForm.controls['name'] = ('nameTest' as unknown) as AbstractControl;
        component['drawingService'].canvas = document.createElement('canvas');
        component.save();
        expect(component.isLoading).toBeFalse();
    });

    it('save should put is loading to false', () => {
        let tag1: AbstractControl = ('first' as unknown) as AbstractControl;
        component.drawingForm.controls['tags'] = component['builder'].array([tag1]);
        component.drawingForm.controls['name'] = ('nameTest' as unknown) as AbstractControl;
        component['drawingService'].canvas = document.createElement('canvas');
        spyOn(component['indexService'], 'saveDrawingFile').and.returnValue(
            throwError({ message: 'Http failure response for http://localhost:3000/api/index/savedDrawings: 0 Unknown Error' }),
        );
        component.save();
        expect(component.isLoading).toBeFalse();
    });
});

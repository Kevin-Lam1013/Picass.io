// inspired by : https://malcoded.com/posts/angular-color-picker/
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPickerComponent } from '@app/components/color-picker/color-picker.component';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        /* tslint:disable */
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' selectPrimaryColor should set primary to true on left click', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        component.selectPrimaryColor(mouseEventLClick);
        expect(component.primary).toEqual(true);
    });

    it(' selectPrimaryColor should set color to the primary color of color service on left click', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        component.selectPrimaryColor(mouseEventLClick);
        expect(component.color).toEqual(component.colorService.primaryColor);
    });

    it(' selectPrimaryColor should call splitColor on left click', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        const splitColorSpy = spyOn(component, 'splitColor').and.callThrough();
        component.selectPrimaryColor(mouseEventLClick);
        expect(splitColorSpy).toHaveBeenCalledWith(component.color);
    });

    it('selectPrimaryColor should do nothing if click isnt left click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        component.primary = false;
        component.selectPrimaryColor(mouseEventRClick);
        expect(component.primary).toBeFalse();
    });

    it(' selectSecondaryColor should set primary to false on left click', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        component.selectSecondaryColor(mouseEventLClick);
        expect(component.primary).toEqual(false);
    });

    it(' selectSecondaryColor should set color to the secondary color of color service on left click', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        component.selectSecondaryColor(mouseEventLClick);
        expect(component.color).toEqual(component.colorService.secondaryColor);
    });

    it(' selectSecondaryColor should call splitColor on left click', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        const splitColorSpy = spyOn(component, 'splitColor').and.callThrough();
        component.selectSecondaryColor(mouseEventLClick);
        expect(splitColorSpy).toHaveBeenCalledWith(component.color);
    });

    it('selectSecondaryColor should do nothing if click isnt left click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        component.primary = true;
        component.selectSecondaryColor(mouseEventRClick);
        expect(component.primary).toBeTrue();
    });

    it(' splitColor should return replaced colorToSplit', () => {
        const colorToSplit = 'rgba(255,250,66,0)';
        const colorToSplitStringArray: string[] = component.splitColor(colorToSplit);
        expect(colorToSplitStringArray[0]).toEqual('255');
        expect(colorToSplitStringArray[1]).toEqual('250');
        expect(colorToSplitStringArray[2]).toEqual('66');
        expect(colorToSplitStringArray[3]).toEqual('0');
    });

    it(' adjustColor should affect color if ctrlKey is false and isRed is true', () => {
        const keyboardEvent: KeyboardEvent = { ctrlKey: false } as KeyboardEvent;
        // Solution ci-dessous tirée de https://stackoverflow.com/questions/27108094/how-to-set-target-property-when-simulating-mouseclick-in-javascript
        Object.defineProperty(keyboardEvent, 'target', { value: { value: 'ff' } });
        const isNumberSpy = spyOn(component, 'isNumber').and.callThrough();
        component.isRed = true;
        component.adjustColor(keyboardEvent);
        expect(isNumberSpy).toHaveBeenCalledWith(255);
        expect(component.color).toEqual('rgba(255,0,0,1)');
    });

    it(' adjustColor should affect color if ctrlKey is false and isGreen is true', () => {
        const keyboardEvent: KeyboardEvent = { ctrlKey: false } as KeyboardEvent;
        // Solution ci-dessous tirée de https://stackoverflow.com/questions/27108094/how-to-set-target-property-when-simulating-mouseclick-in-javascript
        Object.defineProperty(keyboardEvent, 'target', { value: { value: 'ff' } });
        const isNumberSpy = spyOn(component, 'isNumber').and.callThrough();
        component.isGreen = true;
        component.adjustColor(keyboardEvent);
        expect(isNumberSpy).toHaveBeenCalledWith(255);
        expect(component.color).toEqual('rgba(0,255,0,1)');
    });

    it(' adjustColor should affect color if ctrlKey is false and isBlue is true', () => {
        const keyboardEvent: KeyboardEvent = { ctrlKey: false } as KeyboardEvent;
        // Solution ci-dessous tirée de https://stackoverflow.com/questions/27108094/how-to-set-target-property-when-simulating-mouseclick-in-javascript
        Object.defineProperty(keyboardEvent, 'target', { value: { value: 'ff' } });
        const isNumberSpy = spyOn(component, 'isNumber').and.callThrough();
        component.isBlue = true;
        component.adjustColor(keyboardEvent);
        expect(isNumberSpy).toHaveBeenCalledWith(255);
        expect(component.color).toEqual('rgba(0,0,255,1)');
    });

    it(' adjustColor should call setColorPreview and resetSelectedColors', () => {
        const setColorPreviewSpy = spyOn(component.colorService, 'setColorPreview').and.callThrough();
        const resetSelectedColorsSpy = spyOn(component, 'resetSelectedColors').and.callThrough();
        const keyboardEvent: KeyboardEvent = { ctrlKey: false } as KeyboardEvent;
        // Solution ci-dessous tirée de https://stackoverflow.com/questions/27108094/how-to-set-target-property-when-simulating-mouseclick-in-javascript
        Object.defineProperty(keyboardEvent, 'target', { value: { value: '255' } });
        component.adjustColor(keyboardEvent);
        expect(setColorPreviewSpy).toHaveBeenCalledWith(component.primary, component.color);
        expect(resetSelectedColorsSpy).toHaveBeenCalledWith();
    });

    it('adjustColor shouldnt modify hexValue if colorIntensity is ctrlKey', () => {
        const parseIntSpy = spyOn(window, 'parseInt').and.stub();
        const keyboardEvent: KeyboardEvent = { ctrlKey: true } as KeyboardEvent;
        component.adjustColor(keyboardEvent);
        expect(parseIntSpy).toHaveBeenCalledWith('', 16);
    });

    it('adjustColor should call isNumber if isRed, isGreen or isBlue is true', () => {
        const isNumberSpy = spyOn(component, 'isNumber').and.stub();
        component.isBlue = true;
        component.isGreen = false;
        component.isRed = false;
        const keyboardEvent: KeyboardEvent = { ctrlKey: true } as KeyboardEvent;
        component.adjustColor(keyboardEvent);
        expect(isNumberSpy).toHaveBeenCalled();
        component.isBlue = false;
        component.isGreen = true;
        component.isRed = false;
        component.adjustColor(keyboardEvent);
        expect(isNumberSpy).toHaveBeenCalled();
        component.isBlue = false;
        component.isGreen = false;
        component.isRed = true;
        component.adjustColor(keyboardEvent);
        expect(isNumberSpy).toHaveBeenCalled();
    });

    it(' rgbaToHex should expect #ff7b5764 if given rgba(255,123,87,1) while primary is true', () => {
        component.primary = true;
        const colorInRgba = 'rgba(255,123,87,1)';
        expect(component.rgbaToHex(colorInRgba)).toEqual('#ff7b5764');
    });

    it(' rgbaToHex should expect #ff7b5764 if given rgba(255,123,87,1) while primary is false', () => {
        component.primary = false;
        const colorInRgba = 'rgba(0,0,0,1)';
        expect(component.rgbaToHex(colorInRgba)).toEqual('#00000064');
    });

    it(' resetSelectedColors should make isRed, isGreen and isBlue false', () => {
        expect(component.isRed).toEqual(false);
        expect(component.isGreen).toEqual(false);
        expect(component.isBlue).toEqual(false);
    });

    it(' isNumber should return true if given a number', () => {
        const num = 10;
        expect(component.isNumber(num)).toEqual(true);
    });

    it(' onMouseUp should make mouseDown false ', () => {
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        component.onMouseUp(mouseEventLClick);
        expect(component.colorService['mouseDown']).toEqual(false);
    });
});

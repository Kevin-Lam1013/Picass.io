// inspired by : https://malcoded.com/posts/angular-color-picker/
import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should call draw', () => {
        const drawSpy = spyOn(component, 'draw');
        component.ngAfterViewInit();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('draw should call fillrect 3 times', () => {
        const fillRectSpy = spyOn(component['ctx'], 'fillRect');
        component.draw();
        expect(fillRectSpy).toHaveBeenCalledTimes(3);
    });

    it('draw should set strokestyle and fillstyle to white when slectedPosition is defined', () => {
        component.selectedPosition = { x: 0, y: 0 };
        component.draw();
        expect(component['ctx'].strokeStyle).toEqual('#ffffff');
        expect(component['ctx'].fillStyle).toEqual('#ffffff');
    });

    it('draw should call arc when slectedPosition is defined', () => {
        component.selectedPosition = { x: 0, y: 0 };
        const arcSpy = spyOn(component['ctx'], 'arc');
        component.draw();
        expect(arcSpy).toHaveBeenCalledWith(0, 0, 10, 0, 2 * Math.PI);
    });

    it('draw should set linewidth to basewidth when slectedPosition is defined', () => {
        component.selectedPosition = { x: 0, y: 0 };
        component.draw();
        expect(component['ctx'].lineWidth).toEqual(5);
    });

    it('ngOnChanges should call draw after a change', () => {
        const drawSpy = spyOn(component, 'draw');
        component.ngOnChanges({
            // inspired by https://medium.com/@christophkrautz/testing-ngonchanges-in-angular-components-bbb3b4650ee8
            hue: new SimpleChange(null, '#ffffff', true),
        });
        expect(drawSpy).toHaveBeenCalled();
    });

    it('ngOnChanges should call color.emit after a change if selectedPosition is set', () => {
        const emitSpy = spyOn(component.color, 'emit');
        component.selectedPosition = { x: 0, y: 0 };
        component.ngOnChanges({
            // inspired by https://medium.com/@christophkrautz/testing-ngonchanges-in-angular-components-bbb3b4650ee8
            hue: new SimpleChange(null, '#ffffff', true),
        });
        expect(emitSpy).toHaveBeenCalled();
    });

    it('ngOnChanges does nothing if changes.hue returns false', () => {
        const drawSpy = spyOn(component, 'draw').and.stub();
        component.ngOnChanges({
            // inspired by https://medium.com/@christophkrautz/testing-ngonchanges-in-angular-components-bbb3b4650ee8
        });

        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should set mouseDown to false', () => {
        const mouseEvent: MouseEvent = {} as MouseEvent;
        component.onMouseUp(mouseEvent);
        expect(component['mouseDown']).toEqual(false);
    });

    it('onLeftClickDown should call emitColor and draw if the left mouse button is clicked', () => {
        const mouseEvent: MouseEvent = { button: 0, offsetX: 30, offsetY: 30 } as MouseEvent;
        const drawSpy = spyOn(component, 'draw');
        const emitColorSpy = spyOn(component, 'emitColor');
        component.selectedPosition = { x: 0, y: 0 };
        component.onLeftClickDown(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(emitColorSpy).toHaveBeenCalledWith(30, 30);
    });

    it('onLeftClickDown should call resetBoolsAfterDecision if the left mouse button is clicked and isConfirmed is true', () => {
        const mouseEvent: MouseEvent = { button: 0, offsetX: 30, offsetY: 30 } as MouseEvent;
        const resetBoolsAfterDecisionSpy = spyOn(component, 'resetBoolsAfterDecision');
        component.selectedPosition = { x: 0, y: 0 };
        component.colorService.isConfirmed = true;
        component.onLeftClickDown(mouseEvent);
        expect(resetBoolsAfterDecisionSpy).toHaveBeenCalled();
    });

    it('onLeftClickDown should update the primaryColorPreview when mouse button is clicked', () => {
        const mouseEvent: MouseEvent = { button: 0, offsetX: 30, offsetY: 30 } as MouseEvent;
        component.selectedPosition = { x: 0, y: 0 };
        component.onLeftClickDown(mouseEvent);
        expect(component.colorService.primaryColorPreview).toEqual('rgba(203,203,203,1)');
    });

    it('onLeftClickDown doesnt call draw if mouseDown is false', () => {
        const mouseEvent: MouseEvent = { button: 1, offsetX: 30, offsetY: 30 } as MouseEvent;
        const drawSpy = spyOn(component, 'draw').and.stub();
        component.onLeftClickDown(mouseEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('resetBoolsAfterDecision should set isConfirmed, mouseDown to false when called', () => {
        component.resetBoolsAfterDecision();
        expect(component.colorService.isConfirmed).toEqual(false);
        expect(component['mouseDown']).toEqual(false);
    });

    it('onRightClickDown should call emitColor and draw', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        const drawSpy = spyOn(component, 'draw');
        const emitColorSpy = spyOn(component, 'emitColor');
        component.selectedPosition = { x: 0, y: 0 };
        component.onRightClickDown(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(emitColorSpy).toHaveBeenCalledWith(30, 30);
    });

    it('onRightClickDown should call resetBoolsAfterDecision if the left mouse button is clicked and isConfirmed is true', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        const resetBoolsAfterDecisionSpy = spyOn(component, 'resetBoolsAfterDecision');
        component.selectedPosition = { x: 0, y: 0 };
        component.colorService.isConfirmed = true;
        component.onRightClickDown(mouseEvent);
        expect(resetBoolsAfterDecisionSpy).toHaveBeenCalled();
    });

    it('onRightClickDown should update the secondaryColorPreview when mouse button is clicked', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        component.selectedPosition = { x: 0, y: 0 };
        component.onRightClickDown(mouseEvent);
        expect(component.colorService.secondaryColorPreview).toEqual('rgba(203,203,203,1)');
    });

    it('onRightClickDown should return false if isConfirmed is true', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        component.selectedPosition = { x: 0, y: 0 };
        component.colorService.isConfirmed = true;
        expect(component.onRightClickDown(mouseEvent)).toEqual(false);
    });

    it('onRightClickDown should return false', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        component.selectedPosition = { x: 0, y: 0 };
        component.colorService.isConfirmed = false;
        expect(component.onRightClickDown(mouseEvent)).toEqual(false);
    });

    it('onMouseMove should call emitColor and draw if the mouse is clicked', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        const drawSpy = spyOn(component, 'draw');
        const emitColorSpy = spyOn(component, 'emitColor');
        component['mouseDown'] = true;
        component.selectedPosition = { x: 0, y: 0 };
        component.onMouseMove(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(emitColorSpy).toHaveBeenCalledWith(30, 30);
    });

    it('onMouseMove should update the primaryColorPreview when mouse button is clicked', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        component.selectedPosition = { x: 0, y: 0 };
        component['mouseDown'] = true;
        component.onMouseMove(mouseEvent);
        expect(component.colorService.primaryColorPreview).toEqual('rgba(203,203,203,1)');
    });

    it('onMouseMove should set primaryColor as primaryColorPreview isConfirmed is true', () => {
        component.colorService.isConfirmed = true;
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        component.selectedPosition = { x: 0, y: 0 };
        component['mouseDown'] = true;
        component.onMouseMove(mouseEvent);
        expect(component.colorService.primaryColorPreview).toEqual(component.colorService.primaryColor);
    });

    it('onMouseMove does nothing if mouseDown is false', () => {
        const mouseEvent: MouseEvent = { offsetX: 30, offsetY: 30 } as MouseEvent;
        component['mouseDown'] = false;
        const drawSpy = spyOn(component, 'draw').and.stub();
        component.onMouseMove(mouseEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('emitColor should call color.emit', () => {
        const emitSpy = spyOn(component.color, 'emit');
        component.emitColor(50, 37);
        expect(emitSpy).toHaveBeenCalledWith('rgba(191,191,191,1)');
    });

    it('getColorAtPosition should return the right rgba value', () => {
        expect(component.getColorAtPosition(100, 23)).toEqual('rgba(215,215,215,1)');
    });

    it('getColorAtPositionWithOpacity should return the right rgba value', () => {
        expect(component.getColorAtPositionWithOpacity(100, 23, 0.5)).toEqual('rgba(215,215,215,0.5)');
    });

    it('getColorAtPositionWithOpacity should return the right rgba value', () => {
        expect(component.getColorAtPositionWithOpacity(100, 23, 0.5)).toEqual('rgba(215,215,215,0.5)');
    });
});

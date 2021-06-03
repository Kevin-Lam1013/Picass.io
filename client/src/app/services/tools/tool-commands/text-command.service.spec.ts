import { TestBed } from '@angular/core/testing';
import { TextCommandService } from './text-command.service';

describe('TextCommandService', () => {
    let service: TextCommandService;
    beforeEach(() => {
        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:no-unused-expression
        // tslint:disable *
        TestBed.configureTestingModule({});
        service = TestBed.inject(TextCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setTextAttributes should set all attributes the given value', () => {
        service.toolStyle.lineWidth = 0;
        service.toolStyle.primaryColor = 'black';
        service.italic = true;
        service.bold = false;
        service.font = 'Arial';
        service.textArray = ['world'];
        service.alignment = 'right';
        service.startingPoint = { x: 10, y: 10 };
        service.endPoint = { x: 10, y: 10 };
        service.setTextAttributes(30, 'font', ['hello'], 'left', { x: 0, y: 0 }, { x: 0, y: 0 }, 'blue', false, true);
        expect(service.toolStyle.lineWidth).toEqual(30);
        expect(service.font).toEqual('font');
        expect(service.textArray).toEqual(['hello']);
        expect(service.alignment).toEqual('left');
        expect(service.startingPoint).toEqual({ x: 0, y: 0 });
        expect(service.endPoint).toEqual({ x: 0, y: 0 });
        expect(service.toolStyle.primaryColor).toEqual('blue');
        expect(service.italic).toBeFalsy();
        expect(service.bold).toBeTruthy();
    });

    it('setFontStyle should set text to italic if italic is true', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);
        service.italic = true;
        service.bold = false;
        service.toolStyle.lineWidth = 30;
        service.font = 'Arial';
        service.setFontStyle(fakeCanavas);
        expect(fakeCanavas.font).toEqual('italic 30px Arial');
    });

    it('setFontStyle should set text to bold if bold is true', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);
        service.italic = false;
        service.bold = true;
        service.toolStyle.lineWidth = 30;
        service.font = 'Arial';
        service.setFontStyle(fakeCanavas);
        expect(fakeCanavas.font).toEqual('bold 30px Arial');
    });

    it('setFontStyle should set text to italic bold if both are true', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);
        service.italic = true;
        service.bold = true;
        service.toolStyle.lineWidth = 30;
        service.font = 'Arial';
        service.setFontStyle(fakeCanavas);
        expect(fakeCanavas.font).toEqual('italic bold 30px Arial');
    });

    it('setFontStyle has no bold or italic if both are false', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);
        service.italic = false;
        service.bold = false;
        service.toolStyle.lineWidth = 30;
        service.font = 'Arial';
        service.setFontStyle(fakeCanavas);
        expect(fakeCanavas.font).toEqual('30px Arial');
    });

    it('evaluateAlignment should call fillText if alignment is left', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'fillText',
        ]);
        service.alignment = 'left';
        service.textArray = ['bob'];
        service.evaluateAlignment(fakeCanavas, 0);
        expect(fakeCanavas.fillText).toHaveBeenCalled();
    });

    it('evaluateAlignment should call fillText if alignment is right', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'fillText',
        ]);
        service.alignment = 'right';
        service.textArray = ['bob'];
        service.evaluateAlignment(fakeCanavas, 0);
        expect(fakeCanavas.fillText).toHaveBeenCalled();
    });

    it('evaluateAlignment should call fillText if alignment is center', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'fillText',
        ]);
        service.alignment = 'center';
        service.textArray = ['bob'];
        service.evaluateAlignment(fakeCanavas, 0);
        expect(fakeCanavas.fillText).toHaveBeenCalled();
    });

    it('execute should set fillStyle to the primary color of the command', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'fillStyle',
        ]);
        service.toolStyle.primaryColor = 'blue';
        spyOn(service, 'evaluateAlignment').and.stub;
        service.execute(fakeCanavas);
        expect(fakeCanavas.fillStyle).toEqual('blue');
    });

    it('execute should set globalCompositeOperation to source-over', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'fillStyle',
        ]);
        spyOn(service, 'evaluateAlignment').and.stub;
        service.execute(fakeCanavas);
        expect(fakeCanavas.globalCompositeOperation).toEqual('source-over');
    });

    it('execute should set fillStyle to the alignment of the command', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'fillStyle',
        ]);
        service.alignment = 'left';
        fakeCanavas.textAlign = 'right';
        spyOn(service, 'evaluateAlignment').and.stub;
        service.execute(fakeCanavas);
        expect(fakeCanavas.textAlign).toEqual('left');
    });

    it('execute should call setFontStyle', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);
        const setFontStyleSpy = spyOn(service, 'setFontStyle');
        spyOn(service, 'evaluateAlignment').and.stub;
        service.execute(fakeCanavas);
        expect(setFontStyleSpy).toHaveBeenCalled();
    });

    it('execute should call evaluateAlignment', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);
        const evaluateAlignmentSpy = spyOn(service, 'evaluateAlignment');
        service.execute(fakeCanavas);
        expect(evaluateAlignmentSpy).toHaveBeenCalled();
    });
});

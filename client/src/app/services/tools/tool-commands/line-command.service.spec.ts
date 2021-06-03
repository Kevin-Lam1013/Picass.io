import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { LineCommandService } from './line-command.service';

describe('LineCommandService', () => {
    let service: LineCommandService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(LineCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setCurrentLine should set the current Line', () => {
        service.setCurrentLine([[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]]);
        expect(service.currentLine).toEqual([[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]]);
    });

    it('setJunction should set the junction and the junction radius', () => {
        service.setJunctions([{ x: 0, y: 0 }], [1]);
        expect(service.junctions).toEqual([{ x: 0, y: 0 }]);
        expect(service.junctionsRadius).toEqual([1]);
    });

    it('setToolStyle should set the style', () => {
        service.setStyles('p', 5, false);
        expect(service.toolStyle.lineWidth).toEqual(5);
        expect(service.toolStyle.primaryColor).toEqual('p');
        expect(service.hasJunction).toEqual(false);
    });

    it('drawLine should call lineTo, moveTo, beginPath and stroke', () => {
        const canvasSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'moveTo',
            'beginPath',
            'setLineDash',
            'stroke',
            'lineTo',
        ]);
        const mockPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.drawLine(canvasSpyObject, mockPath);
        expect(canvasSpyObject.moveTo).toHaveBeenCalled();
        expect(canvasSpyObject.lineTo).toHaveBeenCalled();
        expect(canvasSpyObject.stroke).toHaveBeenCalled();
    });

    it('drawLine should call lineTo, moveTo, beginPath and stroke', () => {
        const canvasSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'moveTo',
            'beginPath',
            'setLineDash',
            'stroke',
            'lineTo',
        ]);
        const mockPath: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.drawLine(canvasSpyObject, mockPath);
        expect(canvasSpyObject.moveTo).toHaveBeenCalled();
        expect(canvasSpyObject.lineTo).toHaveBeenCalled();
        expect(canvasSpyObject.stroke).toHaveBeenCalled();
    });

    it('execute should call drawline as many time as there is paths in current line', () => {
        const canvasSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'moveTo',
            'beginPath',
            'setLineDash',
            'stroke',
            'lineTo',
        ]);
        service.currentLine = [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]];
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
        service.execute(canvasSpyObject);
        expect(drawLineSpy).toHaveBeenCalledTimes(2);
    });

    it('execute should call drawJunction as many time as there are junctions', () => {
        const canvasSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'moveTo',
            'beginPath',
            'setLineDash',
            'stroke',
            'lineTo',
        ]);
        service.currentLine = [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]];
        service.junctions = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        spyOn(service, 'drawLine').and.stub();
        const junctionSpy = spyOn(service, 'drawJunction').and.stub();
        service.execute(canvasSpyObject);
        expect(junctionSpy).toHaveBeenCalledTimes(2);
    });
});

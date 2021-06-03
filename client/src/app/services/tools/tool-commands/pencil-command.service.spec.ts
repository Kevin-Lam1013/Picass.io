import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { PencilCommandService } from './pencil-command.service';

describe('PencilCommandService', () => {
    let service: PencilCommandService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(PencilCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setPathData should set the path', () => {
        const path: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ];
        service.setPathData(path);
        expect(service.pathData).toEqual(path);
    });

    it('setStyle should set styles', () => {
        const primaryColor = 'rbga(0,0,0,0)';
        const width = 5;
        service.setStyles(primaryColor, width);
        expect(service.toolStyle.primaryColor).toEqual(primaryColor);
        expect(service.toolStyle.lineWidth).toEqual(width);
    });

    it('execute should call lineTo as many time as the number of points ', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
        ]);

        service.pathData = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ];
        service.execute(fakeCanavas);
        expect(fakeCanavas.lineTo).toHaveBeenCalledTimes(2);
    });
});

import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { AirbrushCommandService } from './airbrush-command.service';

describe('AirbrushCommandService', () => {
    let service: AirbrushCommandService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(AirbrushCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setStyles should set the style', () => {
        service.setStyles('p', 5, false, 20, 1, 100, 500);
        expect(service.toolStyle.primaryColor).toEqual('p');
        expect(service.toolStyle.lineWidth).toEqual(5);
        expect(service.toolStyle.fill).toEqual(false);
        expect(service.jetDiameter).toEqual(20);
        expect(service.dropletDiameter).toEqual(1);
        expect(service.emissionRate).toEqual(100);
        expect(service.emissionsNb).toEqual(500);
    });

    it('setCoordinatesAndPathData should set pathData and point', () => {
        service.setCoordinatesAndPathData({ x: 100, y: 100 }, [
            { x: 200, y: 100 },
            { x: 250, y: 120 },
        ]);
        expect(service.point).toEqual({ x: 100, y: 100 });
        expect(service['pathData']).toEqual([
            { x: 200, y: 100 },
            { x: 250, y: 120 },
        ]);
    });

    it(' randomNumber should return a random number between num1 and num2', () => {
        const num1 = 1;
        const num2 = 50;
        const randomNumberGenerated = service.getRandomNumber(num1, num2);
        expect(randomNumberGenerated).toBeLessThanOrEqual(num2);
    });

    it(' execute should call emitDroplets', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'arc',
            'fill',
        ]);
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 4, y: 5 },
            { x: 4, y: 2 },
            { x: 7, y: 100 },
        ];
        const emitDropletsSpy = spyOn(service, 'emitDroplets');
        service.execute(fakeCanavas);
        expect(emitDropletsSpy).toHaveBeenCalled();
    });

    it(' execute should call createSprayPath', () => {
        const fakeCanavas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'setLineDash',
            'stroke',
            'moveTo',
            'lineTo',
            'arc',
            'fill',
        ]);
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 4, y: 5 },
            { x: 4, y: 2 },
            { x: 7, y: 100 },
        ];
        const createSprayPathSpy = spyOn(service, 'createSprayPath');
        service.execute(fakeCanavas);
        expect(createSprayPathSpy).toHaveBeenCalled();
    });

    it('createSprayPath should iterate over pathData and call arc() should be called at each iteration ', () => {
        const ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'fill',
            'arc',
        ]);
        service['pathData'] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 4, y: 5 },
            { x: 4, y: 2 },
            { x: 7, y: 100 },
        ];
        service.emissionRate = 0; // in order to ignore other calls of ctx.arc

        service.createSprayPath(ctxSpyObject);

        // pathData holds 5 elements and thefore spray() will iterate through it 2 times
        expect(ctxSpyObject.arc).toHaveBeenCalledTimes(5);
    });

    it('emitDroplets should iterate over emissionsNb and call arc() every time', () => {
        const mockPosition: Vec2 = { x: 50, y: 65 };

        const ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'globalCompositeOperation',
            'fill',
            'arc',
        ]);
        service['pathData'] = []; // 0 elements in order to ignore other calls of ctx.arc
        service.emissionRate = 100; // 100 emissions / sec

        service.emitDroplets(ctxSpyObject, mockPosition);

        // spray() is called every 0.1 sec, so we expect 10 emissions
        expect(ctxSpyObject.arc).toHaveBeenCalledTimes(10);
    });
});

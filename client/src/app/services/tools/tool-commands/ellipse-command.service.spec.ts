import { TestBed } from '@angular/core/testing';
import { EllipseCommandService } from './ellipse-command.service';

describe('EllipseCommandService', () => {
    let service: EllipseCommandService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(EllipseCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setToolStyle should set the style', () => {
        service.setToolStyles('p', 5, false, 's');
        expect(service.toolStyle.lineWidth).toEqual(5);
        expect(service.toolStyle.primaryColor).toEqual('p');
        expect(service.toolStyle.secondaryColor).toEqual('s');
        expect(service.toolStyle.fill).toEqual(false);
    });

    it('setBorderAndShiftBools should set the shift and border boolean', () => {
        service.setBorderAndShiftBools(true, true);
        expect(service.shiftIsPressed).toBeTrue();
        expect(service.border).toBeTrue();
    });

    it('setCoordinates should set all the coordinates', () => {
        service.setCoordinates({ x: 0, y: 0 }, { x: 0, y: 0 }, [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ]);
        expect(service.startingPoint).toEqual({ x: 0, y: 0 });
        expect(service.endPoint).toEqual({ x: 0, y: 0 });
        expect(service.currentLine).toEqual([
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ]);
    });
});

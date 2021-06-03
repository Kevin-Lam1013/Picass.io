import { TestBed } from '@angular/core/testing';
import { RectangleCommandService } from './rectangle-command.service';

describe('RectangleCommandService', () => {
    let service: RectangleCommandService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(RectangleCommandService);
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

    it('set coordinates should set the current line', () => {
        service.setCoordinates([
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ]);
        expect(service.currentLine).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ]);
    });

    it('setBorderAndShiftBools should set the shift and border boolean', () => {
        service.setContourAndShiftBools(true, true);
        expect(service.shiftIsPressed).toBeTrue();
        expect(service.contour).toBeTrue();
    });
});

import { TestBed } from '@angular/core/testing';
import { EraserCommandService } from './eraser-command.service';

describe('EraserCommandService', () => {
    let service: EraserCommandService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(EraserCommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('setStyles should set the width', () => {
        service.setStyles(5);
        expect(service.toolStyle.lineWidth).toEqual(5);
    });
    it('setCoordinats should set the coordinates', () => {
        service.setCoordinates([{ x: 0, y: 0 }]);
        expect(service['pathData']).toEqual([{ x: 0, y: 0 }]);
    });
});

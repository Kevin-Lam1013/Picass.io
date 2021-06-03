import { TestBed } from '@angular/core/testing';
import { PolygonCommandService } from './polygone-command.service';

describe('PolygoneCommandService', () => {
    let service: PolygonCommandService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(PolygonCommandService);
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

    it('setPolygoneAttribute should set all the attribute', () => {
        service.setPolygoneAttributes(true, 0, 1, 2, 3, 4);
        expect(service.centerX).toEqual(0);
        expect(service.centerY).toEqual(1);
        expect(service.angle).toEqual(2);
        expect(service.radius).toEqual(3);
        expect(service.sides).toEqual(4);
        expect(service.contour).toEqual(true);
    });
});

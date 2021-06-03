import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { AnchorService } from './anchor.service';

describe('AnchorService', () => {
    let service: AnchorService;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AnchorService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('moveAnchor should call the correct handler', () => {
        const initAnchorHandlerSpy = spyOn(service, 'initAnchorHandler').and.callThrough();
        const ihAnchorHandlerSpy = spyOn(service, 'IHAnchorHandler').and.callThrough();
        const finAnchorHandlerSpy = spyOn(service, 'finAnchorHandler').and.callThrough();
        const ivAnchorHandlerSpy = spyOn(service, 'ivAnchorHandler').and.callThrough();

        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];

        service.currentAnchor = 0;
        service.moveAnchor(mouseEvent);
        expect(initAnchorHandlerSpy).toHaveBeenCalled();

        service.currentAnchor = 2;
        service.moveAnchor(mouseEvent);
        expect(ihAnchorHandlerSpy).toHaveBeenCalled();

        service.currentAnchor = 4;
        service.moveAnchor(mouseEvent);
        expect(finAnchorHandlerSpy).toHaveBeenCalled();

        service.currentAnchor = 6;
        service.moveAnchor(mouseEvent);
        expect(ivAnchorHandlerSpy).toHaveBeenCalled();
    });

    it('moveAnchor should correctly set currentLine if a handler isnt called', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];

        service.currentAnchor = 1;
        service.moveAnchor(mouseEvent);
        expect(service.currentLine[0].y).toEqual(25);

        service.currentAnchor = 3;
        service.moveAnchor(mouseEvent);
        expect(service.currentLine[1].x).toEqual(25);

        service.currentAnchor = 5;
        service.moveAnchor(mouseEvent);
        expect(service.currentLine[1].y).toEqual(25);

        service.currentAnchor = 7;
        service.moveAnchor(mouseEvent);
        expect(service.currentLine[0].x).toEqual(25);
    });

    it('anchor handlers should correctly set values when shift is pressed', () => {
        service.currentLine = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.shiftIsPressed = true;

        service.initAnchorHandler(mouseEvent);
        let expectedResult: Vec2 = { x: 25, y: 25 };
        expect(service.currentLine[0]).toEqual(expectedResult);

        service.currentLine = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];

        service.IHAnchorHandler(mouseEvent);
        let expectedResultArray: Vec2[] = [
            { x: 0, y: 10 },
            { x: -10, y: 0 },
        ];
        expect(service.currentLine).toEqual(expectedResultArray);

        service.currentLine = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.lastOffset = { x: 0, y: 30 };
        service.IHAnchorHandler(mouseEvent);
        expectedResultArray = [
            { x: 0, y: -10 },
            { x: 10, y: 0 },
        ];
        expect(service.currentLine).toEqual(expectedResultArray);

        service.currentLine = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.ivAnchorHandler(mouseEvent);
        expectedResultArray = [
            { x: 10, y: 0 },
            { x: 0, y: -10 },
        ];
        expect(service.currentLine).toEqual(expectedResultArray);

        service.currentLine = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.lastOffset = { x: 30, y: 30 };
        service.ivAnchorHandler(mouseEvent);
        expectedResultArray = [
            { x: -10, y: 0 },
            { x: 0, y: 10 },
        ];
        expect(service.currentLine).toEqual(expectedResultArray);

        service.currentLine = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.finAnchorHandler(mouseEvent);
        expectedResult = { x: 25, y: 25 };
        expect(service.currentLine[1]).toEqual(expectedResult);
    });
});

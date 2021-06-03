import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { LassoHelperService } from './lasso-helper.service';

const MINUS_ONE = -1;

describe('LassoHelperService', () => {
    let service: LassoHelperService;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    // Configuration du spy du service
    // tslint:disable:no-string-literal
    // tslint:disable:no-magic-numbers
    // tslint:disable:max-file-line-count
    beforeEach(() => {
        TestBed.configureTestingModule({});
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(LassoHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('detectIntersection should return true when there is an intersection', () => {
        const currentLine: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
        ];
        const intersection: boolean = service.detectIntersection(
            [
                { x: 10, y: 15 },
                { x: 25, y: 12 },
            ],
            currentLine,
        );
        expect(intersection).toBeTrue();
    });

    it('detectIntersection should return false when there is no intersection', () => {
        const currentLine: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
        ];
        const intersection: boolean = service.detectIntersection(
            [
                { x: 10, y: 15 },
                { x: 20, y: 16 },
            ],
            currentLine,
        );
        expect(intersection).toBeFalse();
    });

    it('detectIntersection should return false when a point intersect with itself', () => {
        const currentLine: Vec2[][] = [
            [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
        ];
        const intersection: boolean = service.detectIntersection(
            [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            currentLine,
        );
        expect(intersection).toBeFalse();
    });

    it('isInsidePolygon should return true when a point is inside the polygon', () => {
        const currentLine: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        const isInside: boolean = service.isInsidePolygon({ x: 11, y: 11 }, currentLine);
        expect(isInside).toBeTrue();
    });

    it('isInsidePolygon should return false when a point is outside of the polygon', () => {
        const currentLine: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        const isInside: boolean = service.isInsidePolygon({ x: 30, y: 30 }, currentLine);
        expect(isInside).toBeFalse();
    });

    /*it('drawAnchorPoint should call arc of previewCtx 8 times', () => {
    let anchors : Vec2 [] = [];
    let path : Vec2[] = [{x:0,y:0},{x:100,y:100}];
    let arcSpy = spyOn(previewCtxStub,'arc');
    service.drawAnchorPoints(previewCtxStub,path,anchors);
    expect(arcSpy).toHaveBeenCalledTimes(8);
  });*/

    it('fix imageData should call isInsidePolygon', () => {
        const mockStartingPoint = { x: -50, y: -50 };
        const mockEndingPoint = { x: 1, y: 1 };
        const imageData = new ImageData(100, 100);
        const path: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        const polygonSpy = spyOn(service, 'isInsidePolygon');
        service.fixImageData(previewCtxStub, [mockStartingPoint, mockEndingPoint], imageData, path);
        expect(polygonSpy).toHaveBeenCalled();
    });

    it('clipRegion should call isInsidePolygon', () => {
        const path: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        const polygonSpy = spyOn(service, 'isInsidePolygon');
        service.clipRegion(previewCtxStub, path);
        expect(polygonSpy).toHaveBeenCalled();
    });

    it('updateRectangle should set currentLine to the max and min point of the path', () => {
        const path: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        const currentLine: Vec2[] = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];

        service.updateRectangle(path, currentLine);
        expect(currentLine[0]).toEqual({ x: 10, y: 10 });
        expect(currentLine[1]).toEqual({ x: 20, y: 15 });
    });

    it('translatePathForPaste reduce the oldCurrentLine from the lassoPath', () => {
        const oldCurrentLine: Vec2 = { x: 5, y: 5 };
        const path: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 15, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        const expectedResult: Vec2[][] = [
            [
                { x: 15, y: 10 },
                { x: 10, y: 5 },
            ],
            [
                { x: 15, y: 5 },
                { x: 5, y: 5 },
            ],
            [
                { x: 5, y: 5 },
                { x: 5, y: 10 },
            ],
            [
                { x: 5, y: 10 },
                { x: 15, y: 10 },
            ],
        ];
        service.translatePathForPaste(oldCurrentLine, path);
        for (let i = 0; i < path.length; i++) {
            expect(expectedResult[i][1].x).toEqual(path[i][1].x);
            expect(expectedResult[i][1].y).toEqual(path[i][1].y);
        }
    });

    it('translateImage should add the difference between offset and the lastPos and add this difference in currentLine and lassoPath', () => {
        const currentLine: Vec2[] = [
            { x: 10, y: 15 },
            { x: 20, y: 10 },
        ];
        const offset: Vec2 = { x: 10, y: 10 };
        const lastPos: Vec2 = { x: 5, y: 5 };
        const path: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 15, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];

        const resultCurrentLine: Vec2[] = [
            { x: 15, y: 20 },
            { x: 25, y: 15 },
        ];

        const resultPath: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 20, y: 15 },
            ],
            [
                { x: 20, y: 10 },
                { x: 15, y: 15 },
            ],
            [
                { x: 10, y: 10 },
                { x: 15, y: 20 },
            ],
            [
                { x: 10, y: 15 },
                { x: 25, y: 20 },
            ],
        ];
        service.translateImage(currentLine, offset, path, lastPos);

        for (let i = 0; i < currentLine.length; i++) {
            expect(currentLine[i].x).toEqual(resultCurrentLine[i].x);
            expect(currentLine[i].y).toEqual(resultCurrentLine[i].y);
        }

        for (let i = 0; i < path.length; i++) {
            expect(path[i][1].x).toEqual(resultPath[i][1].x);
            expect(path[i][1].y).toEqual(resultPath[i][1].y);
        }
    });

    it('flipMathematic should set scaleValue.x to MINUS_ONE when the currentLine[0].x is greater than currentLine[1].x', () => {
        const currentLine: Vec2[] = [
            { x: 25, y: 15 },
            { x: 20, y: 10 },
        ];
        const scaleValue: Vec2 = { x: 0, y: 0 };
        service.flipMathematic(currentLine, scaleValue);
        expect(scaleValue.x).toEqual(MINUS_ONE);
    });

    it('flipMathematic should set scaleValue.y to MINUS_ONE when the currentLine[0].y is greater than currentLine[1].x', () => {
        const currentLine: Vec2[] = [
            { x: 25, y: 15 },
            { x: 20, y: 10 },
        ];
        const scaleValue: Vec2 = { x: 0, y: 0 };
        service.flipMathematic(currentLine, scaleValue);
        expect(scaleValue.y).toEqual(MINUS_ONE);
    });

    it('flipMathematic should return the currentLine[0] when scaleValue is not going to be equal to MINUS_ONE in x and y', () => {
        const currentLine: Vec2[] = [
            { x: 25, y: 15 },
            { x: 30, y: 35 },
        ];
        const scaleValue: Vec2 = { x: 0, y: 0 };
        expect(service.flipMathematic(currentLine, scaleValue)).toEqual(currentLine[0]);
    });

    it('flipMathematic should return the currentLine[1] when scaleValue is going to be equal to MINUS_ONE in x and y', () => {
        const currentLine: Vec2[] = [
            { x: 250, y: 150 },
            { x: 30, y: 35 },
        ];
        const scaleValue: Vec2 = { x: 0, y: 0 };
        const result: Vec2 = { x: -currentLine[1].x, y: -currentLine[1].y };
        expect(service.flipMathematic(currentLine, scaleValue)).toEqual(result);
    });

    it('translateImageWithMagnetism should set the correct value for currentLine and lassoPath', () => {
        const currentLine: Vec2[] = [
            { x: 1, y: 1 },
            { x: 2, y: 3 },
        ];
        const offset: Vec2 = { x: 1, y: 1 };
        const lassoPath: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 15, y: 10 },
            ],
            [
                { x: 20, y: 10 },
                { x: 10, y: 10 },
            ],
            [
                { x: 10, y: 10 },
                { x: 10, y: 15 },
            ],
            [
                { x: 10, y: 15 },
                { x: 20, y: 15 },
            ],
        ];
        const resultCurrentLine: Vec2[] = [
            { x: 2, y: 2 },
            { x: 3, y: 4 },
        ];
        const resultLassoPath: Vec2[][] = [
            [
                { x: 20, y: 15 },
                { x: 16, y: 11 },
            ],
            [
                { x: 20, y: 10 },
                { x: 11, y: 11 },
            ],
            [
                { x: 10, y: 10 },
                { x: 11, y: 16 },
            ],
            [
                { x: 10, y: 15 },
                { x: 21, y: 16 },
            ],
        ];
        service.translateImageWithMagnetism(currentLine, offset, lassoPath);
        for (let i = 0; i < resultCurrentLine.length; i++) {
            expect(currentLine[i]).toEqual(resultCurrentLine[i]);
        }
        for (let i = 0; i < resultLassoPath.length; i++) {
            expect(lassoPath[i][1]).toEqual(resultLassoPath[i][1]);
        }
    });
});

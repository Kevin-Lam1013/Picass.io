import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { LineHelperService, POSSIBLE_ANGLES } from './line-helper.service';

describe('LineHelperService', () => {
    let service: LineHelperService;
    const SQRT2_OVER2 = Math.sqrt(2) / 2;
    beforeEach(() => {
        // tslint:disable:no-magic-numbers

        TestBed.configureTestingModule({});
        service = TestBed.inject(LineHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('closestValidAngle should the right closest angle', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoints: Vec2[] = [
            { x: 5, y: -1 },
            { x: 5, y: -3.5 },
            { x: 1, y: -5 },
            { x: -3, y: -5 },
            { x: -5, y: -1 },
            { x: -3, y: 5 },
            { x: -1, y: 5 },
            { x: 3, y: 5 },
        ];

        for (const [index, mockEndingPoint] of mockEndingPoints.entries()) {
            expect(service.closestValidAngle(mockStartingPoint, mockEndingPoint)).toEqual(POSSIBLE_ANGLES[index]);
        }
    });

    it('closestValidAngle should return 0 if the closes angle is 360', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoint: Vec2 = { x: 5, y: 1 };

        expect(service.closestValidAngle(mockStartingPoint, mockEndingPoint)).toEqual(0);
    });

    it('closestAngledPoint should return the right points', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoint: Vec2[] = [
            { x: 1, y: -0.1 },
            { x: SQRT2_OVER2, y: -0.6 },
            { x: 0, y: 0.9 },
            { x: -SQRT2_OVER2, y: -0.6 },
            { x: -1, y: -0.1 },
            { x: -SQRT2_OVER2, y: 0.6 },
            { x: -0.1, y: 1 },
            { x: SQRT2_OVER2, y: 0.6 },
        ];
        const expectedResults: Vec2[] = [
            { x: 1, y: 0 },
            { x: SQRT2_OVER2, y: -SQRT2_OVER2 },
            { x: 0, y: 1 },
            { x: -SQRT2_OVER2, y: -SQRT2_OVER2 },
            { x: -1, y: 0 },
            { x: -SQRT2_OVER2, y: SQRT2_OVER2 },
            { x: 0, y: 1 },
            { x: SQRT2_OVER2, y: SQRT2_OVER2 },
        ];

        for (const [index, point] of mockEndingPoint.entries()) {
            expect(service.closestAngledPoint(mockStartingPoint, point).x).toBeCloseTo(expectedResults[index].x, 0.1);
            expect(service.closestAngledPoint(mockStartingPoint, point).y).toBeCloseTo(expectedResults[index].y, 0.1);
        }
    });

    it('distanceUtil should return the right distance', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoints: Vec2[] = [
            { x: 0, y: 1 },
            { x: 1, y: 3 },
            { x: -1, y: -5 },
            { x: 0, y: 0 },
        ];

        const expectedResults: number[] = [1, Math.sqrt(10), Math.sqrt(26), 0];
        for (const [index, point] of mockEndingPoints.entries()) {
            expect(service.distanceUtil(mockStartingPoint, point)).toEqual(expectedResults[index]);
        }
    });

    it('angleQuadrantConverter should return the right angle', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoints: Vec2[] = [
            { x: 5, y: 5 },
            { x: -5, y: 5 },
            { x: -5, y: -5 },
            { x: 5, y: -5 },
        ];
        const expectedResults: number[] = [315, 225, 135, 45];

        for (const [index, point] of mockEndingPoints.entries()) {
            expect(service.angleQuadrantConverter(mockStartingPoint, point, 45)).toEqual(expectedResults[index]);
        }
    });

    it('shiftAngleCalculator should return right boolean', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoints: Vec2[] = [
            { x: 0, y: 0 },
            { x: SQRT2_OVER2, y: SQRT2_OVER2 },
            { x: -5, y: -5 },
            { x: 1, y: 2 },
            { x: -SQRT2_OVER2, y: SQRT2_OVER2 },
        ];
        const expectedResults: boolean[] = [true, true, true, false, true];

        for (const [index, point] of mockEndingPoints.entries()) {
            expect(service.shiftAngleCalculator(mockStartingPoint, point)).toEqual(expectedResults[index]);
        }
    });

    it('pixelDistanceUtil should return true if horizontal and vertical distances are <= 20 px', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoints: Vec2[] = [
            { x: 0, y: 0 },
            { x: -10, y: -10 },
            { x: 20, y: -20 },
            { x: -20, y: 20 },
        ];

        for (const point of mockEndingPoints) {
            expect(service.pixelDistanceUtil(mockStartingPoint, point)).toBeTrue();
        }
    });

    it('pixelDistanceUtil should return false if horizontal or vertical distance is > 20 px', () => {
        const mockStartingPoint: Vec2 = { x: 0, y: 0 };
        const mockEndingPoints: Vec2[] = [
            { x: 21, y: 0 },
            { x: -21, y: -10 },
            { x: 0, y: -21 },
            { x: -21, y: -21 },
        ];

        for (const point of mockEndingPoints) {
            expect(service.pixelDistanceUtil(mockStartingPoint, point)).toBeFalse();
        }
    });
});

import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { SquareHelperService } from './square-helper.service';

describe('SquareHelperService', () => {
    let service: SquareHelperService;

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(SquareHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it(' checkIfIsSquare should return true', () => {
        const initialCoord: Vec2 = { x: 1, y: 5 };
        const endingCoord: Vec2 = { x: 5, y: 1 };
        const expected: boolean = service.checkIfIsSquare([initialCoord, endingCoord]);
        expect(expected).toEqual(true);
    });

    it(' checkIfIsSquare should not detect a square', () => {
        const initialCoord: Vec2 = { x: 1, y: 5 };
        const endingCoord: Vec2 = { x: 14, y: 20 };
        const expected: boolean = service.checkIfIsSquare([initialCoord, endingCoord]);
        expect(expected).toEqual(false);
    });

    it(' checkIfIsSquare detect a square when its a single point', () => {
        const initialCoord: Vec2 = { x: 1, y: 5 };
        const endingCoord: Vec2 = { x: 1, y: 5 };
        const expected: boolean = service.checkIfIsSquare([initialCoord, endingCoord]);
        expect(expected).toEqual(true);
    });

    it(' closestSquare should find the closest square when the horizontal distance is the longest and when isLeft is false', () => {
        const initialCoord: Vec2 = { x: 1, y: 5 };
        const endingCoord: Vec2 = { x: 6, y: 2 };
        const expectedPosition: Vec2 = service.closestSquare([initialCoord, endingCoord]);
        const newPosition: Vec2 = { x: 4, y: 2 };
        expect(expectedPosition).toEqual(newPosition);
    });

    it(' closestSquare should find the closest square when the horizontal distance is the longest and when isLeft is true', () => {
        const initialCoord: Vec2 = { x: 25, y: 20 };
        const endingCoord: Vec2 = { x: 10, y: 10 };
        const expectedPosition: Vec2 = service.closestSquare([initialCoord, endingCoord]);
        const newPosition: Vec2 = { x: 15, y: 10 };
        expect(expectedPosition).toEqual(newPosition);
    });

    it(' closestSquare should find the closest square when the vertical distance is the longest and when isDownWard is true', () => {
        const initialCoord: Vec2 = { x: 1, y: 5 };
        const endingCoord: Vec2 = { x: 2, y: 2 };
        const expectedPosition: Vec2 = service.closestSquare([initialCoord, endingCoord]);
        const newPosition: Vec2 = { x: 2, y: 4 };
        expect(expectedPosition).toEqual(newPosition);
    });

    it(' closestSquare should find the closest square when the vertical distance is the longest and when isDownWard is false', () => {
        const initialCoord: Vec2 = { x: 20, y: 20 };
        const endingCoord: Vec2 = { x: 25, y: 40 };
        const expectedPosition: Vec2 = service.closestSquare([initialCoord, endingCoord]);
        const newPosition: Vec2 = { x: 25, y: 25 };
        expect(expectedPosition).toEqual(newPosition);
    });

    it(' closestSquare should return the initial point when the two point are on a horizontal line', () => {
        const initialCoord: Vec2 = { x: 20, y: 40 };
        const endingCoord: Vec2 = { x: 25, y: 40 };
        const expectedPosition: Vec2 = service.closestSquare([initialCoord, endingCoord]);
        const newPosition: Vec2 = { x: 20, y: 40 };
        expect(expectedPosition).toEqual(newPosition);
    });

    it(' closestSquare should return the initial point when the two point are on a vertical line', () => {
        const initialCoord: Vec2 = { x: 20, y: 99 };
        const endingCoord: Vec2 = { x: 20, y: 40 };
        const expectedPosition: Vec2 = service.closestSquare([initialCoord, endingCoord]);
        const newPosition: Vec2 = { x: 20, y: 99 };
        expect(expectedPosition).toEqual(newPosition);
    });
});

import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MagnetismService } from './magnetism.service';

describe('MagnetismService', () => {
    let service: MagnetismService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MagnetismService);
        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable *
        // tslint:disable:max-file-line-count
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('resetAnchors should set all the anchors boolean to false', () => {
        service.isTopLeft = true;
        service.isTopMiddle = true;
        service.isTopRight = true;
        service.isMiddleLeft = true;
        service.isCenter = true;
        service.isMiddleRight = true;
        service.isBottomLeft = true;
        service.isBottomMiddle = true;
        service.isBottomRight = true;

        service.resetAnchors();

        expect(service.isTopLeft).toEqual(false);
        expect(service.isTopMiddle).toEqual(false);
        expect(service.isTopRight).toEqual(false);
        expect(service.isMiddleLeft).toEqual(false);
        expect(service.isCenter).toEqual(false);
        expect(service.isMiddleRight).toEqual(false);
        expect(service.isBottomLeft).toEqual(false);
        expect(service.isBottomMiddle).toEqual(false);
        expect(service.isBottomRight).toEqual(false);
    });

    it('switchOnOrOff should set isActivated to false when isActivated is initially at true', () => {
        service.isActivated = true;
        service.switchOnOrOff();
        expect(service.isActivated).toEqual(false);
    });

    it('switchOnOrOff should set isActivated to true when isActivated is initially at false', () => {
        service.isActivated = false;
        service.switchOnOrOff();
        expect(service.isActivated).toEqual(true);
    });

    it('dispatch should return the shifting for the topLeftCorner when isTopLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopLeft = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 60,
            offsetY: 30,
        } as MouseEvent;
        service.mouseReference = { x: 30, y: 20 };
        const expectedResult: Vec2 = { x: 30, y: 10 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isTopMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 34, y: 23 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopMiddle = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 60,
            offsetY: 30,
        } as MouseEvent;
        service.mouseReference = { x: 28, y: 20 };
        const expectedResult: Vec2 = { x: 28, y: 7 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isTopRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 45, y: 12 });
        currentLine.push({ x: 34, y: 45 });
        service.resetAnchors();
        service.isTopRight = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 75,
            offsetY: 25,
        } as MouseEvent;
        service.mouseReference = { x: 20, y: 11 };
        const expectedResult: Vec2 = { x: 56, y: 18 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isMiddleLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 45, y: 12 });
        currentLine.push({ x: 34, y: 45 });
        service.resetAnchors();
        service.isMiddleLeft = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 75,
            offsetY: 25,
        } as MouseEvent;
        service.mouseReference = { x: 20, y: 11 };
        const expectedResult: Vec2 = { x: 55, y: 11.5 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isCenter is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 45, y: 12 });
        currentLine.push({ x: 80, y: 45 });
        service.resetAnchors();
        service.isCenter = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 75,
            offsetY: 55,
        } as MouseEvent;
        service.mouseReference = { x: 20, y: 11 };
        const expectedResult: Vec2 = { x: 57.5, y: 41.5 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isMiddleRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 45, y: 12 });
        currentLine.push({ x: 88, y: 65 });
        service.resetAnchors();
        service.isMiddleRight = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 54,
            offsetY: 55,
        } as MouseEvent;
        service.mouseReference = { x: 75, y: 11 };
        const expectedResult: Vec2 = { x: -18, y: 41.5 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isMiddleRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 45, y: 12 });
        currentLine.push({ x: 88, y: 65 });
        service.resetAnchors();
        service.isBottomLeft = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 54,
            offsetY: 55,
        } as MouseEvent;
        service.mouseReference = { x: 75, y: 11 };
        const expectedResult: Vec2 = { x: -25, y: 45 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isBottomMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 45, y: 12 });
        currentLine.push({ x: 88, y: 65 });
        service.resetAnchors();
        service.isBottomMiddle = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 54,
            offsetY: 55,
        } as MouseEvent;
        service.mouseReference = { x: 75, y: 11 };
        const expectedResult: Vec2 = { x: -16.5, y: 45 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return the shifting for the topLeftCorner when isBottomMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 45, y: 12 });
        currentLine.push({ x: 88, y: 65 });
        service.resetAnchors();
        service.isBottomRight = true;
        service.gridService.squareSize = 10;
        const mouseEvent = {
            offsetX: 54,
            offsetY: 55,
        } as MouseEvent;
        service.mouseReference = { x: 75, y: 11 };
        const expectedResult: Vec2 = { x: -18, y: 45 };
        expect(service.dispatch(mouseEvent, currentLine)).toEqual(expectedResult);
    });

    it('dispatch should return a shifting of 0 in x and y when there no anchors selected', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        expect(service.dispatch(mouseEvent, currentLine)).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isTopLeft is true ', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopLeft = true;
        const expectedResult: Vec2 = { x: 50, y: 0 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isTopMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopMiddle = true;
        const expectedResult: Vec2 = { x: 25, y: 0 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isTopRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopRight = true;
        const expectedResult: Vec2 = { x: 50, y: 0 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isMiddleLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleLeft = true;
        const expectedResult: Vec2 = { x: 50, y: 25 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isCenter is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isCenter = true;
        const expectedResult: Vec2 = { x: 25, y: 25 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isMiddleRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleRight = true;
        const expectedResult: Vec2 = { x: 50, y: 25 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isBottomLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomLeft = true;
        const expectedResult: Vec2 = { x: 50, y: 0 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isBottomMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomMiddle = true;
        const expectedResult: Vec2 = { x: 25, y: 0 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should the shifting for the topLeftCorner when isBottomRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomRight = true;
        const expectedResult: Vec2 = { x: 50, y: 0 };
        expect(service.moveRightHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveRightHandler should return a shifting of 0 in x and y when there is no selected anchor', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        expect(service.moveRightHandler(currentLine)).toEqual({ x: 0, y: 0 });
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isTopLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopLeft = true;
        const expectedResult: Vec2 = { x: -50, y: 0 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isTopMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopMiddle = true;
        const expectedResult: Vec2 = { x: -25, y: 0 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isTopRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopRight = true;
        const expectedResult: Vec2 = { x: -50, y: 0 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isMiddleLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleLeft = true;
        const expectedResult: Vec2 = { x: -50, y: 25 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isCenter is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isCenter = true;
        const expectedResult: Vec2 = { x: -25, y: 25 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isMiddleRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleRight = true;
        const expectedResult: Vec2 = { x: -50, y: 25 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isBottomLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomLeft = true;
        const expectedResult: Vec2 = { x: -50, y: 0 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isBottomMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomMiddle = true;
        const expectedResult: Vec2 = { x: -25, y: 0 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should the shifting for the topLeftCorner when isBottomRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomRight = true;
        const expectedResult: Vec2 = { x: -50, y: 0 };
        expect(service.moveLeftHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveLeftHandler should return a shifting of 0 in x and y when there is no selected anchor', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        expect(service.moveLeftHandler(currentLine)).toEqual({ x: 0, y: 0 });
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isTopLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopLeft = true;
        const expectedResult: Vec2 = { x: 0, y: -50 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isTopMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopMiddle = true;
        const expectedResult: Vec2 = { x: 25, y: -50 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isTopRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopRight = true;
        const expectedResult: Vec2 = { x: 0, y: -50 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isMiddleLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleLeft = true;
        const expectedResult: Vec2 = { x: 0, y: -25 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should  should the shifting for the topLeftCorner when isCenter is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isCenter = true;
        const expectedResult: Vec2 = { x: 25, y: -25 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isMiddleRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleRight = true;
        const expectedResult: Vec2 = { x: 0, y: -25 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isBottomLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomLeft = true;
        const expectedResult: Vec2 = { x: 0, y: -50 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isBottomMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomMiddle = true;
        const expectedResult: Vec2 = { x: 25, y: -50 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return the shifting for the topLeftCorner when isBottomMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomRight = true;
        const expectedResult: Vec2 = { x: 0, y: -50 };
        expect(service.moveUpHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveUpHandler should return a shifting of 0 in x and y when there is no selected anchor', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        expect(service.moveUpHandler(currentLine)).toEqual({ x: 0, y: 0 });
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isTopLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopLeft = true;
        const expectedResult: Vec2 = { x: 0, y: 50 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isTopMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopMiddle = true;
        const expectedResult: Vec2 = { x: 25, y: 50 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isTopRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isTopRight = true;
        const expectedResult: Vec2 = { x: 0, y: 50 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isMiddleLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleLeft = true;
        const expectedResult: Vec2 = { x: 0, y: 25 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isCenter is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isCenter = true;
        const expectedResult: Vec2 = { x: 25, y: 25 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isMiddleRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isMiddleRight = true;
        const expectedResult: Vec2 = { x: 0, y: 25 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isBottomLeft is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomLeft = true;
        const expectedResult: Vec2 = { x: 0, y: 50 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isBottomMiddle is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomMiddle = true;
        const expectedResult: Vec2 = { x: 25, y: 50 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return the shifting for the topLeftCorner when isBottomRight is true', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        service.isBottomRight = true;
        const expectedResult: Vec2 = { x: 0, y: 50 };
        expect(service.moveDownHandler(currentLine)).toEqual(expectedResult);
    });

    it('moveDownHandler should return a shifting of 0 in x and y when there is no selected anchor', () => {
        const currentLine: Vec2[] = [];
        currentLine.push({ x: 0, y: 0 });
        currentLine.push({ x: 50, y: 50 });
        service.resetAnchors();
        expect(service.moveDownHandler(currentLine)).toEqual({ x: 0, y: 0 });
    });

    it('calculateShifting should return the new location of the nearest grid for a specific adjustement', () => {
        service.gridService.squareSize = 5;
        service.mouseReference = { x: 20, y: 35 };
        const topLeftCorner: Vec2[] = [
            { x: 30, y: 0 },
            { x: 23, y: 45 },
            { x: 12, y: 56 },
        ];
        const adjustement: Vec2[] = [
            { x: 3, y: 2 },
            { x: 5, y: 6 },
            { x: 5.6, y: 9.9 },
        ];
        const mouseEvent = {
            offsetX: 60,
            offsetY: 30,
        } as MouseEvent;
        const expectedResult: Vec2[] = [
            { x: 42, y: -7 },
            { x: 42, y: -6 },
            { x: 42.4, y: -5.899999999999999 },
        ];
        for (let i = 0; i < adjustement.length; i++) {
            expect(service.calculateShifting(mouseEvent, topLeftCorner[i], adjustement[i]).x).toEqual(expectedResult[i].x);
            expect(service.calculateShifting(mouseEvent, topLeftCorner[i], adjustement[i]).y).toEqual(expectedResult[i].y);
        }
    });

    it('moveLeft should return the shifting for the nearest grid to the left position when the selected anchor is not already on the grid', () => {
        service.gridService.squareSize = 3;
        const topLeftCorner: Vec2[] = [
            { x: 45, y: 89 },
            { x: 45, y: 23 },
            { x: 34.9, y: 45.4 },
            { x: 455.6, y: 76.2 },
        ];
        const adjustement: Vec2[] = [
            { x: 2, y: 0 },
            { x: 2.5, y: 67.0678 },
            { x: 5, y: 9.2 },
            { x: 5.5, y: 0 },
        ];
        const expectedResult: Vec2[] = [
            { x: -2, y: 1 },
            { x: -2.5, y: -0.06780000000000541 },
            { x: -0.8999999999999986, y: -0.6000000000000014 },
            { x: -2.1000000000000227, y: -1.2000000000000028 },
        ];

        for (let i = 0; i < topLeftCorner.length; i++) {
            expect(service.moveLeft(topLeftCorner[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });

    it('moveLeft should return the shifting for the next position of the grid to the left when the selected anchor is already on the grid', () => {
        service.gridService.squareSize = 5;
        const topLeftCorner: Vec2[] = [
            { x: 45, y: 89 },
            { x: 45, y: 23 },
            { x: 34.9, y: 45.4 },
            { x: 455.6, y: 76.2 },
        ];
        const adjustement: Vec2[] = [
            { x: 0, y: 0.876 },
            { x: 5, y: 67 },
            { x: 5.1, y: 9.45 },
            { x: -0.6, y: 0 },
        ];
        const expectedResult: Vec2[] = [
            { x: -5, y: 0.12399999999999523 },
            { x: -5, y: 0 },
            { x: -5, y: 0.14999999999999858 },
            { x: -5, y: -1.2000000000000028 },
        ];

        for (let i = 0; i < topLeftCorner.length; i++) {
            expect(service.moveLeft(topLeftCorner[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });

    it('moveRight should return the shifting for the position of the nearest grid to the right when the selected anchor is not already on the grid', () => {
        service.gridService.squareSize = 4;
        const topLeftCorner: Vec2[] = [
            { x: 45, y: 89 },
            { x: 45, y: 23 },
            { x: 34.9, y: 45.4 },
            { x: 455.6, y: 76.2 },
        ];
        const adjustement: Vec2[] = [
            { x: 10, y: 0 },
            { x: 0.034, y: 67.7 },
            { x: 3, y: 9 },
            { x: 5.4, y: 0.89 },
        ];
        const expectedResult: Vec2[] = [
            { x: 1, y: -1 },
            { x: 2.966000000000001, y: 1.2999999999999972 },
            { x: 2.1000000000000014, y: 1.6000000000000014 },
            { x: 3, y: -1.0900000000000034 },
        ];

        for (let i = 0; i < topLeftCorner.length; i++) {
            expect(service.moveRight(topLeftCorner[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });

    it('moveRight should return the shifting for the next position of the grid to the right when the selected anchor is already on the grid', () => {
        service.gridService.squareSize = 5;
        const lastPos: Vec2[] = [
            { x: 45, y: 89 },
            { x: 45, y: 23 },
            { x: 34.9, y: 45.4 },
            { x: 455.6, y: 76.2 },
        ];
        const adjustement: Vec2[] = [
            { x: 0, y: 0.876 },
            { x: -5, y: 67 },
            { x: 4.9, y: 9.45 },
            { x: 4.4, y: 0 },
        ];
        const expectedResult: Vec2[] = [
            { x: 5, y: 0.12399999999999523 },
            { x: 5, y: 0 },
            { x: 0.20000000000000284, y: 0.14999999999999858 },
            { x: 5, y: -1.2000000000000028 },
        ];

        for (let i = 0; i < lastPos.length; i++) {
            expect(service.moveRight(lastPos[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });

    it('moveUp should return the shifting fot the next position up of the grid when the selected anchor is not already on the grid', () => {
        service.gridService.squareSize = 3;
        const lastPos: Vec2[] = [
            { x: 89, y: 45 },
            { x: 23, y: 45 },
            { x: 45.4, y: 34.9 },
            { x: 76.2, y: 455.6 },
        ];
        const adjustement: Vec2[] = [
            { x: 0, y: 0.6 },
            { x: 67.0678, y: -2.5 },
            { x: 9.2, y: 5 },
            { x: 0, y: 5.5 },
        ];
        const expectedResult: Vec2[] = [
            { x: 1, y: -0.6000000000000014 },
            { x: -0.06780000000000541, y: -0.5 },
            { x: -0.6000000000000014, y: -0.8999999999999986 },
            { x: -1.2000000000000028, y: -2.1000000000000227 },
        ];

        for (let i = 0; i < lastPos.length; i++) {
            expect(service.moveUp(lastPos[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });

    it('moveUp should return the shifting of the next position up of the grid when the selected anchor is already on the grid', () => {
        service.gridService.squareSize = 5;
        const lastPos: Vec2[] = [
            { x: 89, y: 45 },
            { x: 23, y: 45 },
            { x: 45.4, y: 34.9 },
            { x: 76.2, y: 455.6 },
        ];
        const adjustement: Vec2[] = [
            { x: 0.876, y: 0 },
            { x: 67, y: 5 },
            { x: 9.45, y: -4.9 },
            { x: 0, y: -0.4 },
        ];
        const expectedResult: Vec2[] = [
            { x: 0.12399999999999523, y: -5 },
            { x: 0, y: -5 },
            { x: 0.14999999999999858, y: -5 },
            { x: -1.2000000000000028, y: -0.20000000000004547 },
        ];

        for (let i = 0; i < lastPos.length; i++) {
            expect(service.moveUp(lastPos[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });

    it('moveDown should return the next position down of the grid when the selected anchor is not already on the grid', () => {
        service.gridService.squareSize = 4;
        const lastPos: Vec2[] = [
            { x: 89, y: 45 },
            { x: 23, y: 45 },
            { x: 45.4, y: 34.9 },
            { x: 76.2, y: 455.6 },
        ];
        const adjustement: Vec2[] = [
            { x: 0, y: 10 },
            { x: 67.7, y: 0.034 },
            { x: 9, y: 3 },
            { x: 0.89, y: 5.4 },
        ];
        const expectedResult: Vec2[] = [
            { x: -1, y: 1 },
            { x: 1.2999999999999972, y: 2.966000000000001 },
            { x: 1.6000000000000014, y: 2.1000000000000014 },
            { x: -1.0900000000000034, y: 3 },
        ];

        for (let i = 0; i < lastPos.length; i++) {
            expect(service.moveDown(lastPos[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });

    it('moveDown should return the shifting for the next position down of the grid when the selected anchor is already on the grid', () => {
        service.gridService.squareSize = 5;
        const lastPos: Vec2[] = [
            { x: 89, y: 45 },
            { x: 23, y: 45 },
            { x: 45.4, y: 34.9 },
            { x: 76.2, y: 455.6 },
        ];
        const adjustement: Vec2[] = [
            { x: 0.876, y: 0 },
            { x: 67, y: 5 },
            { x: 9.45, y: 5.1 },
            { x: 0, y: -0.6 },
        ];
        const expectedResult: Vec2[] = [
            { x: 0.12399999999999523, y: 5 },
            { x: 0, y: 5 },
            { x: 0.14999999999999858, y: 5 },
            { x: -1.2000000000000028, y: 5 },
        ];

        for (let i = 0; i < lastPos.length; i++) {
            expect(service.moveDown(lastPos[i], adjustement[i])).toEqual(expectedResult[i]);
        }
    });
});

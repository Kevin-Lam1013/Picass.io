import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from './grid.service';

describe('GridService', () => {
    let service: GridService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let ctxSpyObject: jasmine.SpyObj<CanvasRenderingContext2D>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        drawingServiceSpy.canvas = document.createElement('canvas');
        ctxSpyObject = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'strokeStyle',
            'beginPath',
            'moveTo',
            'lineTo',
            'stroke',
        ]);
        drawingServiceSpy.gridCtx = ctxSpyObject;

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });

        service = TestBed.inject(GridService);
        // Configuration du spy du service
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('eraseGrid should call clearCanvas from the drawing service once', () => {
        service.eraseGrid();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('setUpGrid should assign canvasWidth and canvasHeight with values from the drawingService', () => {
        const widthFromDrawingService = service['drawingService'].canvas.width;
        const heightFromDrawingService = service['drawingService'].canvas.height;
        service.setUpGrid();
        expect(service.canvasWidth).toEqual(widthFromDrawingService);
        expect(service.canvasHeight).toEqual(heightFromDrawingService);
    });

    it('setUpGrid assign the line opacity of the gridCtx to be the same as lineOpacity memeber', () => {
        service.lineOpacity = 0.6;
        const newRgbaValueGenerated = 'rgba(0,0,0,0.6)';
        service.setUpGrid();
        expect(drawingServiceSpy.gridCtx.strokeStyle).toEqual(newRgbaValueGenerated);
    });

    it('drawGrid should call eraseGrid and setUpGrid once', () => {
        const eraseGridSpy = spyOn(service, 'eraseGrid').and.callThrough();
        const setUpGridSpy = spyOn(service, 'setUpGrid').and.callThrough();
        service.drawGrid();
        expect(eraseGridSpy).toHaveBeenCalled();
        expect(setUpGridSpy).toHaveBeenCalled();
    });

    it(' showGrid should change the isGridVisible boolean of gridService every time it is called', () => {
        service.isGridVisible = false;
        service.showGrid();
        expect(service.isGridVisible).toBe(true);
        service.showGrid();
        expect(service.isGridVisible).toBe(false);
    });

    it(' showGrid should call drawGrid if isGridVisible of gridService was initially false', () => {
        service.isGridVisible = false;
        const drawGridSpy = spyOn(service, 'drawGrid').and.callThrough();
        service.showGrid();
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it(' showGrid should call eraseGridSpy if isGridVisible of gridService was initially true', () => {
        service.isGridVisible = true;
        const eraseGridSpy = spyOn(service, 'eraseGrid').and.callThrough();
        service.showGrid();
        expect(eraseGridSpy).toHaveBeenCalled();
    });

    it(' changeGridOpacity should change lineOpacity and call drawGrid from the grid service', () => {
        const newOpacity = 0.35;
        const drawGridSpy = spyOn(service, 'drawGrid').and.callThrough();
        service.changeGridOpacity(newOpacity);
        expect(service.lineOpacity).toEqual(0.35);
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it(' changeSquareSize should the squaresize and call drawGrid from the grid service', () => {
        const newSquareSize = 15;
        const drawGridSpy = spyOn(service, 'drawGrid').and.callThrough();
        service.changeSquareSize(newSquareSize);
        expect(service.squareSize).toEqual(15);
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it(' increaseSquareSizebyByFactor should increase the square size by 5 everytime it is called', () => {
        service.squareSize = 5;
        service.increaseSquareSizebyByFactor();
        expect(service.squareSize).toEqual(10);
        service.increaseSquareSizebyByFactor();
        expect(service.squareSize).toEqual(15);
    });

    it(' increaseSquareSizebyByFactor should not increase the square size if it is 100 or above', () => {
        service.squareSize = 95;
        service.increaseSquareSizebyByFactor();
        expect(service.squareSize).toEqual(100);
        service.increaseSquareSizebyByFactor();
        expect(service.squareSize).not.toEqual(105);
    });

    it(' decreaseSquareSizebyByFactor should decrease the square size by 5 everytime it is called', () => {
        service.squareSize = 20;
        service.decreaseSquareSizebyByFactor();
        expect(service.squareSize).toEqual(15);
        service.decreaseSquareSizebyByFactor();
        expect(service.squareSize).toEqual(10);
    });

    it(' decreaseSquareSizebyByFactor should not decrease the square size if it is 5 or smaller', () => {
        service.squareSize = 10;
        service.decreaseSquareSizebyByFactor();
        expect(service.squareSize).toEqual(5);
        service.decreaseSquareSizebyByFactor();
        expect(service.squareSize).not.toEqual(0);
    });
});

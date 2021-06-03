import { ElementRef, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Constant } from '@app/constants/general-constants-store';
import { ResizeCommandService } from './resize-command.service';

@Injectable()
export class MockElementRef {
    nativeElement: {};
}

describe('ResizeCommandService', () => {
    let service: ResizeCommandService;
    let mouseEvent: MouseEvent;
    const canvas: DOMRect = { left: 500, right: 1500, top: 0, bottom: 500 } as DOMRect;
    let dummyCanvas: ElementRef<HTMLCanvasElement>;
    const dummyNativeElement = document.createElement('canvas');

    mouseEvent = {
        button: 0,
    } as MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: ElementRef, useValue: MockElementRef }] });
        service = TestBed.inject(ResizeCommandService);
        dummyCanvas = new ElementRef<HTMLCanvasElement>(dummyNativeElement);

        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('startResize should set mouseDown to true on left click', () => {
        service.startResize(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('startResize should sets resizeActive to true', () => {
        service.startResize(mouseEvent);
        expect(service['drawingService'].resizeActive).toEqual(true);
    });

    it('startResize shouldnt set resizeActive to false on right click', () => {
        const rightClickMouseEvent: MouseEvent = { button: 2 } as MouseEvent;
        service.startResize(rightClickMouseEvent);
        expect(service['drawingService'].resizeActive).toEqual(true);
    });

    it('startResize should set mouseDown to false on right click', () => {
        const rightClickMouseEvent: MouseEvent = { button: 2 } as MouseEvent;
        service.startResize(rightClickMouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('resize should set preview.y to MIN_HEIGH when the mouse position is lower MIN_HEIGH when isBottom is true', () => {
        service.isBottom = true;
        service.mouseDown = true;
        const event: MouseEvent = { pageY: 100 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview.y).toEqual(Constant.MIN_HEIGH);
    });

    it('resize should set preview.y to the good value when isBottom is true', () => {
        service.isBottom = true;
        service.mouseDown = true;
        const event: MouseEvent = { pageY: 800 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview.y).toEqual(event.pageY);
    });

    it('resize should set preview.x to MIN_HEIGH when the mouse position is lower MIN_HEIGH when isSide is true', () => {
        service.isSide = true;
        service.mouseDown = true;
        const event: MouseEvent = { pageX: 100 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview.x).toEqual(Constant.MIN_HEIGH);
    });

    it('resize should set preview.x to the good value when isSide is true', () => {
        service.isSide = true;
        service.isBottom = false;
        service.isCorner = false;
        service.mouseDown = true;
        const event: MouseEvent = { pageX: 800 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview.x).toEqual(300);
    });

    it('resize should set preview.x and preview.y to the good value when isCorner is true', () => {
        service.isSide = false;
        service.isBottom = false;
        service.isCorner = true;
        service.mouseDown = true;
        const event: MouseEvent = { pageX: 800, pageY: 1000 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview).toEqual({ x: 300, y: 1000 });
    });

    it('resize should set preview.x and preview.y to MIN_WIDTH and MIN_HEIGH when both are lower than 250x250 when isCorner is true', () => {
        service.isSide = false;
        service.isBottom = false;
        service.isCorner = true;
        service.mouseDown = true;
        const event: MouseEvent = { pageX: 150, pageY: 50 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview).toEqual({ x: Constant.MIN_WIDTH, y: Constant.MIN_HEIGH });
    });

    it('resize does nothing if mouseDown is false', () => {
        service.mouseDown = false;
        service.preview.x = 1000;
        service.preview.y = 1000;
        const event: MouseEvent = { pageX: 150, pageY: 50 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview.x).toEqual(1000);
        expect(service.preview.y).toEqual(1000);
    });

    it('resize does nothing if mouseDown is true and isBottom, isSide and isCorner are false', () => {
        service.mouseDown = true;
        service.isBottom = false;
        service.isSide = false;
        service.isCorner = false;
        service.preview.x = 1000;
        service.preview.y = 1000;
        const event: MouseEvent = { pageX: 150, pageY: 50 } as MouseEvent;
        service.resize(event, canvas);
        expect(service.preview.x).toEqual(1000);
        expect(service.preview.y).toEqual(1000);
    });

    it('setBaseCanvas should set the baseCanvas to the one provided', () => {
        service.setBaseCanvas(dummyCanvas);
        expect(service.baseCanvas).toEqual(dummyCanvas);
    });

    it('setSideBools should set isCorner according to the provided bool', () => {
        service.isCorner = false;
        service.setSideBools(true, false, false);
        expect(service.isCorner).toBeTrue();
    });

    it('setSideBools should set isSide according to the provided bool', () => {
        service.isSide = false;
        service.setSideBools(false, true, false);
        expect(service.isSide).toBeTrue();
    });

    it('setSideBools should set isBottom according to the provided bool', () => {
        service.isBottom = false;
        service.setSideBools(false, false, true);
        expect(service.isBottom).toBeTrue();
    });

    it('setCanvasSize should set canvasSize to the provided dimensions', () => {
        service.canvasSize = { x: 250, y: 250 };
        service.setCanvasSize({ x: 1000, y: 800 });
        expect(service.canvasSize).toEqual({ x: 1000, y: 800 });
    });

    it('setHandles should set sideHandle at the provided position', () => {
        service.sideHandle = { x: 250, y: 125 };
        service.setHandles({ x: 1000, y: 400 }, { x: 800, y: 500 }, { x: 1000, y: 800 });
        expect(service.sideHandle).toEqual({ x: 1000, y: 400 });
    });

    it('setHandles should set bottomHandle at the provided position', () => {
        service.bottomHandle = { x: 250, y: 125 };
        service.setHandles({ x: 1000, y: 400 }, { x: 800, y: 500 }, { x: 1000, y: 800 });
        expect(service.bottomHandle).toEqual({ x: 800, y: 500 });
    });

    it('setHandles should set cornerHandle at the provided position', () => {
        service.cornerHandle = { x: 250, y: 125 };
        service.setHandles({ x: 1000, y: 400 }, { x: 800, y: 500 }, { x: 1000, y: 800 });
        expect(service.cornerHandle).toEqual({ x: 1000, y: 800 });
    });

    it('execute should call copyCanvas', () => {
        const copyCanvasSpy = spyOn(service, 'copyCanvas');
        service.copyCanvas(dummyCanvas);
        expect(copyCanvasSpy).toHaveBeenCalled();
    });

    it('execute should set the canvasSize.y to be the same as preview.y when isBottom is true', () => {
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        service.isBottom = true;
        service.isSide = false;
        service.isCorner = false;
        service.canvasSize = { x: 0, y: 0 };
        service.preview = { x: 5500, y: 300 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.execute(testCanvas);
        expect(service.canvasSize.y).toEqual(service.preview.y);
    });

    it('execute should set the canvasSize.x to be the same as preview.x when isSide is true', () => {
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        service.isBottom = false;
        service.isSide = true;
        service.isCorner = false;
        service.preview = { x: 5500, y: 300 };
        service.canvasSize = { x: 0, y: 0 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.execute(testCanvas);
        expect(service.canvasSize.x).toEqual(service.preview.x);
    });

    it('execute should set the canvasSize.x and canvasSize.y to be the same as preview.x and preview.y when isCorner is true', () => {
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        service.isBottom = false;
        service.isSide = false;
        service.isCorner = true;
        service.preview = { x: 5500, y: 300 };
        service.canvasSize = { x: 0, y: 0 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.execute(testCanvas);
        expect(service.canvasSize.x).toEqual(service.preview.x);
        expect(service.canvasSize.y).toEqual(service.preview.y);
    });

    it('execute should set mouseDown back to false', () => {
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        service.mouseDown = true;
        service.isBottom = false;
        service.isSide = false;
        service.isCorner = true;
        service.preview = { x: 5500, y: 300 };
        service.canvasSize = { x: 0, y: 0 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.execute(testCanvas);
        expect(service.mouseDown).toEqual(false);
    });

    it('execute should call relocateHandle once', () => {
        const relocateHandlesSpy = spyOn(service, 'relocateHandles').and.callThrough();
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        service.mouseDown = true;
        service.isBottom = false;
        service.isSide = false;
        service.isCorner = true;
        service.preview = { x: 5500, y: 300 };
        service.canvasSize = { x: 0, y: 0 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.execute(testCanvas);
        expect(relocateHandlesSpy).toHaveBeenCalledTimes(1);
    });

    it('execute should set resizeActive back to false', () => {
        service['drawingService'].resizeActive = true;
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        service.canvasSize = { x: 0, y: 0 };
        service.preview = { x: 5500, y: 300 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.execute(testCanvas);
        expect(service['drawingService'].resizeActive).toEqual(false);
    });

    it('relocateHandles should set handles positions based on the current size of the baseCanvas', () => {
        service.sideHandle = { x: 500, y: 500 };
        service.bottomHandle = { x: 300, y: 234 };
        service.cornerHandle = { x: 456, y: 577 };
        service.canvasSize = { x: 1000, y: 2000 };

        service.relocateHandles();

        expect(service.sideHandle.y).toEqual(service.canvasSize.y / 2);
        expect(service.sideHandle.x).toEqual(service.canvasSize.x);
        expect(service.bottomHandle.y).toEqual(service.canvasSize.y);
        expect(service.bottomHandle.x).toEqual(service.canvasSize.x / 2);
        expect(service.cornerHandle.y).toEqual(service.canvasSize.y);
        expect(service.cornerHandle.x).toEqual(service.canvasSize.x);
    });

    it('copyCanvas calls toDataURL() from the canvas', () => {
        const copyCanvasSpy = spyOn(service, 'copyCanvas').and.callThrough();
        const toDataURLSpy = spyOn(dummyCanvas.nativeElement, 'toDataURL').and.stub();
        service.copyCanvas(dummyCanvas);
        expect(copyCanvasSpy).toHaveBeenCalled();
        expect(toDataURLSpy).toHaveBeenCalled();
    });

    it('resetSideBools should set isBottom, isSide and isCorner to false', () => {
        service.resetSideBools();
        expect(service.isBottom).toBeFalse();
        expect(service.isSide).toBeFalse();
        expect(service.isCorner).toBeFalse();
    });

    it('setPreview should set preview to the provided dimensions', () => {
        service.preview = { x: 250, y: 250 };
        service.setPreview({ x: 1000, y: 800 });
        expect(service.preview).toEqual({ x: 1000, y: 800 });
    });

    it('execute should set the canvasSize.y to be the same as preview.y when isBottom is true  and should call next if notsubsribed', () => {
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        const nextSpy = spyOn(service.canvasSizeObserver, 'next').and.stub();
        service.isBottom = true;
        service.isSide = false;
        service.isCorner = false;
        service.canvasSize = { x: 0, y: 0 };
        service.preview = { x: 5500, y: 300 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.isSubscribed = true;
        service.execute(testCanvas);
        expect(service.canvasSize.y).toEqual(service.preview.y);
        expect(nextSpy).not.toHaveBeenCalled();
    });

    it('execute should set the canvasSize.x to be the same as preview.x when isSide is true and should call next if notsubsribed', () => {
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        const nextSpy = spyOn(service.canvasSizeObserver, 'next').and.stub();
        service.isBottom = false;
        service.isSide = true;
        service.isCorner = false;
        service.preview = { x: 5500, y: 300 };
        service.canvasSize = { x: 0, y: 0 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.isSubscribed = true;
        service.execute(testCanvas);
        expect(service.canvasSize.x).toEqual(service.preview.x);
        expect(nextSpy).not.toHaveBeenCalled();
    });

    it('execute should set the canvasSize.x and canvasSize.y to be the same as preview.x and preview.y when isCorner is true and should call next if notsubsribed', () => {
        const testCanvas = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D', [
            'ellipse',
            'beginPath',
            'setLineDash',
            'stroke',
            'fill',
        ]);
        spyOn(service, 'copyCanvas').and.stub();
        const nextSpy = spyOn(service.canvasSizeObserver, 'next').and.stub();
        service.isBottom = false;
        service.isSide = false;
        service.isCorner = true;
        service.preview = { x: 5500, y: 300 };
        service.canvasSize = { x: 0, y: 0 };
        service.sideHandle = { x: 0, y: 0 };
        service.bottomHandle = { x: 0, y: 0 };
        service.cornerHandle = { x: 0, y: 0 };
        service.isSubscribed = true;
        service.execute(testCanvas);
        expect(service.canvasSize.x).toEqual(service.preview.x);
        expect(service.canvasSize.y).toEqual(service.preview.y);
        expect(nextSpy).not.toHaveBeenCalled();
    });
});

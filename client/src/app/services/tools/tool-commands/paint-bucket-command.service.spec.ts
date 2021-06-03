import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PaintBucketCommandService } from './paint-bucket-command.service';

describe('PaintBucketCommandService', () => {
    let service: PaintBucketCommandService;
    let dummyCanvas: ElementRef<HTMLCanvasElement>;
    const dummyNativeElement = document.createElement('canvas');

    beforeEach(() => {
        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
        TestBed.configureTestingModule({});
        service = TestBed.inject(PaintBucketCommandService);
        dummyCanvas = new ElementRef<HTMLCanvasElement>(dummyNativeElement);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('execute should call beginPath and putImageData', () => {
        const dummyCtx = dummyCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        dummyCtx.fillStyle = 'black';
        dummyCtx.fillRect(0, 0, 100, 100);
        service.imageData = new ImageData(100, 100);
        const beginPathSpy = spyOn(dummyCtx, 'beginPath').and.stub();
        const putImageDataSpy = spyOn(dummyCtx, 'putImageData').and.stub();
        service.execute(dummyCtx);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalledWith(service.imageData, 0, 0);
    });
});

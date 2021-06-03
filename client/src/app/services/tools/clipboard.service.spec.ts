import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { ClipboardService } from './clipboard.service';

describe('ClipboardService', () => {
    let service: ClipboardService;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClipboardService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('deleteImageDataRectangle should call fillRect', () => {
        const path: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        const fillRectSpy = spyOn(baseCtxStub, 'fillRect').and.returnValue();
        service.deleteImageDataRectangle(baseCtxStub, path);
        expect(fillRectSpy).toHaveBeenCalled();
    });
});

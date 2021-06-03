import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PipetteComponent } from '@app/components/pipette/pipette.component';
import { PipetteService } from '@app/services/tools/pipette.service';

describe('PipetteComponent', () => {
    let component: PipetteComponent;
    let fixture: ComponentFixture<PipetteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PipetteComponent],
            providers: [{ provide: PipetteService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PipetteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Configuration du spy
        // tslint:disable:no-string-literal
        // tslint:disable:no-magic-numbers
        // tslint:disable:max-file-line-count
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should affect magnifierCtx with the ctx of baseCanvas', () => {
        component.ngAfterViewInit();
        expect(component.pipetteService.magnifierCtx).toEqual(component.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
    });

    it('onMouseMoves calls magnifyingPreview if the current tool is the pipette', () => {
        const event = new MouseEvent('window:mousemove');
        const magnifyingPreviewSpy = spyOn(component.toolManager.pipetteService, 'magnifyingPreview');
        component.toolManager.currentTool = component.toolManager.pipetteService;
        component.onMouseMove(event);
        expect(magnifyingPreviewSpy).toHaveBeenCalledWith(event);
    });

    it('onMouseMoves does not call magnifyingPreview if the current tool is not the pipette', () => {
        const event = new MouseEvent('window:mousemove');
        const magnifyingPreviewSpy = spyOn(component.toolManager.pipetteService, 'magnifyingPreview');
        component.toolManager.currentTool = component.toolManager.ellipseService;
        component.onMouseMove(event);
        expect(magnifyingPreviewSpy).not.toHaveBeenCalledWith(event);
    });
});

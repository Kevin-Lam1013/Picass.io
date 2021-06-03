import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { PipetteService } from '@app/services/tools/pipette.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';

@Component({
    selector: 'app-pipette',
    templateUrl: './pipette.component.html',
    styleUrls: ['./pipette.component.scss'],
})
export class PipetteComponent implements AfterViewInit {
    @ViewChild('magnifyingPreview', { static: true }) baseCanvas: ElementRef<HTMLCanvasElement>;

    magnifierCtx: CanvasRenderingContext2D;

    pipetteService: PipetteService;
    toolManager: ToolManagerService;

    constructor(pipetteService: PipetteService, toolManager: ToolManagerService) {
        this.pipetteService = pipetteService;
        this.toolManager = toolManager;
    }

    ngAfterViewInit(): void {
        this.pipetteService.magnifierCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.toolManager.currentTool === this.toolManager.pipetteService) {
            this.toolManager.pipetteService.magnifyingPreview(event);
        }
    }
}

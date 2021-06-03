import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';
import { AutoSaveService } from '@app/services/autoSave/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
    options: string[] = ['Nouveau dessin', 'Continuer un dessin', 'Ouvrir le caroussel de dessins'];

    drawingService: DrawingService;

    constructor(
        drawingService: DrawingService,
        public modal: MatDialog,
        public autoSaveService: AutoSaveService,
        public toolManager: ToolManagerService,
    ) {
        this.autoSaveService.checkIfDrawingStarted();
        this.drawingService = drawingService;
    }

    isStarted(): boolean {
        return this.drawingService.drawingStarted;
    }

    startNewDrawing(): void {
        this.toolManager.clearArrays();
        if (this.toolManager.newDrawing) {
            this.autoSaveService.clearLocalStorage();
            this.drawingService.drawingStarted = false;
        }
    }

    openCarousel(): void {
        this.modal.open(CarrouselComponent);
    }
}

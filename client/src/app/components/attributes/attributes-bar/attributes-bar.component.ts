import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarrouselComponent } from '@app/components/carrousel/carrousel.component';
import { ColorPickerComponent } from '@app/components/color-picker/color-picker.component';
import { ExportDrawingComponent } from '@app/components/export-drawing/export-drawing.component';
import { FormComponent } from '@app/components/form/form.component';
import { GridService } from '@app/services/grid/grid.service';
import { ColorService } from '@app/services/tools/color.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { faCircle, faPlusSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
    faAlignCenter,
    faAlignLeft,
    faAlignRight,
    faBold,
    faChevronDown,
    faClipboard,
    faCopy,
    faCut,
    faDownload,
    faExchangeAlt,
    faHome,
    faImages,
    faItalic,
    faSave,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { ShortcutInput } from 'ng-keyboard-shortcuts';

const FILL_VALUE = '1';
const CONTOUR_VALUE = '2';
const WAIT_TIME = 5;

@Component({
    selector: 'app-attributes-bar',
    templateUrl: './attributes-bar.component.html',
    styleUrls: ['./attributes-bar.component.scss'],
})
export class AttributesBarComponent {
    faAlignCenter: IconDefinition = faAlignCenter;
    faAlignLeft: IconDefinition = faAlignLeft;
    faAlignRight: IconDefinition = faAlignRight;
    faBold: IconDefinition = faBold;
    faItalic: IconDefinition = faItalic;
    faPlusSquare: IconDefinition = faPlusSquare;
    faDownload: IconDefinition = faDownload;
    faImages: IconDefinition = faImages;
    faSave: IconDefinition = faSave;
    faHome: IconDefinition = faHome;
    faChevronDown: IconDefinition = faChevronDown;
    faExchangeAlt: IconDefinition = faExchangeAlt;
    faCircle: IconDefinition = faCircle;
    faSquare: IconDefinition = faSquare;
    faCopy: IconDefinition = faCopy;
    faCut: IconDefinition = faCut;
    faClipboard: IconDefinition = faClipboard;
    shortcuts: ShortcutInput[] = [];

    @ViewChild(ColorPickerComponent)
    colorPicker: ColorPickerComponent;

    constructor(public toolManager: ToolManagerService, public modal: MatDialog, public colorService: ColorService, public gridService: GridService) {
        this.toolManager = toolManager;
        // source: https://www.npmjs.com/package/ng-keyboard-shortcuts
        this.shortcuts.push(
            {
                key: 'ctrl + g',
                preventDefault: true,
                command: () => {
                    this.openCarousel();
                    this.toolManager.setTool(this.toolManager.noToolService);
                },
            },
            {
                key: 'ctrl + s',
                preventDefault: true,
                command: () => {
                    this.openSaveDrawingForm();
                    this.toolManager.setTool(this.toolManager.noToolService);
                },
            },
            {
                key: '=',
                preventDefault: false,
                command: () => {
                    if (this.gridService.isGridVisible && !this.toolManager.textService.textBoxActive) {
                        this.gridService.increaseSquareSizebyByFactor();
                    }
                },
            },
            {
                key: 'plus',
                preventDefault: false,
                command: () => {
                    if (this.gridService.isGridVisible && !this.toolManager.textService.textBoxActive) {
                        this.gridService.increaseSquareSizebyByFactor();
                    }
                },
            },
            {
                key: '-',
                preventDefault: false,
                command: () => {
                    if (this.gridService.isGridVisible && !this.toolManager.textService.textBoxActive) {
                        this.gridService.decreaseSquareSizebyByFactor();
                    }
                },
            },
            {
                key: 'ctrl + e',
                preventDefault: true,
                command: () => {
                    this.export();
                    this.toolManager.setTool(this.toolManager.noToolService);
                },
            },
        );
    }

    changeWidth(width: number): void {
        this.toolManager.currentTool.changeWidth(width);
        this.toolManager.widthValue = this.toolManager.currentTool.toolStyles.lineWidth;
    }

    changeEmissionRate(rate: number): void {
        this.toolManager.airbrushService.emissionRate = rate;
    }

    changeJetDiameter(diameter: number): void {
        this.toolManager.airbrushService.jetDiameter = diameter;
    }

    changeDropletDiameter(diameter: number): void {
        this.toolManager.airbrushService.dropletDiameter = diameter;
    }

    setRectangleStyle(recStyleCode: string): void {
        if (recStyleCode === FILL_VALUE) {
            this.toolManager.rectangleService.toolStyles.fill = true;
            this.toolManager.rectangleService.contour = false;
        } else if (recStyleCode === CONTOUR_VALUE) {
            this.toolManager.rectangleService.toolStyles.fill = false;
            this.toolManager.rectangleService.contour = true;
        } else {
            this.toolManager.rectangleService.toolStyles.fill = true;
            this.toolManager.rectangleService.contour = true;
        }
    }

    setEllipseStyle(ellipseStyleCode: string): void {
        if (ellipseStyleCode === FILL_VALUE) {
            this.toolManager.ellipseService.toolStyles.fill = true;
            this.toolManager.ellipseService.border = false;
        } else if (ellipseStyleCode === CONTOUR_VALUE) {
            this.toolManager.ellipseService.toolStyles.fill = false;
            this.toolManager.ellipseService.border = true;
        } else {
            this.toolManager.ellipseService.toolStyles.fill = true;
            this.toolManager.ellipseService.border = true;
        }
    }

    setPolygonStyle(polyStyleCode: string): void {
        if (polyStyleCode === FILL_VALUE) {
            this.toolManager.polygonService.toolStyles.fill = true;
            this.toolManager.polygonService.contour = false;
        } else if (polyStyleCode === CONTOUR_VALUE) {
            this.toolManager.polygonService.toolStyles.fill = false;
            this.toolManager.polygonService.contour = true;
        } else {
            this.toolManager.polygonService.toolStyles.fill = true;
            this.toolManager.polygonService.contour = true;
        }
    }

    setLineJunction(n: string): void {
        if (n === '0') {
            this.toolManager.lineService.hasJunction = false;
        } else {
            this.toolManager.lineService.hasJunction = true;
        }
    }

    changeDiameter(newDiameter: number): void {
        this.toolManager.lineService.currentDiameter = newDiameter;
    }

    export(): void {
        this.modal.open(ExportDrawingComponent);
    }

    openCarousel(): void {
        this.modal.open(CarrouselComponent);
    }

    openSaveDrawingForm(): void {
        this.modal.open(FormComponent);
    }

    selectPrimaryColor(evt: MouseEvent): void {
        if (this.toolManager.showPalette) {
            setTimeout(() => {
                this.colorPicker.selectPrimaryColor(evt);
            }, WAIT_TIME);
        }
    }

    selectSecondaryColor(evt: MouseEvent): void {
        if (this.toolManager.showPalette) {
            setTimeout(() => {
                this.colorPicker.selectSecondaryColor(evt);
            }, WAIT_TIME);
        }
    }

    startNewDrawing(): void {
        this.toolManager.clearArrays();
        if (this.toolManager.newDrawing) {
            this.reload();
        }
    }

    reload(): void {
        window.location.reload();
    }
}

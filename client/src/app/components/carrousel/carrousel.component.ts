import { Component, OnInit } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { Drawing } from '@app/interface/drawing-interface';
import { Image } from '@app/interface/image-interface';
import { AutoSaveService } from '@app/services/autoSave/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService } from '@app/services/index/filter.service';
import { IndexService } from '@app/services/index/index.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { ShortcutInput } from 'ng-keyboard-shortcuts';

const START_ARRAY = 0;
const DEFAULT_SECOND_INDEX = 1;
const DEFAULT_THIRD_INDEX = 2;

@Component({
    selector: 'app-carrousel',
    templateUrl: './carrousel.component.html',
    styleUrls: ['./carrousel.component.scss'],
})
export class CarrouselComponent implements OnInit {
    visible: boolean;
    filterService: FilterService;
    allDataFromDB: Drawing[];
    showImages: boolean = false;
    availableImages: Image[] = [];
    firstSlideIndex: number = START_ARRAY;
    secondSlideIndex: number = DEFAULT_SECOND_INDEX;
    thirdSlideIndex: number = DEFAULT_THIRD_INDEX;
    shortcuts: ShortcutInput[] = [];
    isLoading: boolean = false;

    constructor(
        filterService: FilterService,
        private indexService: IndexService,
        public drawingService: DrawingService,
        private toolManager: ToolManagerService,
        public autoSave: AutoSaveService,
    ) {
        this.filterService = filterService;
        this.shortcuts.push(
            {
                key: 'left',
                preventDefault: true,
                command: () => this.moveLeft(),
            },
            {
                key: 'right',
                preventDefault: true,
                command: () => this.moveRight(),
            },
        );
    }

    ngOnInit(): void {
        this.visible = false;
    }

    resetIndex(): void {
        this.firstSlideIndex = START_ARRAY;
        this.secondSlideIndex = DEFAULT_SECOND_INDEX;
        this.thirdSlideIndex = DEFAULT_THIRD_INDEX;
    }

    getDrawings(): void {
        this.resetIndex();
        this.availableImages = [];
        this.indexService.basicGet().subscribe(
            (drawings: Drawing[]) => {
                if (drawings.length > 0) {
                    this.allDataFromDB = drawings;
                    this.filterService.filteringToGet(this.allDataFromDB, this.availableImages);
                    this.showImages = true;
                    this.isLoading = false;

                    if (this.availableImages.length === 0) {
                        alert('Aucun dessin possede cette/ces etiquette(s)');
                    }
                } else {
                    alert('la base de donnes est vide');
                }
            },
            (error: Error) => {
                alert('Il faut se connecter au serveur');
            },
        );
        this.isLoading = true;
    }

    deleteDrawings(id: string): void {
        this.indexService.basicDelete(id).subscribe(() => {
            this.isLoading = false;
        });
        this.updateAvailableImages(id);
        this.isLoading = true;
    }

    moveRight(): void {
        this.firstSlideIndex = this.firstSlideIndex - 1 < 0 ? this.availableImages.length - 1 : this.firstSlideIndex - 1;
        this.secondSlideIndex = this.secondSlideIndex - 1 < 0 ? this.availableImages.length - 1 : this.secondSlideIndex - 1;
        this.thirdSlideIndex = this.thirdSlideIndex - 1 < 0 ? this.availableImages.length - 1 : this.thirdSlideIndex - 1;
    }

    moveLeft(): void {
        this.firstSlideIndex = this.firstSlideIndex + 1 >= this.availableImages.length ? START_ARRAY : this.firstSlideIndex + 1;
        this.secondSlideIndex = this.secondSlideIndex + 1 >= this.availableImages.length ? START_ARRAY : this.secondSlideIndex + 1;
        this.thirdSlideIndex = this.thirdSlideIndex + 1 >= this.availableImages.length ? START_ARRAY : this.thirdSlideIndex + 1;
    }

    disableShortcut(): void {
        this.toolManager.allowKeyPressEvents = false;
    }

    enableShortcut(): void {
        this.toolManager.allowKeyPressEvents = true;
    }

    loadDrawing(path: string): void {
        const imageToLoad = new Image();
        imageToLoad.src = path;

        // fixes the following error: Tainted canvases may not be exported
        // https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported
        imageToLoad.crossOrigin = 'anonymous';

        this.toolManager.clearArrays();
        if (this.drawingService.drawingStarted === false) {
            imageToLoad.onload = () => {
                this.setUpImage(imageToLoad);
            };
        }
    }

    updateAvailableImages(id: string): void {
        for (let i = 0; i < this.availableImages.length; i++) {
            if (this.availableImages[i].id === id) {
                this.availableImages.splice(i, 1);
                this.resetIndex();
                break;
            }
        }
    }

    setUpImage(imageToLoad: HTMLImageElement): void {
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fillRect(0, 0, this.drawingService.baseCtx.canvas.width, this.drawingService.baseCtx.canvas.height);
        this.drawingService.baseCtx.drawImage(imageToLoad, 0, 0);
        const canvasSize: Vec2 = { x: this.drawingService.baseCtx.canvas.width, y: this.drawingService.baseCtx.canvas.height };
        this.autoSave.saveDrawing(canvasSize, this.drawingService.baseCtx.canvas);
    }
}

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-export-drawing',
    templateUrl: './export-drawing.component.html',
    styleUrls: ['./export-drawing.component.scss'],
})
export class ExportDrawingComponent implements AfterViewInit {
    exportForm: FormGroup;
    fileNameControl: FormControl = new FormControl('', [Validators.pattern('^[a-zA-ZÀ-ÿ](\\d|[a-zA-ZÀ-ÿ ]){0,20}$'), Validators.required]);
    fileExtentionControl: FormControl = new FormControl('', [Validators.required]);
    filterControl: FormControl = new FormControl('none', [Validators.required]);
    fileDestinationControl: FormControl = new FormControl('', [Validators.required]);
    linkObservale: Observable<string>;
    link: string;

    @ViewChild('filterPreviewCanvas', { static: false }) filterPreviewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('downloadLink') downloadLink: ElementRef;

    filterPreviewCtx: CanvasRenderingContext2D;

    constructor(
        private formBuilder: FormBuilder,
        public drawingService: DrawingService,
        private toolManager: ToolManagerService,
        public snackBar: MatSnackBar,
    ) {
        this.exportForm = this.formBuilder.group({
            fileName: this.fileNameControl,
            fileExtension: this.fileExtentionControl,
            filter: this.filterControl,
            fileDestination: this.fileDestinationControl,
        });
        this.drawingService = drawingService;
        Object.defineProperty(this.fileDestinationControl, 'value', { value: 'local' });
        Object.defineProperty(this.fileExtentionControl, 'value', { value: 'png' });
    }

    ngAfterViewInit(): void {
        this.filterPreviewCtx = this.filterPreviewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawImageOnFilterPreviewCanvas();
    }

    drawImageOnFilterPreviewCanvas(): void {
        this.drawingService.clearCanvas(this.filterPreviewCtx);
        this.filterPreviewCtx.fillStyle = 'white';
        this.filterPreviewCtx.fillRect(0, 0, this.filterPreviewCtx.canvas.width, this.filterPreviewCtx.canvas.height);
        this.filterPreviewCtx.drawImage(
            this.drawingService.canvas,
            0,
            0,
            this.drawingService.canvas.width,
            this.drawingService.canvas.height,
            0,
            0,
            this.filterPreviewCanvas.nativeElement.width,
            this.filterPreviewCanvas.nativeElement.height,
        );
    }

    exportDrawing(): void {
        if (this.fileDestinationControl.value === 'local') {
            this.localExport();
        } else {
            this.imgurExport();
        }
    }

    localExport(): void {
        this.drawImageReadyToExport();
        const imageUrl = this.filterPreviewCanvas.nativeElement.toDataURL('image/' + this.fileExtentionControl.value);
        this.downloadLink.nativeElement.href = imageUrl;
        this.downloadLink.nativeElement.download = this.fileNameControl.value + '.' + this.fileExtentionControl.value;
        this.downloadLink.nativeElement.click();
    }

    imgurExport(): void {
        const formData = new FormData();
        this.drawImageReadyToExport();
        const imageUrl = this.filterPreviewCanvas.nativeElement.toDataURL('image/' + this.fileExtentionControl.value).split(',')[1];
        formData.append('image', imageUrl);
        formData.append('type', 'base64');
        formData.append('name', this.fileNameControl.value);
        fetch('https://api.imgur.com/3/upload/', {
            method: 'post',
            headers: {
                Authorization: 'Client-ID 8aaa19dc7038061',
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((response) => (this.link = response.data.link))
            .then(() => this.openSnackBar());
    }

    openSnackBar(): void {
        const observable = this.snackBar
            .open("L'image a bien été exportée sur Imgur ! Voici le lien : \n" + this.link, 'Copier dans\n le presse-papier')
            .onAction();
        observable.subscribe(() => navigator.clipboard.writeText(this.link));
    }

    applyFilter(): void {
        this.filterPreviewCtx.filter = this.filterControl.value;
        this.drawImageOnFilterPreviewCanvas();
    }

    drawImageReadyToExport(): void {
        this.filterPreviewCanvas.nativeElement.width = this.drawingService.canvas.width;
        this.filterPreviewCanvas.nativeElement.height = this.drawingService.canvas.height;
        this.applyFilter();
    }

    disableShortcut(): void {
        this.toolManager.allowKeyPressEvents = false;
    }

    enableShortcut(): void {
        this.toolManager.allowKeyPressEvents = true;
    }
}

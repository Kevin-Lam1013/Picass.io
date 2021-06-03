// inspired by : https://malcoded.com/posts/angular-color-picker/
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    @Output()
    color: EventEmitter<string> = new EventEmitter();

    ctx: CanvasRenderingContext2D;
    mouseDown: boolean = false;
    selectedHeight: number;

    ngAfterViewInit(): void {
        this.draw();
    }

    draw(): void {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        }
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;

        this.ctx.clearRect(0, 0, width, height);

        const gradientPosition1 = 0;
        const gradientPosition2 = 0.17;
        const gradientPosition3 = 0.34;
        const gradientPosition4 = 0.51;
        const gradientPosition5 = 0.68;
        const gradientPosition6 = 0.85;
        const gradientPosition7 = 1;

        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(gradientPosition1, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(gradientPosition2, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(gradientPosition3, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(gradientPosition4, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(gradientPosition5, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(gradientPosition6, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(gradientPosition7, 'rgba(255, 0, 0, 1)');

        this.ctx.beginPath();
        this.ctx.rect(0, 0, width, height);

        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.closePath();

        if (this.selectedHeight) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'white';
            const defaultLineWidth = 5;
            this.ctx.lineWidth = defaultLineWidth;
            const yAxisSubtrahend = 5;
            const xCoordStartingPt = 0;
            const yCoordStartingPt: number = this.selectedHeight - yAxisSubtrahend;
            const heightRect = 10;
            this.ctx.rect(xCoordStartingPt, yCoordStartingPt, width, heightRect);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        this.mouseDown = false;
    }

    onMouseDown(evt: MouseEvent): void {
        this.mouseDown = true;
        this.selectedHeight = evt.offsetY;
        this.draw();
        this.emitColor(evt.offsetX, evt.offsetY);
    }

    onMouseMove(evt: MouseEvent): void {
        if (this.mouseDown) {
            this.selectedHeight = evt.offsetY;
            this.draw();
            this.emitColor(evt.offsetX, evt.offsetY);
        }
    }

    emitColor(x: number, y: number): void {
        const rgbaColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPosition(x: number, y: number): string {
        const rectangleWidth = 1;
        const rectangleHeight = 1;
        const firstIndex = 0;
        const secondIndex = 1;
        const lastIndex = 2;
        const imageData = this.ctx.getImageData(x, y, rectangleWidth, rectangleHeight).data;
        return 'rgba(' + imageData[firstIndex] + ',' + imageData[secondIndex] + ',' + imageData[lastIndex] + ',1)';
    }
}

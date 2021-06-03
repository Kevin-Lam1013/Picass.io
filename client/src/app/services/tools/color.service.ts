import { Injectable } from '@angular/core';
import { MouseButton } from '@app/enums/enums';
import { faPalette, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Queue } from 'queue-typescript';

const MAX_NUMBER_IN_LIST_OF_LAST_USED = 10;

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    primaryColor: string;
    primaryColorPreview: string;
    secondaryColor: string;
    secondaryColorPreview: string;
    primaryOpacity: number;
    secondaryOpacity: number;
    primaryOpacityPreview: number;
    secondaryOpacityPreview: number;
    tenLastUsedColors: Queue<string>;
    icon: IconDefinition = faPalette;
    isConfirmed: boolean = false;
    mouseDown: boolean = false;

    constructor() {
        this.primaryColor = 'rgba(0,0,0,1)';
        this.primaryColorPreview = 'rgba(0,0,0,1)';
        this.secondaryColor = 'rgba(0,0,0,1)';
        this.secondaryColorPreview = 'rgba(0,0,0,1)';
        this.primaryOpacity = 1;
        this.secondaryOpacity = 1;
        this.primaryOpacityPreview = 1;
        this.secondaryOpacityPreview = 1;
        this.tenLastUsedColors = new Queue<string>();
    }

    changePrimaryOpacity(opacity: number): void {
        this.primaryOpacityPreview = opacity;
        this.setPrimaryColorWithOpacity(opacity);
    }

    changeSecondaryOpacity(opacity: number): void {
        this.secondaryOpacityPreview = opacity;
        this.setSecondaryColorWithOpacity(opacity);
    }

    setPrimaryColorWithOpacity(opacity: number): void {
        const colors: string[] = this.primaryColorPreview.split(',');
        this.primaryColorPreview = colors[0] + ',' + colors[1] + ',' + colors[2] + ',' + opacity + ')';
    }

    setSecondaryColorWithOpacity(opacity: number): void {
        const colors: string[] = this.secondaryColorPreview.split(',');
        this.secondaryColorPreview = colors[0] + ',' + colors[1] + ',' + colors[2] + ',' + opacity + ')';
    }

    setColorWithOpacity(color: string, opacity: number): string {
        const colors: string[] = color.split(',');
        color = colors[0] + ',' + colors[1] + ',' + colors[2] + ',' + opacity + ')';
        return color;
    }

    swapPrimaryAndSecondary(): void {
        let tempPreview: string;
        tempPreview = this.primaryColorPreview;

        this.primaryColorPreview = this.secondaryColorPreview;
        this.secondaryColorPreview = tempPreview;

        this.setPrimaryColorWithOpacity(this.primaryOpacityPreview);
        this.setSecondaryColorWithOpacity(this.secondaryOpacityPreview);
    }

    contains(color: string): boolean {
        const array = this.tenLastUsedColors.toArray();
        for (const lastUsed of array) {
            if (lastUsed === color) {
                return true;
            }
        }
        return false;
    }

    resetValuesOnCancel(): void {
        this.primaryColorPreview = this.primaryColor;
        this.secondaryColorPreview = this.secondaryColor;
        this.primaryOpacityPreview = this.primaryOpacity;
        this.secondaryOpacityPreview = this.secondaryOpacity;
    }

    setValuesOnConfirm(): void {
        const maxOpacity = 1;
        const primaryColorPreviewMaxOpacity = this.setColorWithOpacity(this.primaryColorPreview, maxOpacity);
        const primaryColorMaxOpacity = this.setColorWithOpacity(this.primaryColor, maxOpacity);
        if (primaryColorPreviewMaxOpacity !== primaryColorMaxOpacity) {
            this.pushToQueueOnConfirm(primaryColorPreviewMaxOpacity);
        }
        const secondaryColorPreviewMaxOpacity = this.setColorWithOpacity(this.secondaryColorPreview, maxOpacity);
        const secondaryColorMaxOpacity = this.setColorWithOpacity(this.secondaryColor, maxOpacity);
        if (secondaryColorPreviewMaxOpacity !== secondaryColorMaxOpacity) {
            this.pushToQueueOnConfirm(secondaryColorPreviewMaxOpacity);
        }
        this.primaryColor = this.primaryColorPreview;
        this.secondaryColor = this.secondaryColorPreview;
        this.primaryOpacity = this.primaryOpacityPreview;
        this.secondaryOpacity = this.secondaryOpacityPreview;
    }

    pushToQueueOnConfirm(color: string): void {
        if (!this.contains(color)) {
            this.tenLastUsedColors.append(color);
            if (this.tenLastUsedColors.length > MAX_NUMBER_IN_LIST_OF_LAST_USED) {
                this.tenLastUsedColors.dequeue();
            }
        } else {
            if (this.tenLastUsedColors.length > 1) {
                this.tenLastUsedColors.remove(color);
                this.tenLastUsedColors.append(color);
            }
            if (this.tenLastUsedColors.length > MAX_NUMBER_IN_LIST_OF_LAST_USED) {
                this.tenLastUsedColors.dequeue();
            }
        }
    }

    onLeftClickPreviousColor(evt: MouseEvent, color: string): void {
        this.mouseDown = evt.button === MouseButton.Left;
        if (this.mouseDown === true) {
            this.primaryColorPreview = color;
            this.setPrimaryColorWithOpacity(this.primaryOpacityPreview);
            this.pushToQueueOnConfirm(color);
            if (this.isConfirmed) {
                this.isConfirmed = false;
            }
        }
    }

    onRightClickPreviousColor(evt: MouseEvent, color: string): boolean {
        this.mouseDown = evt.button === MouseButton.Left;
        this.secondaryColorPreview = color;
        this.setSecondaryColorWithOpacity(this.secondaryOpacityPreview);
        this.pushToQueueOnConfirm(color);
        if (this.isConfirmed) {
            this.isConfirmed = false;
        }
        return false;
    }

    setColor(primary: boolean, color: string): void {
        if (primary) {
            this.primaryColor = color;
            this.setPrimaryColorWithOpacity(this.primaryOpacityPreview);
        } else {
            this.secondaryColor = color;
            this.setSecondaryColorWithOpacity(this.secondaryOpacityPreview);
        }
    }

    setColorPreview(primary: boolean, color: string): void {
        if (primary) {
            this.primaryColorPreview = color;
        } else {
            this.secondaryColorPreview = color;
        }
    }
}

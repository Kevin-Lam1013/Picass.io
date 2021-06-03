import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { Vec2 } from './vec2';

export interface ToolStyles {
    primaryColor: string;
    lineWidth: number;
    fill?: boolean;
    secondaryColor?: string;
}

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    currentWidth: number;
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    shortcut: string;
    index: number;
    toolName: string = '';

    localShortcuts: Map<string, () => void>;
    currentCommand: () => void;
    history: Vec2[][];
    toolStyles: ToolStyles;
    isActive: boolean = false;

    constructor(protected drawingService: DrawingService) {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseClick(event: MouseEvent): void {}

    onDoubleClick(event: MouseEvent): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    localShortCutHandler(key: string): void {
        this.currentCommand = this.localShortcuts.get(key) as () => void;
        this.currentCommand();
    }
    redrawLine(ctx: CanvasRenderingContext2D, path: Vec2[], style: ToolStyles): void {}

    setStyles(): void {
        if (this.toolStyles.fill) {
            this.drawingService.previewCtx.fillStyle = this.toolStyles.secondaryColor as string;
            this.drawingService.baseCtx.fillStyle = this.toolStyles.secondaryColor as string;
        } else {
            this.drawingService.previewCtx.fillStyle = 'white';
            this.drawingService.baseCtx.fillStyle = 'white';
        }
        this.drawingService.previewCtx.strokeStyle = this.toolStyles.primaryColor;
        this.drawingService.baseCtx.strokeStyle = this.toolStyles.primaryColor;
        this.drawingService.previewCtx.lineWidth = this.toolStyles.lineWidth;
        this.drawingService.baseCtx.lineWidth = this.toolStyles.lineWidth;
    }

    changeWidth(newWidth: number): void {
        this.toolStyles.lineWidth = newWidth;
    }

    setColors(colorService: ColorService): void {
        this.toolStyles.primaryColor = colorService.primaryColor;
        this.toolStyles.secondaryColor = colorService.secondaryColor;
    }

    clearArrays(): void {}
}

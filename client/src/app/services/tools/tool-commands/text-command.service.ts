import { Injectable } from '@angular/core';
import { UndoRedoCommand } from '@app/classes/undo-redo-command';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class TextCommandService extends UndoRedoCommand {
    font: string = 'Times New Roman';
    textArray: string[] = [''];
    alignment: CanvasTextAlign = 'left';
    startingPoint: Vec2 = { x: 0, y: 0 };
    endPoint: Vec2 = { x: 0, y: 0 };
    italic: boolean = false;
    bold: boolean = false;
    constructor() {
        super();
        this.toolStyle = {
            primaryColor: 'black',
            lineWidth: 30,
        };
    }

    setTextAttributes(
        fontSize: number,
        font: string,
        textArray: string[],
        alignment: CanvasTextAlign,
        startingPoint: Vec2,
        endPoint: Vec2,
        primaryColor: string,
        italic: boolean,
        bold: boolean,
    ): void {
        this.toolStyle.lineWidth = fontSize;
        this.font = font;
        this.textArray = Object.assign([], textArray);
        this.alignment = alignment;
        this.startingPoint = { x: startingPoint.x, y: startingPoint.y };
        this.endPoint = { x: endPoint.x, y: endPoint.y };
        this.toolStyle.primaryColor = primaryColor;
        this.italic = italic;
        this.bold = bold;
    }

    setFontStyle(ctx: CanvasRenderingContext2D): void {
        if (this.italic && !this.bold) {
            ctx.font = 'italic ' + this.toolStyle.lineWidth + 'px ' + this.font;
        } else if (this.bold && !this.italic) {
            ctx.font = 'bold ' + this.toolStyle.lineWidth + 'px ' + this.font;
        } else if (this.bold && this.italic) {
            ctx.font = 'italic bold ' + this.toolStyle.lineWidth + 'px ' + this.font;
        } else {
            ctx.font = this.toolStyle.lineWidth + 'px ' + this.font;
        }
    }

    evaluateAlignment(ctx: CanvasRenderingContext2D, index: number): void {
        if (this.alignment === 'left') {
            ctx.fillText(
                this.textArray[index],
                this.startingPoint.x,
                this.startingPoint.y + this.toolStyle.lineWidth + this.toolStyle.lineWidth * index,
            );
        } else if (this.alignment === 'right') {
            ctx.fillText(this.textArray[index], this.endPoint.x, this.startingPoint.y + this.toolStyle.lineWidth + this.toolStyle.lineWidth * index);
        } else {
            ctx.fillText(
                this.textArray[index],
                (this.endPoint.x - this.startingPoint.x) / 2 + this.startingPoint.x,
                this.startingPoint.y + this.toolStyle.lineWidth + this.toolStyle.lineWidth * index,
            );
        }
    }

    execute(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.toolStyle.primaryColor;
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < this.textArray.length; i++) {
            ctx.textAlign = this.alignment;
            this.setFontStyle(ctx);
            this.evaluateAlignment(ctx, i);
        }
    }
}

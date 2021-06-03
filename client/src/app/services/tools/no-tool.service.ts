import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

const TOOL_INDEX = 13;
@Injectable({
    providedIn: 'root',
})
export class NoToolService extends Tool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.index = TOOL_INDEX;
        this.localShortcuts = new Map();
        this.shortcut = 'y';
        this.toolStyles = {
            primaryColor: 'rgba(0,0,0,1)',
            lineWidth: 30,
        };
    }
}

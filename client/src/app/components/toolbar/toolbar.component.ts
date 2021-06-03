import { Component } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { AutoSaveService } from '@app/services/autoSave/auto-save.service';
import { GridService } from '@app/services/grid/grid.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { UndoRedoManagerService } from '@app/services/tools/undo-redo-manager.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import {
    faBars,
    faEraser,
    faEyeDropper,
    faFillDrip,
    faPalette,
    faPen,
    faPlay,
    faRedoAlt,
    faSlash,
    faSprayCan,
    faStamp,
    faTh,
    faUndoAlt,
    faVectorSquare,
} from '@fortawesome/free-solid-svg-icons';
import { ShortcutInput } from 'ng-keyboard-shortcuts';

const WAIT_TIME = 1000;

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
    shortcuts: ShortcutInput[] = [];
    tools: Tool[];
    showAdvanced: boolean = false;
    widthValue: number = this.toolManager.currentTool.toolStyles.lineWidth;
    faPen: IconDefinition = faPen;
    faSquare: IconDefinition = faSquare;
    faSlash: IconDefinition = faSlash;
    faEraser: IconDefinition = faEraser;
    faCircle: IconDefinition = faCircle;
    faPalette: IconDefinition = faPalette;
    faBars: IconDefinition = faBars;
    faEyeDropper: IconDefinition = faEyeDropper;
    faSprayCan: IconDefinition = faSprayCan;
    faUndoAlt: IconDefinition = faUndoAlt;
    faRedoAlt: IconDefinition = faRedoAlt;
    faTh: IconDefinition = faTh;
    faFillDrip: IconDefinition = faFillDrip;
    faStamp: IconDefinition = faStamp;
    faVectorSquare: IconDefinition = faVectorSquare;
    faPlay: IconDefinition = faPlay;

    constructor(
        public toolManager: ToolManagerService,
        public undoRedoManager: UndoRedoManagerService,
        public gridService: GridService,
        public autoSave: AutoSaveService,
    ) {
        this.toolManager = toolManager;
        this.tools = toolManager.tools;
        this.undoRedoManager = undoRedoManager;
        this.shortcuts.push({
            key: 'g',
            preventDefault: false,
            command: () => {
                if (!this.toolManager.textService.textBoxActive) {
                    this.gridService.showGrid();
                }
            },
        });
        this.undoRedoManager.clearUndoStack();
        this.undoRedoManager.clearRedoStack();
        this.undoRedoManager.disableUndoRedo();
    }

    undo(): void {
        this.undoRedoManager.undo();
        setTimeout(() => {
            this.autoSave.saveDrawingDefault();
        }, WAIT_TIME);
    }

    redo(): void {
        this.undoRedoManager.redo();
        setTimeout(() => {
            this.autoSave.saveDrawingDefault();
        }, WAIT_TIME);
    }
}

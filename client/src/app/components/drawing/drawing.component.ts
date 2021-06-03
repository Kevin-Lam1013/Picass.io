import { AfterViewInit, Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { Constant } from '@app/constants/general-constants-store';
import { AutoSaveService } from '@app/services/autoSave/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { KeyboardShortcutManagerService } from '@app/services/tools/keyboard-shortcut-manager.service';
import { ResizeCommandService } from '@app/services/tools/tool-commands/resize-command.service';
import { ToolManagerService } from '@app/services/tools/tool-manager.service';
import { UndoRedoManagerService } from '@app/services/tools/undo-redo-manager.service';
import { ShortcutInput } from 'ng-keyboard-shortcuts';

const WAIT_TIME = 10;
const LONGER_WAIT_TIME = 500;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: true }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundMediatorCanvas', { static: true }) backgroundMediatorCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('backgroundCanvas', { static: true }) backgroundLayer: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: true }) gridCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('input') input: ElementRef;
    @ViewChildren('baseCanvas, previewCanvas, backgroundCanvas, gridCanvas, backgroundMediatorCanvas') allCanvases: QueryList<
        ElementRef<HTMLCanvasElement>
    >;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private backgroundMediatorCtx: CanvasRenderingContext2D;
    private backgroundCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    canvasSize: Vec2 = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT };
    mouseDown: boolean = false;
    canvas: DOMRect;
    mouse: Vec2;
    resizeServiceCommand: ResizeCommandService;
    windowSize: Vec2 = { x: window.innerWidth, y: window.innerHeight };
    timeOutDuration: number = 170;
    undoRedoManager: UndoRedoManagerService;
    shortcuts: ShortcutInput[] = [];
    tools: Tool[];
    currentTool: Tool;
    shortcutKeyboardManager: KeyboardShortcutManagerService;
    toolManager: ToolManagerService;
    clickCount: number = 0;
    ellipseService: Tool;

    constructor(
        private drawingService: DrawingService,
        toolManager: ToolManagerService,
        keyboardManager: KeyboardShortcutManagerService,
        resizeCommandService: ResizeCommandService,
        undoRedoManager: UndoRedoManagerService,
        public gridService: GridService,
        public autoSaveService: AutoSaveService,
    ) {
        this.autoSaveService.checkIfDrawingStarted();
        if (this.drawingService.drawingStarted) {
            this.canvasSize = this.autoSaveService.getSavedCanvasSize();
        }
        this.resizeServiceCommand = resizeCommandService;
        this.toolManager = toolManager;
        this.tools = toolManager.tools;
        this.shortcutKeyboardManager = keyboardManager;
        this.toolManager.currentToolChange.subscribe((value) => (this.currentTool = value));
        this.currentTool = this.toolManager.currentTool;
        this.undoRedoManager = undoRedoManager;
        this.ellipseService = this.toolManager.ellipseService;
        this.resizeServiceCommand.bottomHandle = { x: this.canvasSize.x / 2, y: this.canvasSize.y };
        this.resizeServiceCommand.sideHandle = { x: this.canvasSize.x, y: this.canvasSize.y / 2 };
        this.resizeServiceCommand.cornerHandle = { x: this.canvasSize.x, y: this.canvasSize.y };
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.backgroundCtx = this.backgroundLayer.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.backgroundMediatorCtx = this.backgroundMediatorCtx;
        this.drawingService.backgroundCtx = this.backgroundCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.canvasSize = this.canvasSize;
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
        if (this.drawingService.drawingStarted) {
            this.autoSaveService.restoreOldDrawing();
            const savedDrawing = new Image();
            savedDrawing.src = this.autoSaveService.localStorage.getItem('savedDrawing') as string;
            savedDrawing.onload = () => {
                this.baseCtx.drawImage(savedDrawing, 0, 0);
            };
        }

        this.shortcuts.push(
            {
                key: 'ctrl + a',
                preventDefault: true,
                command: () => {
                    this.toolManager.setTool(this.toolManager.rectangleSelection);
                    this.toolManager.rectangleSelection.selectAll();
                },
            },
            {
                key: 'ctrl + o',
                preventDefault: true,
                command: () => {
                    this.toolManager.clearArrays();
                    if (this.toolManager.newDrawing) {
                        this.canvasSize = { x: Constant.DEFAULT_WIDTH, y: Constant.DEFAULT_HEIGHT };
                        this.reload();
                    }
                },
            },
            {
                key: 'ctrl + z',
                preventDefault: true,
                command: () => {
                    this.undoRedoManager.undo();
                    setTimeout(() => {
                        this.autoSaveService.saveDrawing(this.canvasSize, this.baseCanvas.nativeElement);
                    }, WAIT_TIME);
                },
            },
            {
                key: 'ctrl + shift + z',
                preventDefault: true,
                command: () => {
                    this.undoRedoManager.redo();
                    setTimeout(() => {
                        this.autoSaveService.saveDrawing(this.canvasSize, this.baseCanvas.nativeElement);
                    }, WAIT_TIME);
                },
            },
            {
                key: 'f5',
                preventDefault: true,
                command: () => {
                    this.autoSaveService.saveDrawing(this.canvasSize, this.baseCanvas.nativeElement);
                    this.reload();
                },
            },
            {
                key: 'del',
                preventDefault: true,
                command: () => {
                    this.shortcutKeyboardManager.deleteHandler(this.toolManager);
                },
            },
            {
                key: 'ctrl + c',
                preventDefault: false,
                command: () => {
                    this.shortcutKeyboardManager.copyHandler(this.toolManager);
                },
            },
            {
                key: 'ctrl + v',
                preventDefault: true,
                command: () => {
                    this.shortcutKeyboardManager.pasteHandler(this.toolManager);
                },
            },
            {
                key: 'ctrl + x',
                preventDefault: true,
                command: () => {
                    this.shortcutKeyboardManager.cutHandler(this.toolManager);
                },
            },
            {
                key: 'm',
                preventDefault: true,
                command: () => {
                    this.shortcutKeyboardManager.magnetismHandler(this.toolManager);
                },
            },
        );
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            if (this.toolManager.currentTool === this.toolManager.textService) {
                if (this.toolManager.textService.textBoxActive) {
                    this.toolManager.disableShortcut();
                    if (this.toolManager.textService.allowText) {
                        event.preventDefault();
                        this.shortcutKeyboardManager.textToolShortcutListener(this.toolManager, event);
                    }
                } else {
                    this.toolManager.enableShortcut();
                }
            }
        });
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            if (this.toolManager.allowKeyPressEvents && event.ctrlKey === false) {
                event.preventDefault();
                this.shortcutKeyboardManager.onKeyPress(event.key);
            }
            this.drawingService.clearBackground();
        });
        this.canvas = this.baseCanvas.nativeElement.getBoundingClientRect();
        window.addEventListener('keyup', (e) => {
            if (this.toolManager.currentTool === this.toolManager.ellipseSelection) {
                this.toolManager.ellipseSelection.keyupHandler(e);
            } else if (this.toolManager.currentTool === this.toolManager.rectangleSelection) {
                this.toolManager.rectangleSelection.keyupHandler(e);
            }
        });
        window.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
        });
        window.addEventListener(
            'wheel',
            (event: WheelEvent) => {
                if (this.toolManager.currentTool === this.toolManager.stampService) {
                    this.toolManager.stampService.onMouseWheel(event);
                }
            },
            // https://github.com/inuyaksa/jquery.nicescroll/issues/799
            // solves the following problem:
            // "[Chrome] Unable to preventDefault inside passive event listener due to target being treated as passive"
            { passive: false },
        );
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.resizeServiceCommand.mouseDown) {
            this.resizeServiceCommand.resize(event, this.canvas);
            this.undoRedoManager.disableUndoRedo();
        } else if (event.pageX > this.canvas.left + window.scrollY) {
            this.currentTool.onMouseMove(event);
        }
        if (this.toolManager.currentTool === this.toolManager.ellipseService && this.toolManager.ellipseService.mouseDown) {
            this.toolManager.ellipseService.onMouseMove(event);
        }
        if (this.toolManager.currentTool === this.toolManager.stampService) {
            for (const canvas of this.allCanvases) {
                canvas.nativeElement.style.cursor = 'none';
            }
        } else if (this.toolManager.currentTool === this.toolManager.noToolService) {
            for (const canvas of this.allCanvases) {
                canvas.nativeElement.style.cursor = 'default';
            }
        } else {
            for (const canvas of this.allCanvases) {
                canvas.nativeElement.style.cursor = 'crosshair';
            }
        }
    }

    @HostListener('click', ['$event'])
    onMouseClick(event: MouseEvent): void {
        this.clickCount++;
        if (this.clickCount === 1) {
            setTimeout(() => {
                if (this.clickCount === 1) {
                    this.currentTool.onMouseClick(event);
                } else {
                    this.currentTool.onDoubleClick(event);
                }
                this.clickCount = 0;
            }, this.timeOutDuration);
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (this.resizeServiceCommand.mouseDown) {
            this.resizeServiceCommand.startResize(event);
            const imageTemp = new Image();
            imageTemp.src = this.baseCanvas.nativeElement.toDataURL() as string;
            this.resizeServiceCommand.lastImage = imageTemp;
            this.undoRedoManager.disableUndoRedo();
            this.autoSaveService.saveDrawing(this.canvasSize, this.baseCanvas.nativeElement);
        } else {
            this.currentTool.onMouseDown(event);
            this.autoSaveService.saveDrawing(this.canvasSize, this.baseCanvas.nativeElement);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.resizeServiceCommand.mouseDown) {
            const resizeCommand: ResizeCommandService = new ResizeCommandService(this.drawingService);
            this.resizeServiceCommand.baseCanvas = this.baseCanvas;
            this.resizeServiceCommand.canvasSize = this.canvasSize;
            this.resizeServiceCommand.isSubscribed = true;

            resizeCommand.setBaseCanvas(this.baseCanvas); // maybe useless?
            resizeCommand.setSideBools(this.resizeServiceCommand.isCorner, this.resizeServiceCommand.isSide, this.resizeServiceCommand.isBottom);

            this.resizeServiceCommand.execute(this.baseCtx);
            resizeCommand.setCanvasSize(this.canvasSize);
            const imageTemp = new Image();
            imageTemp.src = this.resizeServiceCommand.lastImage.src;
            resizeCommand.lastImage = imageTemp;
            const newCanvasSize: Vec2 = { x: this.canvasSize.x, y: this.canvasSize.y };

            if (this.gridService.isGridVisible) {
                setTimeout(() => {
                    this.gridService.drawGrid();
                }, WAIT_TIME);
            }

            resizeCommand.canvasSizeObserver.subscribe((value) => {
                this.canvasSize = value;
                this.resizeServiceCommand.execute(this.drawingService.baseCtx);
            });
            resizeCommand.setHandles(
                this.resizeServiceCommand.sideHandle,
                this.resizeServiceCommand.bottomHandle,
                this.resizeServiceCommand.cornerHandle,
            );
            this.drawingService.canvasSize = this.canvasSize;

            this.undoRedoManager.resizeUndoStack.push(newCanvasSize);
            this.undoRedoManager.undoStack.push(resizeCommand);

            this.undoRedoManager.clearRedoStack();
            this.undoRedoManager.enableUndoRedo();
            this.resizeServiceCommand.resetSideBools();
            setTimeout(() => {
                this.autoSaveService.saveDrawing(this.canvasSize, this.baseCanvas.nativeElement);
            }, LONGER_WAIT_TIME);
        } else {
            this.currentTool.onMouseUp(event);
            this.autoSaveService.saveDrawing(this.canvasSize, this.baseCanvas.nativeElement);
        }
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    reload(): void {
        window.location.reload();
    }
}

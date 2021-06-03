export interface ToolStyles {
    primaryColor: string;
    lineWidth: number;
    fill?: boolean;
    secondaryColor?: string;
}
export abstract class UndoRedoCommand {
    toolStyle: ToolStyles;
    isResizer: boolean = false;
    abstract execute(ctx: CanvasRenderingContext2D): void;
}

export type { State, Cube, Action, Key, Event, GameBoard, Cell, GeneralPiece, ShapeMatrix, ClearedResult, Shape,
    Accumulator, KickData, RotationState
}
export { Viewport, Constants,   }
export { IKickData, TJKLKickData }
import { Vec } from "./positionUtils"

/** Constants */
const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
} as const;

const Constants = {
    TICK_RATE_MS: 400,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,  
    START_COUNT: 1,
    // MOVE_FRACTION: 0.8,
} as const;

function toVecArray(data: number[][]): Vec[] {
    return data.map(([x, y]) => new Vec(x, y));
}


const TJKLKickData = {
    '0->R': toVecArray([[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]),
    'R->0': toVecArray([[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]),
    'R->2': toVecArray([[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]),
    '2->R': toVecArray([[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]),
    '2->L': toVecArray([[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]),
    'L->2': toVecArray([[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]),
    'L->0': toVecArray([[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]),
    '0->L': toVecArray([[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]),
};


const IKickData = {
    '0->R': toVecArray([[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]]),
    'R->0': toVecArray([[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]]),
    'R->2': toVecArray([[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]),
    '2->R': toVecArray([[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]),
    '2->L': toVecArray([[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]]),
    'L->2': toVecArray([[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]]),
    'L->0': toVecArray([[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]),
    '0->L': toVecArray([[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]),
};

type RotationState = '0' | 'R' | '2' | 'L';

type KickData = {
    [key in RotationState]: Vec[];
};

type Shape = {
    id: string;
    matrix: ShapeMatrix;
    style: string;
    center?: Vec;
    kickData?: KickData;
};


//Type
type State = Readonly<{
    gameBoard: GameBoard,
    gameEnd: boolean,
    //activeBlock represents the block that's currently moving/falling
    activeBlock: GeneralPiece,
    nextBlock: GeneralPiece,
    score: number,
    highScore: number,
    level: number,
    totalClearedRows: number,
}>;

//a single position on the GameBoard, which could be occupied by a Cube or could be null
type Cell = Cube | null;
//2D array of Cell  
type GameBoard = Cell[][];

//visulsation of activated Block
//once it's placed, its cubes will become part of the gameBoard
type Cube = Readonly<{
    //distinguish between different blocks once they are placed on the board
    //every time a block is placed, you could give its cubes a unique ID
    id: string,
    position: Vec,
    width: number,
    height: number,
    style: string,
}>;

type GeneralPiece = Readonly<{
    shape: Shape,
    position: Vec,
    cubes: Cube[],
    rotationState: RotationState
}>

type ShapeMatrix = number[][]

type ClearedResult = Readonly<{
    board: GameBoard,
    clearedRowCount: number,
}>

type Accumulator = [State, number];

/** User input */
type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "KeyR";

type Event = "keydown" | "keyup" | "keypress";


/**
 * Actions modify state
 */
interface Action {
    apply(s: State): State;
}
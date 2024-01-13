import { State, Action, Viewport, Constants, Cube, KickData, GeneralPiece, Shape, RotationState } from "./types"
import { Vec, transformPosition } from "./positionUtils";
import {GameOperations} from "./operationUtils";
import { isGameOver, calculateScore } from "./utils";
import { IKickData, TJKLKickData } from "./types"


export { Block, initialState, Move, Rotate, Restart, Shapes };

//smallest unit of the game pieces
const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

const Shapes: Shape[] = [
    {
        id: "OShape",
        matrix: [
            [1, 1],
            [1, 1]
        ],
        style: "fill: green",
        center: new Vec(1.5, 1.5), // Between all blocks
    },
    {
        id: "IShape",
        matrix: [
            [1],
            [1],
            [1],
            [1]
        ],
        style: "fill: red",
        center: new Vec(0, 1), // Second block
    },
    {
        id: "TShape",
        matrix: [
            [1, 1, 1],
            [0, 1, 0]
        ],
        style: "fill: blue",
        center: new Vec(1, 1),// Middle block
    },
    {
        id: "SShape",
        matrix: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        style: "fill: yellow",
        center: new Vec(1, 1), // Middle of the 3x3 matrix
    },
    {
        id: "ZShape",
        matrix: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        style: "fill: purple",
        center: new Vec(1, 1), // Middle of the 3x3 matrix
    },
    {
        id: "LShape",
        matrix: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        style: "fill: cyan",
        center: new Vec(1, 1), // Middle of the bottom row
    },
    {
        id: "JShape",
        matrix: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        style: "fill: orange",
        center: new Vec(1, 1), // Middle of the bottom row
    }
];

function randomShape(): string {
    return Shapes[Math.floor(Math.random() * Shapes.length)].id;
}

enum RotationDirection {
    CLOCKWISE,
    COUNTERCLOCKWISE
}

function getNextRotationState(currentState: RotationState, direction: RotationDirection): RotationState {
    const orderClockwise: RotationState[] = ['0', 'R', '2', 'L'];
    const orderCounterClockwise: RotationState[] = ['0', 'L', '2', 'R'];

    const order = direction === RotationDirection.CLOCKWISE ? orderClockwise : orderCounterClockwise;

    const currentIndex = order.indexOf(currentState);
    if (currentIndex === -1) {
        throw new Error('Invalid rotation state');
    }

    return order[(currentIndex + 1) % 4];
}

const createCube = (vec: Vec, style: string): Cube => {
    return {
        id: "Cube",
        position: vec,
        width: Block.WIDTH,
        height: Block.HEIGHT,
        style: style
    };
};

const createPiece = (shapeType: string, startVec: Vec): GeneralPiece => {
    const shapeDetail = Shapes.find(shape => shape.id === shapeType);

    if (!shapeDetail) throw new Error('Shape not found.');

    const cubes = shapeDetail.matrix.flatMap((row, y) =>
        row.map((cell, x) => cell === 1 ? createCube(new Vec(x + startVec.x, y + startVec.y), shapeDetail.style) : null)
    ).filter(cube => cube !== null) as Cube[];
    
    return {
        shape: shapeDetail,
        position: startVec,
        cubes: cubes,
        rotationState: '0',
    };
};

const randomShapeId = randomShape();
const initialState: State = {
    gameBoard: Array.from({ length: Constants.GRID_HEIGHT }, () => new Array(Constants.GRID_WIDTH).fill(null)),
    gameEnd: false,
    activeBlock: createPiece(randomShapeId, new Vec(2,0)),
    nextBlock: createPiece(randomShape(), new Vec(2, 0)),
    score: 0,
    highScore: 0,
    level: 1,
    totalClearedRows: 0,
} as const;

// Function to rotate a game piece by 90 degrees
const rotatePiece = (piece: GeneralPiece): GeneralPiece => {
    // If it's the OShape or center is not provided, no need to rotate
    if (piece.shape.id === "OShape" || !piece.shape.center) {
        return piece;
    }
    
    const center = piece.shape.center;
    // Rotate each cube around the center and return a new GeneralPiece
    const rotatedCubes = piece.cubes.map(cube => {

        const relativePos = cube.position.sub(center);

        // Rotate the relative position by 90 degrees
        const rotatedPos = relativePos.rotate(90);

        // Convert back to absolute position
        const absolutePos = rotatedPos.add(center);

        return {
            ...cube,
            position: absolutePos
        };
    });

    return {
        ...piece,
        cubes: rotatedCubes
    };
}

// Class to define the Move action and its effect on game state
class Move implements Action {
    constructor(public readonly vec: Vec) { }

    apply(s: State): State {

        const newPosition = transformPosition(this.vec)(s.activeBlock.position);
        const newBlock = {
            ...s.activeBlock,
            position: newPosition,
        };

        const hasCollision = GameOperations.collision(newBlock, s.gameBoard);

        if (hasCollision) {
            if (this.vec.y > 0) {
                const { newGameBoard, clearedRows } = GameOperations.settleAndClear(s.activeBlock, s.gameBoard);
                const totalClearedRows = s.totalClearedRows + clearedRows;
                const newScore = s.score + calculateScore(clearedRows);
                const gameOver = isGameOver(newGameBoard);
                const newBlock = createPiece(randomShape(), new Vec(2, 0));
                //the high score is always the maximum value of the new score and the current high score.
                const highScore = Math.max(newScore, s.highScore);

                return {
                    ...s,
                    gameBoard: newGameBoard,                    
                    activeBlock: gameOver ? s.activeBlock : s.nextBlock,
                    nextBlock: gameOver ? s.nextBlock : newBlock,
                    gameEnd: gameOver,
                    score: newScore,
                    highScore: highScore,
                    totalClearedRows: totalClearedRows,
                    level: Math.floor(totalClearedRows / 2) + 1,
                };
            }
            return s;  // if collision and not moving downwards
        }

        return {
            ...s,
            activeBlock: newBlock,
        };
    }
}

//see more below the restart...
// Class to define the Rotate action and its effect on game state
class Rotate implements Action {
 
    // Updated rotate function:
    apply(s: State): State {
        const rotatedBlock = rotatePiece(s.activeBlock);
        const nextRotationState: RotationState = getNextRotationState(s.activeBlock.rotationState, RotationDirection.CLOCKWISE) as RotationState;

        if (GameOperations.collision(rotatedBlock, s.gameBoard)) {
            const rotationTransition: RotationState = `${s.activeBlock.rotationState}->${nextRotationState}` as RotationState;

            const wallKickedBlock = GameOperations.attemptWallKick(rotatedBlock, s.gameBoard, rotationTransition);

            if (GameOperations.collision(wallKickedBlock, s.gameBoard)) {
                return s;
            }

            return {
                ...s,
                activeBlock: {
                    ...wallKickedBlock,
                    rotationState: nextRotationState
                }
            };
        } else {
            return {
                ...s,
                activeBlock: {
                    ...rotatedBlock,
                    rotationState: nextRotationState
                }
            };
        }
    }
}

// Class to define the Restart action, which resets the game state
class Restart implements Action {
    apply(state: State): State {
        const currentHighScore = state.highScore;

        
        return {
            ...initialState,
            highScore: currentHighScore,
        };
    }
}

import { GeneralPiece, GameBoard, Constants, Cell, RotationState } from "./types";
import { getAbsolutePosition } from "./positionUtils";
import { Shapes } from "./states";
export{GameOperations}

/**
 * Provides core game mechanics and operations for Tetris.
 */
class GameOperations {
    
    /**
     * Determines if a block collides with the game board or its boundaries.
     * @param block - The block to be checked.
     * @param board - The current game board.
     * @returns True if there's a collision, otherwise false.
     */
    static collision(block: GeneralPiece, board: GameBoard): boolean {
        return block.cubes.some(cube => {
            const { x, y } = getAbsolutePosition(block, cube);
            return (y >= Constants.GRID_HEIGHT || (board[y] && board[y][x] !== null))
                || (x >= Constants.GRID_WIDTH || x < 0);
        });
    }
    
    /**
     * Integrates a block into the game board.
     * @param piece - The block to be settled.
     * @param board - The current game board.
     * @returns A new game board with the settled block.
     */
    static settleBlock(piece: GeneralPiece, board: GameBoard): GameBoard {
        return board.map((row, yIndex) =>
            row.map((cell, xIndex) => {
                const occupiedCube = piece.cubes.find(cube => {
                    const { x, y } = getAbsolutePosition(piece, cube);
                    return yIndex === y && xIndex === x;
                });
                return occupiedCube || cell;
            })
        );
    }

    /**
    * Checks for and clears full rows in the game board.
    * @param gameBoard - The current game board.
    * @returns A tuple containing the new game board and the number of cleared rows.
    */
    static clearRowsAndCount(gameBoard: GameBoard): [GameBoard, number] {
        const isRowFull = (row: Cell[]): boolean => row.every(cell => cell !== null);

        const [clearedBoard, clearedCount] = gameBoard.reduce(([board, count], row) => {
            if (isRowFull(row)) {
                return [board, count + 1];
            } else {
                return [[...board, row], count];
            }
        }, [[], 0] as [GameBoard, number]);

        // Add empty rows to the top of the board to replace the cleared rows.
        const emptyRows = Array(clearedCount).fill(0).map(() => Array(gameBoard[0].length).fill(null));

        return [emptyRows.concat(clearedBoard), clearedCount];
    }

    /**
    * Settles a block into the game board and then clears any full rows.
    * @param piece - The block to be settled.
    * @param board - The current game board.
    * @returns An object containing the new game board and the number of cleared rows.
    */
    static settleAndClear(piece: GeneralPiece, board: GameBoard): { newGameBoard: GameBoard, clearedRows: number } {
        const settledBoard = this.settleBlock(piece, board);
        const [clearedBoard, clearedRows] = this.clearRowsAndCount(settledBoard);
        return {
            newGameBoard: clearedBoard,
            clearedRows,
        }
    }
    
    /**
    * Attempts to perform a wall kick for a block during rotation.
    * @param piece - The block to be kicked.
    * @param board - The current game board.
    * @param rotationState - The current rotation state.
    * @returns The block after attempting the wall kick.
    */
    static attemptWallKick(piece: GeneralPiece, board: GameBoard, rotationState: RotationState): GeneralPiece {
        // Access the shape's kick data
        const shapeKickData = Shapes.find(s => s.id === piece.shape.id)?.kickData;

        if (!shapeKickData) {
            return piece; // Return original piece if no kick data is found
        }

        const kicks = shapeKickData[rotationState];

        // Use find to get the first non-colliding position
        const validKick = kicks.find(kick => {
            const movedPiece: GeneralPiece = {
                ...piece,
                position: piece.position.add(kick)  // assuming Vec has an add method
            };
            return !this.collision(movedPiece, board);
        });

        // If we found a valid kick, apply it; otherwise, return the original piece
        return validKick ? {
            ...piece,
            position: piece.position.add(validKick)
        } : piece;
    }
}




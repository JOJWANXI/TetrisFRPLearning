import { GameBoard } from "./types";
export{calculateScore, isGameOver}





/**
 * Calculate the score based on the number of cleared rows.
 *
 * @param clearedRows - The number of rows that have been cleared.
 * @returns The score corresponding to the cleared rows.
 */
const calculateScore = (clearedRows: number): number => {
    switch (clearedRows) {
        case 1:
            return 5;
        case 2:
            return 10;
        case 3:
            return 25;
        case 4:
            return 40;
        default:
            return 0;            
    }
};

/**
 * Determine if the game is over by checking the top row of the board.
 * If any cell in the top row is filled, then the game is over.
 *
 * @param board - The current state of the game board.
 * @returns True if the game is over, otherwise false.
 */
const isGameOver = (board: GameBoard): boolean => {
    return board[0].some(cell => cell !== null);
};
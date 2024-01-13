import { GeneralPiece, Cube } from "./types"
export { Vec, getAbsolutePosition, transformPosition}

/**
 * Represents a 2D vector with basic arithmetic operations.
 * author: FIT2102 teaching team
 */
class Vec { 
    constructor(public readonly x: number = 0, public readonly y: number = 0) { }
    add = (b: Vec) => new Vec(this.x + b.x, this.y + b.y)
    sub = (b: Vec) => this.add(b.scale(-1))
    scale = (s: number) => new Vec(this.x * s, this.y * s)
    rotate = (deg: number) =>
        (rad => (
            (cos, sin, { x, y }) => new Vec(Math.round(x * cos - y * sin), Math.round(x * sin + y * cos))
        )(Math.cos(rad), Math.sin(rad), this)
        )(Math.PI * deg / 180)
    static unitVecInDirection = (deg: number) => new Vec(0, -1).rotate(deg)
}

/**
 * Computes the absolute position of a cube in the game board.
 * @param block - The general piece containing the cube.
 * @param cube - The cube whose absolute position needs to be calculated.
 * @returns The absolute position as a 2D vector.
 */
const getAbsolutePosition = (block: GeneralPiece, cube: Cube): Vec => {
    return new Vec(block.position.x + cube.position.x, block.position.y + cube.position.y);
}

/**
 * Transforms a given position by adding a vector to it.
 * @param vec - Vector to be added.
 * @returns A function that takes a position and returns the transformed position.
 */
const transformPosition = (vec: Vec) => (position: Vec) => position.add(vec);

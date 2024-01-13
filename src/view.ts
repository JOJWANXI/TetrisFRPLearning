import { GeneralPiece, GameBoard, Constants, Cell, State, Viewport } from "./types";
import { getAbsolutePosition } from "./positionUtils";
export { render, show, hide, gameover, svg }


// Canvas elements
const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
const container = document.querySelector("#main") as HTMLElement;

svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

// Text fields
const levelText = document.querySelector("#levelText") as HTMLElement;
const scoreText = document.querySelector("#scoreText") as HTMLElement;
const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

// /**
//  * Displays a SVG element on the canvas. Brings to foreground.
//  * @param elem SVG element to display
//  */
const show = (elem: SVGGraphicsElement, parent: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    if (!elem.parentNode) {
        parent.appendChild(elem);
    } else {
        elem.parentNode.appendChild(elem);
    }
};


/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
    elem.setAttribute("visibility", "hidden");


const render = (s: State) => {
    scoreText.textContent = `${s.score}`;
    highScoreText.textContent = `${s.highScore}`;
    levelText.textContent = `${s.level}`;

    Array.from(svg.childNodes)
        .filter(child => child !== gameover)
        .forEach(child => svg.removeChild(child));

    renderPreview(s.nextBlock);
    renderGameBoardRecursive(s.gameBoard);
    addBlockToCanvas(s.activeBlock);
};


const renderPreview = (block: GeneralPiece) => {
    while (preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    block.cubes.forEach(cube => {
        const svgCube = createSvgElement(preview.namespaceURI, "rect", {
            height: `${cube.height}`,
            width: `${cube.width}`,
            x: `${cube.position.x * cube.width}`,
            y: `${cube.position.y * cube.height}`,
            style: cube.style
        });
        preview.appendChild(svgCube);
    });
};

const renderGameBoardRecursive = (board: GameBoard, index: number = 0) => {
    if (index >= board.length) return;
    renderRow(board[index], index);
    renderGameBoardRecursive(board, index + 1);
};

const renderRow = (row: Cell[], rowIndex: number) => {
    row.forEach((cube, colIndex) => {
        if (cube) {
            const svgCube = createSvgElement(svg.namespaceURI, "rect", {
                height: `${cube.height}`,
                width: `${cube.width}`,
                x: `${colIndex * cube.width}`,
                y: `${rowIndex * cube.height}`,
                style: cube.style
            });
            svg.appendChild(svgCube);
        }
    });
};

const addBlockToCanvas = (block: GeneralPiece) => {
    block.cubes.forEach(cube => {
        const absolutePosition = getAbsolutePosition(block, cube);
        const svgCube = createSvgElement(svg.namespaceURI, "rect", {
            height: `${cube.height}`,
            width: `${cube.width}`,
            x: `${absolutePosition.x * cube.width}`,
            y: `${absolutePosition.y * cube.height}`,
            style: cube.style
        });
        svg.appendChild(svgCube);
    });
};

const createSvgElement = (namespace: string | null, name: string, props: Record<string, string> = {}) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};

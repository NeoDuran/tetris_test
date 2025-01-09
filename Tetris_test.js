const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

// 테트리스 블록 모양 정의
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T 
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]] // S
];

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
document.body.appendChild(canvas);

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let piece = null;
let score = 0;

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.y = 0;
        this.x = Math.floor(COLS / 2) - Math.floor(shape[0].length / 2);
    }

    draw() {
        ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect((this.x + x) * BLOCK_SIZE, 
                               (this.y + y) * BLOCK_SIZE, 
                               BLOCK_SIZE, 
                               BLOCK_SIZE);
                }
            });
        });
    }
}

function createPiece() {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    return new Piece(SHAPES[randomIndex], COLORS[randomIndex]);
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = COLORS[value - 1];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function collision(piece, y = 0, x = 0) {
    return piece.shape.some((row, dy) => {
        return row.some((value, dx) => {
            let newY = piece.y + dy + y;
            let newX = piece.x + dx + x;
            return (
                value &&
                (newY >= ROWS ||
                newX < 0 ||
                newX >= COLS ||
                (newY >= 0 && board[newY][newX]))
            );
        });
    });
}

function merge(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[piece.y + y][piece.x + x] = COLORS.indexOf(piece.color) + 1;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (!board[y][x]) continue outer;
        }
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
    }
    score += linesCleared * 100;
}

function update() {
    if (!piece) {
        piece = createPiece();
        if (collision(piece)) {
            // 게임 오버
            board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
            score = 0;
        }
    }

    piece.y++;
    if (collision(piece)) {
        piece.y--;
        merge(piece);
        clearLines();
        piece = null;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    if (piece) {
        piece.draw();
    }
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
}

document.addEventListener('keydown', event => {
    if (!piece) return;

    switch(event.keyCode) {
        case 37: // 왼쪽
            if (!collision(piece, 0, -1)) piece.x--;
            break;
        case 39: // 오른쪽
            if (!collision(piece, 0, 1)) piece.x++;
            break;
        case 40: // 아래
            if (!collision(piece, 1)) piece.y++;
            break;
        case 38: // 위 (회전)
            const rotated = piece.shape[0].map((_, i) => 
                piece.shape.map(row => row[row.length - 1 - i])
            );
            const p = new Piece(rotated, piece.color);
            p.x = piece.x;
            p.y = piece.y;
            if (!collision(p)) piece.shape = rotated;
            break;
    }
});

setInterval(() => {
    update();
    draw();
}, 1000 / 2); // 2 FPS

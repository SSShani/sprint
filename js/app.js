'use strict'

"use strict";

const BEGINNER = "Beginner";
const MEDIUM = "Medium";
const EXPERT = "Expert";
let gBoard = [];
let boardSize;
let gAmountMines;
const elBoard = document.querySelector(".board");
let strHTML = "";

// We turn this flag into the cell that the user clicked when the user clicks on a cell for the first time
let firstCellClicked = undefined;
let mines = [];

let minesPlaced = 0;

// gBoard
//  {minesAroundCount:4,
//     isShown:false,
// isMine:false,
// isMarked:true
//  }

// let gGame{
//     isOn:false,
// shownCount:0,
// markedCount:0,
// secsPassed:0,
// }

function onInitGame() {
    gAmountMines = 0;
    createBoard(4);
    initializeBoard();
}

function createBoard(size) {
    gBoard = [];
    boardSize = size;
    mineUpdate(size);
    initializeBoard();
}

function initializeBoard() {
    for (let i = 0; i < boardSize; i++) {
        gBoard[i] = [];
        for (let j = 0; j < boardSize; j++) {
            gBoard[i][j] = {
                isMine: false,
                revealed: false,
                count: 0,
            };
        }
    }
    renderBoard();
}

function renderBoard() {
    const elBoard = document.querySelector(".board");
    let strHTML = "";
    for (let i = 0; i < boardSize; i++) {
        strHTML += "<tr>";
        for (let j = 0; j < boardSize; j++) {
            const cellClass = getCellClass(gBoard[i][j]);
            const cellCount = getCellCount(i, j);

            if (gBoard[i][j].isMine && gBoard[i][j].revealed) {
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" onclick="onCellClicked(${i}, ${j})">
                <img src="mine.png"/>
            </td>`;
            } else if (gBoard[i][j].revealed && cellCount > 0) {
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" onclick="onCellClicked(${i}, ${j})">
                <span>${cellCount}</span>
            </td>`;
            } else {
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" onclick="onCellClicked(${i}, ${j})">
            </td>`;
            }
        }
        strHTML += "</tr>";
    }
    elBoard.innerHTML = strHTML;
}

function getCellCount(i, j) {
    let count = 0;
    if (i - 1 >= 0 && gBoard[i - 1][j].isMine) {
        count++;
    }
    if (i - 1 >= 0 && j - 1 >= 0 && gBoard[i - 1][j - 1].isMine) {
        count++;
    }
    if (i - 1 >= 0 && j + 1 < boardSize && gBoard[i - 1][j + 1].isMine) {
        count++;
    }
    if (j - 1 >= 0 && gBoard[i][j - 1].isMine) {
        count++;
    }
    if (j + 1 < boardSize && gBoard[i][j + 1].isMine) {
        count++;
    }
    if (i + 1 < boardSize && gBoard[i + 1][j].isMine) {
        count++;
    }
    if (i + 1 < boardSize && j - 1 >= 0 && gBoard[i + 1][j - 1].isMine) {
        count++;
    }
    if (i + 1 < boardSize && j + 1 < boardSize && gBoard[i + 1][j + 1].isMine) {
        count++;
    }
    return count;
}

function getCellClass(cell) {
    if (cell.isMine) {
        return cell.revealed ? "cell-mine-revealed" : "cell-mine-hidden";
    }
    if (cell.revealed) {
        return "cell-revealed";
    }
    return "cell-unrevealed";
}

function mineUpdate(size) {
    switch (size) {
        case 4:
            gAmountMines = 2;
            break;
        case 8:
            gAmountMines = 14;
            break;
        case 12:
            gAmountMines = 32;
            break;
    }
}

function setMines() {
    //מכניס מוקשים
    const i = firstCellClicked[0];
    const j = firstCellClicked[1];

    while (minesPlaced < gAmountMines) {
        const row = getRandomInt(0, boardSize - 1);
        const col = getRandomInt(0, boardSize - 1);

        if (row === i) {
            if (col === j || col === j - 1 || col === j + 1) {
                continue;
            }
        }
        if (row === i - 1) {
            if (col === j || col === j - 1 || col === j + 1) {
                continue;
            }
        }
        if (row === i + 1) {
            if (col === j || col === j - 1 || col === j + 1) {
                continue;
            }
        }

        if (!gBoard[row][col].isMine) {
            gBoard[row][col].isMine = true;
            minesPlaced++;
        }
    }
}

function onCellClicked(i, j) {
    gBoard[i][j].revealed = true;
    if (!firstCellClicked) {
        firstCellClicked = [i, j];
        setMines();
    }
    renderBoard();
    checkGameOver();
}

function checkGameOver() {
    let win = false;
    const cellsRevelead = document.querySelectorAll(".cell-revealed").length;
    if (
        !document.querySelector(".cell-mine-revealed") &&
        cellsRevelead === boardSize * boardSize - gAmountMines
    ) {
        win = true;
    } else if (document.querySelector(".cell-mine-revealed")) {
        expandAllMines();
    }
}

function expandAllMines() {
    document.querySelectorAll(".cell-mine-hidden").forEach((cell) => {
        const i = +cell.getAttribute("i");
        const j = +cell.getAttribute("j");
        onCellClicked(i, j);
    });
}

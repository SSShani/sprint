"use strict";

let lifeCount;
let gBoard = [];
let boardSize;
let gAmountMines;
const elBoard = document.querySelector(".board");
let strHTML = "";
let timer;

const NORMAL_EMOJI = "img/normal.png";
const LOSE_EMOJI = "img/lose.png";
const WIN_EMOJI = "img/win.png";

var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds;

// We turn this flag into the cell that the user clicked when the user clicks on a cell for the first time
let firstCellClicked = undefined;
let mines = [];
let minesPlaced;

function onInitGame(board) {
    lifeCount = 2;
    document.getElementById("life-count").innerText = lifeCount;
    document.getElementById("clickableImage").src = NORMAL_EMOJI;
    mines = [];
    minesPlaced = 0;
    totalSeconds = -1;
    firstCellClicked = undefined;

    setTime();
    createBoard(board);
    enableBoard();
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
                revealed: false, //if open
                flag: false,
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
                //I stepped on a mine
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" 
                oncontextmenu="javascript:onCellRightClicked(${i}, ${j});return false;"
                onclick="onCellClicked(${i}, ${j})">
                <img src="img/mine.png"/>
            </td>`;
            } else if (gBoard[i][j].revealed && cellCount > 0) {
                //with mined neighbors
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" 
                oncontextmenu="javascript:onCellRightClicked(${i}, ${j});return false;"
                onclick="onCellClicked(${i}, ${j})">
                <span>${cellCount}</span>
            </td>`;
            } else if (!gBoard[i][j].revealed && gBoard[i][j].flag) {
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" 
                oncontextmenu="javascript:onCellRightClicked(${i}, ${j});return false;"
                onclick="onCellClicked(${i}, ${j})">
                <img src="img/flag.png"/>
            </td>`;
            } else {
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" 
                oncontextmenu="javascript:onCellRightClicked(${i}, ${j});return false;"
                onclick="onCellClicked(${i}, ${j})">
            </td>`;
            }
        }
        strHTML += "</tr>";
    }
    elBoard.innerHTML = strHTML;
}

function getCellCount(i, j) //Some neighbors are mines
{
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
    if (gBoard[i][j].isMine && lifeCount > 0) {
        lifeCount--;
        document.getElementById("life-count").innerText = lifeCount;
    }
    if (!firstCellClicked) {
        //first Clicked
        firstCellClicked = [i, j];
        setMines();
        timer = setInterval(setTime, 1000);
    }
    openCellSiblings(i, j);
    renderBoard();
    checkGameOver();
}

function openCellSiblings(i, j) {
    // Check if the clicked cell has no mines around it
    if (getCellCount(i, j) === 0) {
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                const ni = i + di;
                const nj = j + dj;
                // Check if the neighboring cell is within bounds and not already revealed
                if (ni >= 0 && ni < boardSize && nj >= 0 && nj < boardSize && !gBoard[ni][nj].revealed) {
                    // Reveal the neighboring cell
                    gBoard[ni][nj].revealed = true;
                    // If the revealed cell also has no neighboring mines, recursively reveal its siblings
                    if (getCellCount(ni, nj) === 0) {
                        openCellSiblings(ni, nj);
                    }
                }
            }
        }
    }
}

function onCellRightClicked(i, j) {
    gBoard[i][j].flag = !gBoard[i][j].flag;
    if (gBoard[i][j].flag && !gBoard[i][j].revealed) {
        document.querySelector(
            `.cell-${i}-${j}`
        ).innerHTML = `<img src="img/flag.png"/>`;
        document.querySelector(`.cell-${i}-${j}`).classList.add("cell-flag");
    } else {
        document.querySelector(`.cell-${i}-${j}`).innerHTML = "";
        document.querySelector(`.cell-${i}-${j}`).classList.remove("cell-flag");
    }
}

function checkGameOver() {
    let win = false;
    const cellsRevelead = document.querySelectorAll(".cell-revealed").length;
    const flagCells = document.querySelectorAll(".cell-flag").length;
    if (
        //win
        (!document.querySelector(".cell-mine-revealed") &&
            cellsRevelead === boardSize * boardSize - gAmountMines) ||
        (document.querySelectorAll(".cell-mine-revealed").length +
            cellsRevelead +
            flagCells ===
            boardSize * boardSize &&
            lifeCount > 0)
    ) {
        win = true;
        // Change emoji to win emoji
        document.getElementById("clickableImage").src = WIN_EMOJI;
        clearInterval(timer);
        disableBoard();
        lifeCount = 3;
    } //loss
    else if (document.querySelector(".cell-mine-revealed")) {
        if (lifeCount === 0) {
            expandAllMines();
            // Change emoji to lose emoji
            document.getElementById("clickableImage").src = LOSE_EMOJI;
            clearInterval(timer);
            disableBoard();
        }
    }
}

function disableBoard() {
    document.querySelectorAll("button").forEach((btn) => {
        btn.setAttribute("disabled", "disabled");
    });
    document.querySelectorAll(".cell").forEach((cell) => {
        cell.classList.add("disabled");
    });
}

function enableBoard() {
    document.querySelectorAll("button").forEach((btn) => {
        btn.removeAttribute("disabled");
    });
    document.querySelectorAll(".cell").forEach((cell) => {
        cell.classList.remove("disabled");
    });
}

function expandAllMines() {
    document.querySelectorAll(".cell-mine-hidden").forEach((cell) => {
        const i = +cell.getAttribute("i");
        const j = +cell.getAttribute("j");
        onCellClicked(i, j);
    });
}

function restartGame() {
    onInitGame(4);
}

function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}


// function openCellSiblings(i, j) {
//     if (i - 1 >= 0 && !gBoard[i - 1][j].isMine && !gBoard[i - 1][j].revealed) {
//         gBoard[i - 1][j].revealed = true;
//     }
//     if (
//         i - 1 >= 0 &&
//         j - 1 >= 0 &&
//         !gBoard[i - 1][j - 1].isMine &&
//         !gBoard[i - 1][j - 1].revealed
//     ) {
//         gBoard[i - 1][j - 1].revealed = true;
//     }
//     if (
//         i - 1 >= 0 &&
//         j + 1 < boardSize &&
//         !gBoard[i - 1][j + 1].isMine &&
//         !gBoard[i - 1][j + 1].revealed
//     ) {
//         gBoard[i - 1][j + 1].revealed = true;
//     }
//     if (j - 1 >= 0 && !gBoard[i][j - 1].isMine && !gBoard[i][j - 1].revealed) {
//         gBoard[i][j - 1].revealed = true;
//     }
//     if (
//         j + 1 < boardSize &&
//         !gBoard[i][j + 1].isMine &&
//         !gBoard[i][j + 1].revealed
//     ) {
//         gBoard[i][j + 1].revealed = true;
//     }
//     if (
//         i + 1 < boardSize &&
//         !gBoard[i + 1][j].isMine &&
//         !gBoard[i + 1][j].revealed
//     ) {
//         gBoard[i + 1][j].revealed = true;
//     }
//     if (
//         i + 1 < boardSize &&
//         j - 1 >= 0 &&
//         !gBoard[i + 1][j - 1].isMine &&
//         !gBoard[i + 1][j - 1].revealed
//     ) {
//         gBoard[i + 1][j - 1].revealed = true;
//     }
//     if (
//         i + 1 < boardSize &&
//         j + 1 < boardSize &&
//         !gBoard[i + 1][j + 1].isMine &&
//         !gBoard[i + 1][j + 1].revealed
//     ) {
//         gBoard[i + 1][j + 1].revealed = true;
//     }
// }
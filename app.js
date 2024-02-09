"use strict";

let gBoard = [];
let boardSize;
let gAmountMines;
const elBoard = document.querySelector(".board");
let strHTML = "";
const NORMAL_EMOJI='<img src="img/normal.png">'
const LOSE_EMOJI='<img src="img/los.png">'
const WIN_EMOJI='<img src="img/win.png">'

// We turn this flag into the cell that the user clicked when the user clicks on a cell for the first time
let firstCellClicked = undefined;
let mines = [];
let minesPlaced = 0;

function onInitGame() {
    gAmountMines = 0;
    createBoard(4);
   initializeBoard();
//    smileyDefinition();
}

function smileyDefinition(){
var clickableImage = document.getElementById('clickableImage');
clickableImage.addEventListener('click', function() {
    onInitGame()
})
}


function onInitGame() {
    const elBoard = document.querySelector(".board");
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
                revealed: false,//if open
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

            if (gBoard[i][j].isMine && gBoard[i][j].revealed) //I stepped on a mine
            {
                strHTML += `<td i="${i}" j="${j}" class="cell cell-${i}-${j} ${cellClass}" onclick="onCellClicked(${i}, ${j})">
                <img src="img/mine.png"/>
            </td>`;




            } else if (gBoard[i][j].revealed && cellCount > 0)//with mined neighbors
             {
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










//Some neighbors are mines
function getCellCount(i, j)
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
   
    function isGameOver() {
        // Check if all mines are revealed or if any mine is revealed
        return document.querySelector(".cell-mine-revealed") || document.querySelectorAll(".cell-revealed").length === boardSize * boardSize - gAmountMines;
    }
    
    gBoard[i][j].revealed = true;
    if (!firstCellClicked) //first Clicked
    {
        firstCellClicked = [i, j];
        setMines();
    }
    renderBoard();
    checkGameOver();
}

function checkGameOver() {
    let win = false;
    const cellsRevelead = document.querySelectorAll(".cell-revealed").length;
    if //win
    (
        !document.querySelector(".cell-mine-revealed") &&
        cellsRevelead === boardSize * boardSize - gAmountMines
    ) {
        win = true;
   // Change emoji to win emoji
   document.getElementById('clickableImage').src = WIN_EMOJI;
    } else//loss
     if (document.querySelector(".cell-mine-revealed")) {
        expandAllMines();
         // Change emoji to lose emoji
         document.getElementById('clickableImage').src = LOSE_EMOJI;  
    }

}


function expandAllMines() {
    document.querySelectorAll(".cell-mine-hidden").forEach((cell) => {
        const i = +cell.getAttribute("i");
        const j = +cell.getAttribute("j");
        onCellClicked(i, j);
    });
}


function restartGame() {
    onInitGame();
}
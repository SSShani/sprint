'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GLUE = 'GLUE'
const GAMER = 'GAMER'

const GAMER_IMG = '<img src="img/gamer.png">'
const GLUED_GAMER_IMG = '<img src="img/gamer-purple.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

const ADD_BALL_FREQ = 4000
const ADD_GLUE_FREQ = 5000
const REMOVE_GLUE_FREQ = 3000


// Model:
var gBoard
var gGamerPos
var gIsGameOn
var gIsGamerGlued
var gScore
var gBallsCount
var gBallInterval
var gGlueInterval

function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gIsGameOn = true
    gIsGamerGlued = false
    gScore = 0
    gBallsCount = 2
    gBoard = buildBoard()
    renderBoard(gBoard)

    gBallInterval = setInterval(addBall, ADD_BALL_FREQ)
    gGlueInterval = setInterval(addGlue, ADD_GLUE_FREQ)
    updateScore()
    hideModal()

}


function buildBoard() {
    // Put FLOOR everywhere and WALL at edges
    const rowCount = 10
    const colCount = 12
    const board = []
    for (var i = 0; i < rowCount; i++) {
        board[i] = []
        for (var j = 0; j < colCount; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowCount - 1 || j === 0 || j === colCount - 1) {
                board[i][j].type = WALL
            }
        }


    }

    addPassages(board)
    // Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
console.table(board)
    return board
}

function addPassages(board) {
    const middleRows = Math.floor(board.length / 2)
    const middleCols = Math.floor(board[0].length / 2)
    board[0][middleCols].type = FLOOR
    board[board.length - 1][middleCols].type = FLOOR
    board[middleRows][0].type = FLOOR
    board[middleRows][board[0].length - 1].type = FLOOR
}

// Render the board to an HTML table
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i, j }) + ' '
            cellClass += (currCell.type === WALL) ? 'wall' : 'floor'
            strHTML += `<td class="cell ${cellClass}" onclick="onMoveTo(${i},${j})" >`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    // console.log('strHTML', strHTML)

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function onMoveTo(i, j) {
    if (!gIsGameOn) return
    if (gIsGamerGlued) return

    // Handling passages from onHandleKey
    if (i === -1) i = gBoard.length - 1
    else if (i === gBoard.length) i = 0
    else if (j === -1) j = gBoard[0].length - 1
    else if (j === gBoard[0].length) j = 0

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    // console.log('iAbsDiff:', iAbsDiff)
    // console.log('jAbsDiff:', jAbsDiff)
    // console.log(iAbsDiff, jAbsDiff)

    if (iAbsDiff + jAbsDiff === 1 ||
        iAbsDiff === gBoard.length - 1 ||
        jAbsDiff === gBoard[0].length - 1) { // Handling passages from onclick

        const targetCell = gBoard[i][j]
        if (targetCell.type === WALL) return
        // If the clicked Cell is one of the four allowed
        if (targetCell.gameElement === BALL) handleBall()
        else if (targetCell.gameElement === GLUE) handleGlue()

        // Move the gamer - remove from prev pos
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // Move to next pos
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        const gamerImg = gIsGamerGlued ? GLUED_GAMER_IMG : GAMER_IMG
        renderCell(gGamerPos, gamerImg)
        // console.log('Moved!!')
        renderCountGamerNegs()
    }

}

function handleBall() {
    // model
    gScore++
    gBallsCount--
    // dom
    updateScore()
    playSound()
    if (checkVictory()) gameOver()
}

function handleGlue() {
    gIsGamerGlued = true
    setTimeout(() => {
        gIsGamerGlued = false
        renderCell(gGamerPos, GAMER_IMG)
    }, 3000)
}

function addBall() {
    const emptyPos = getEmptyPos()
    if (!emptyPos) return
    gBoard[emptyPos.i][emptyPos.j].gameElement = BALL
    renderCell(emptyPos, BALL_IMG)
    gBallsCount++
    renderCountGamerNegs()
}

function addGlue() {
    const emptyPos = getEmptyPos()
    if (!emptyPos) return

    gBoard[emptyPos.i][emptyPos.j].gameElement = GLUE
    renderCell(emptyPos, GLUE_IMG)
    // setTimeout(removeGlue, REMOVE_GLUE_FREQ, emptyPos)
    setTimeout(() => removeGlue(emptyPos), REMOVE_GLUE_FREQ)
}

function removeGlue(gluePos) {
    const cell = gBoard[gluePos.i][gluePos.j]
    if (cell.gameElement !== GLUE) return
    gBoard[gluePos.i][gluePos.j].gameElement = null;
    renderCell(gluePos, '');
}

function getEmptyPos() {
    const emptyPoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.type !== WALL && !currCell.gameElement) {
                emptyPoss.push({ i, j })
            }
        }
    }

    const randIdx = getRandomInt(0, emptyPoss.length)
    return emptyPoss[randIdx]
}

function checkVictory() {
    return gBallsCount === 0
}

function gameOver() {
    gIsGameOn = false
    clearInterval(gBallInterval)
    clearInterval(gGlueInterval)
    showModal()
}

function renderCountGamerNegs() {
    var negsCount = 0;
    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === gGamerPos.i && j === gGamerPos.j) continue;
            const currCell = gBoard[i][j]
            if (currCell.gameElement === BALL) negsCount++;
        }
    }
    const elNgsCount = document.querySelector('.negs-count span')
    elNgsCount.innerText = negsCount
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            onMoveTo(i, j - 1)
            break
        case 'ArrowRight':
            onMoveTo(i, j + 1)
            break
        case 'ArrowUp':
            onMoveTo(i - 1, j)
            break
        case 'ArrowDown':
            onMoveTo(i + 1, j)
            break
    }
}

function playSound() {
    const sound = new Audio('sound/sound.mp4')
    sound.play()
}


function showModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hide')
}

function hideModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.add('hide')
}

function updateScore() {
    const elBallsCount = document.querySelector('.balls-count span')
    elBallsCount.innerText = gScore
}
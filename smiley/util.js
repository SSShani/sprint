"use strict";

function createMat(ROWS, COLS) {
    const mat = [];
    for (var i = 0; i < ROWS; i++) {
        const row = [];
        for (var j = 0; j < COLS; j++) {
            row.push("");
        }
        mat.push(row);
    }
    return mat;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is inclusive and the minimum is inclusive
}

function getClassName(location) {
    return `cell-${location.i}-${location.j}`;
}

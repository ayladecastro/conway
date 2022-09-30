"use strict";
var map = [];
var toLookMap = [];
var paused = true;
var canvas = document.querySelector('.canvas');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var ctx = canvas.getContext('2d');
function draw() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    for (var y = 0; y < map.length; y++) {
        if (map[y]) {
            for (var x = 0; x < map[y].length; x++) {
                var state = checkCell(x, y);
                if (map[y][x])
                    ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}
function setCell(x, y, state, smap, tlmap) {
    if (smap === void 0) { smap = map; }
    if (tlmap === void 0) { tlmap = toLookMap; }
    if (!smap[y])
        smap[y] = [];
    if (typeof state == 'undefined')
        state = !smap[y][x];
    if (state == true) {
        smap[y][x] = true;
    }
    else
        smap[y].splice(x, 1);
    if (state == true) {
        for (var ny = -1; ny <= 1; ny++) {
            for (var nx = -1; nx <= 1; nx++) {
                var sx = x + nx;
                var sy = y + ny;
                if (sx >= 0 && sy >= 0) {
                    if (!tlmap[y + ny])
                        tlmap[y + ny] = [];
                    tlmap[y + ny][x + nx] = true;
                }
            }
        }
    }
}
function setCells(state) {
    var cells = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        cells[_i - 1] = arguments[_i];
    }
    for (var key in cells) {
        setCell(cells[key][0], cells[key][1], state);
    }
    draw();
}
function checkCell(x, y) {
    if (typeof map[y] == 'undefined' || typeof map[y][x] == 'undefined')
        return false;
    return true;
}
function checkNeighbors(x, y) {
    var neighbors = 0;
    for (var ny = -1; ny <= 1; ny++) {
        for (var nx = -1; nx <= 1; nx++) {
            if (!(nx == 0 && ny == 0)) {
                neighbors += Number(checkCell(x + nx, y + ny));
            }
        }
    }
    return neighbors;
}
function update() {
    var newMap = [];
    var newToLookMap = [];
    for (var my in toLookMap) {
        for (var mx in toLookMap[my]) {
            var x = Number(mx);
            var y = Number(my);
            var s = checkCell(x, y);
            var n = checkNeighbors(x, y);
            if (n == 3 || n == 2 && s == true) {
                setCell(x, y, true, newMap, newToLookMap);
            }
            else {
                setCell(x, y, false, newMap, newToLookMap);
            }
        }
    }
    map = newMap;
    toLookMap = newToLookMap;
}
setCells(true, [1, 1], [2, 2], [2, 3], [1, 3], [0, 3]);
function run() {
    if (!paused) {
        update();
        draw();
    }
}
setInterval(run, 16);
document.addEventListener('keydown', function (event) {
    if (event.key == 'Enter') {
        if (paused)
            paused = false;
        else
            paused = true;
    }
});
//# sourceMappingURL=script.js.map
"use strict";
var map = [];
var toLookMap = [];
var infinite = false;
var paused = true;
var canvas = document.querySelector('.canvas');
var width = canvas.width;
var height = canvas.height;
if (infinite) {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
else {
    width = canvas.width = 150;
    height = canvas.height = 150;
}
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
function fixPos(x, y) {
    // so we don't need to repeat (!infinite) each time fixPos appears
    if (!infinite) {
        if (x >= width)
            x = 0;
        else if (x < 0)
            x = width - 1;
        if (y >= height)
            y = 0;
        else if (y < 0)
            y = height - 1;
    }
    return [x, y];
}
function setCell(x, y, state, smap, tlmap, drawit) {
    var _a, _b;
    if (smap === void 0) { smap = map; }
    if (tlmap === void 0) { tlmap = toLookMap; }
    if (drawit === void 0) { drawit = true; }
    _a = fixPos(x, y), x = _a[0], y = _a[1];
    if (!smap[y])
        smap[y] = [];
    if (typeof state == 'undefined')
        state = !smap[y][x];
    if (state == true) {
        smap[y][x] = true;
        for (var ny = -1; ny <= 1; ny++) {
            for (var nx = -1; nx <= 1; nx++) {
                var sx = x + nx;
                var sy = y + ny;
                if (sx >= 0 && sy >= 0 || !infinite) {
                    _b = fixPos(sx, sy), sx = _b[0], sy = _b[1];
                    if (!tlmap[sy])
                        tlmap[sy] = [];
                    tlmap[sy][sx] = true;
                }
            }
        }
    }
    else
        smap[y].splice(x, 1);
    if (drawit)
        draw();
}
function setCells(state) {
    var cells = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        cells[_i - 1] = arguments[_i];
    }
    for (var key in cells) {
        setCell(cells[key][0], cells[key][1], state, undefined, undefined, false);
    }
    draw();
}
function checkCell(x, y) {
    if (typeof map[y] == 'undefined' || typeof map[y][x] == 'undefined')
        return false;
    return true;
}
function checkNeighbors(x, y) {
    var _a;
    var neighbors = 0;
    for (var ny = -1; ny <= 1; ny++) {
        for (var nx = -1; nx <= 1; nx++) {
            if (!(nx == 0 && ny == 0)) {
                var sx = x + nx;
                var sy = y + ny;
                _a = fixPos(sx, sy), sx = _a[0], sy = _a[1];
                neighbors += Number(checkCell(sx, sy));
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
                setCell(x, y, true, newMap, newToLookMap, false);
            }
            else {
                setCell(x, y, false, newMap, newToLookMap, false);
            }
        }
    }
    map = newMap;
    toLookMap = newToLookMap;
    draw();
}
function spawnGlider(x, y) {
    setCells(true, [x + 1, y + 1], [x + 2, y + 2], [x + 2, y + 3], [x + 1, y + 3], [x + 0, y + 3]);
}
spawnGlider(140, 140);
function run() {
    if (!paused) {
        update();
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
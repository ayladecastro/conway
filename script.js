"use strict";
var World = [];
var toLookWorld = [];
const infinite = false;
var paused = true;
const canvas = document.querySelector('.canvas');
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
const ctx = canvas.getContext('2d');
function draw() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    for (const cy in World) {
        var y = Number(cy);
        for (const cx in World[y]) {
            var x = Number(cx);
            var state = checkCell(x, y);
            ctx.fillRect(x, y, 1, 1);
        }
    }
}
function fixPos(x, y) {
    // so we don't need to repeat (!infinite) each time fixPos appears
    if (!infinite) {
        // won't work if position is bigger than width*2-1 or height*2-1
        if (x >= width)
            x -= width;
        else if (x < 0)
            x += width;
        if (y >= height)
            y -= height;
        else if (y < 0)
            y += height;
    }
    return [x, y];
}
function setCell(x, y, state, sWorld = World, tlWorld = toLookWorld, drawit = true) {
    [x, y] = fixPos(x, y);
    if (!sWorld[y])
        sWorld[y] = [];
    if (typeof state == 'undefined')
        state = !sWorld[y][x];
    if (state == true) {
        sWorld[y][x] = true;
        for (let ny = -1; ny <= 1; ny++) {
            for (let nx = -1; nx <= 1; nx++) {
                var sx = x + nx;
                var sy = y + ny;
                if (sx >= 0 && sy >= 0 || !infinite) {
                    [sx, sy] = fixPos(sx, sy);
                    if (!tlWorld[sy])
                        tlWorld[sy] = [];
                    tlWorld[sy][sx] = true;
                }
            }
        }
    }
    else
        sWorld[y].splice(x, 1);
    if (drawit)
        draw();
}
function setCells(state, x, y, ...cells) {
    for (const key in cells) {
        setCell(cells[key][0] + x, cells[key][1] + y, state, undefined, undefined, false);
    }
    draw();
}
function checkCell(x, y) {
    if (typeof World[y] == 'undefined' || typeof World[y][x] == 'undefined')
        return false;
    return true;
}
function checkNeighbors(x, y) {
    var neighbors = 0;
    for (let ny = -1; ny <= 1; ny++) {
        for (let nx = -1; nx <= 1; nx++) {
            if (!(nx == 0 && ny == 0)) {
                var sx = x + nx;
                var sy = y + ny;
                [sx, sy] = fixPos(sx, sy);
                neighbors += Number(checkCell(sx, sy));
            }
        }
    }
    return neighbors;
}
function update() {
    var newWorld = [];
    var newToLookWorld = [];
    for (const my in toLookWorld) {
        for (const mx in toLookWorld[my]) {
            var x = Number(mx);
            var y = Number(my);
            var s = checkCell(x, y);
            var n = checkNeighbors(x, y);
            if (n == 3 || n == 2 && s == true) {
                setCell(x, y, true, newWorld, newToLookWorld, false);
            }
            else {
                setCell(x, y, false, newWorld, newToLookWorld, false);
            }
        }
    }
    World = newWorld;
    toLookWorld = newToLookWorld;
    draw();
}
function spawnGlider(x, y) {
    setCells(true, x, y, [1, 1], [2, 2], [2, 3], [1, 3], [0, 3]);
}
spawnGlider(10, 10);
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
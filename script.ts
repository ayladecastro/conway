interface WorldY extends Array<unknown> {
  [index: number]: boolean;
}

interface World extends Array<unknown> {
  [index: number]: WorldY;
}

interface Vector2 extends Array<unknown> {
  [index: number]: number;
}

var map: World = [];
var toLookMap: World = [];

var camera = {x: 0, y: 0}

const infinite: boolean = true;

var paused: boolean = true;

const canvas = <HTMLCanvasElement> document.querySelector('.canvas');
var width = canvas.width
var height = canvas.height
if (infinite) {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
else {
  width = canvas.width = 150;
  height = canvas.height = 150;
}
const ctx = <CanvasRenderingContext2D> canvas.getContext('2d');

function draw() {
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgb(255, 255, 255)';
  for (const cy in map) {
    var y = Number(cy)
    for (const cx in map[y]) {
      var x = Number(cx)
      var state = checkCell(x, y)
      ctx.fillRect(x + camera.x, y + camera.y, 1, 1);
    }
  }
}

function fixPos(x: number, y: number) {
  // so we don't need to repeat (!infinite) each time fixPos appears
  if (!infinite) {
    // won't work if position is bigger than width*2-1 or height*2-1
    if (x >= width)  x -= width;
    else if (x < 0)  x += width;
    if (y >= height) y -= height;
    else if (y < 0)  y += height;
  }
  return [x, y]
}

function setCell(x: number, y: number, state?: boolean, smap: World = map,
  tlmap: World = toLookMap, drawit: boolean = true) {
  [x, y] = fixPos(x, y)
  if (!smap[y]) smap[y] = [];
  if (typeof state == 'undefined') state = !smap[y][x];

  if (state == true) {
    smap[y][x] = true;
    for (let ny = -1; ny <= 1; ny++) {
      for (let nx = -1; nx <= 1; nx++) {
        var sx: number = x + nx;
        var sy: number = y + ny;
        if (sx >= 0 && sy >= 0 || !infinite) {
          [sx, sy] = fixPos(sx, sy)
          if (!tlmap[sy]) tlmap[sy] = [];
          tlmap[sy][sx] = true;
        }
      }
    }
  }
  else smap[y].splice(x, 1);

  if (drawit) draw(); 
}

function setCells(state: boolean, x: number, y: number, ...cells: Vector2[]) {
  for (const key in cells) {
    setCell(cells[key][0] + x, cells[key][1] + y, state, undefined, undefined, false)
  }
  draw()
}

function checkCell(x: number, y: number) {
  if (typeof map[y] == 'undefined' || typeof map[y][x] == 'undefined') return false;
  return true;
}

function checkNeighbors(x: number, y: number) {
  var neighbors: number = 0;
  for (let ny = -1; ny <= 1; ny++) {
    for (let nx = -1; nx <= 1; nx++) {
      if (!(nx == 0 && ny == 0)) {
        var sx = x + nx;
        var sy = y + ny;
        [sx, sy] = fixPos(sx, sy)
        neighbors += Number(checkCell(sx, sy));
      }
    }
  }
  return neighbors;
}

function update() {
  var newMap: World = [];
  var newToLookMap: World = [];
  for (const my in toLookMap) {
    for (const mx in toLookMap[my]) {
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
}

function spawnGlider(x: number, y: number) {
  setCells(true, x, y, [1, 1], [2, 2], [2, 3], [1, 3], [0, 3]);
}

spawnGlider(10,10)
setCell(0, 0, true)

function run() {
  if (!paused) {
    update();
  }
  draw();
}
setInterval(run, 16);

let keysPressed: any = {};
document.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;

  if(keysPressed[' ']) {
      if (paused) paused = false;
      else paused = true;
  }
  if(keysPressed['w']) {
    camera.y -= 1;
  }
  if(keysPressed['s']) {
    camera.y += 1;
  }
  if(keysPressed['a']) {
    camera.x -= 1;
  }
  if(keysPressed['d']) {
    camera.x += 1;
  }
});

document.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];
});
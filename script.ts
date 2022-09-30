interface MapY extends Array<unknown> {
  [index: number]: boolean;
}

interface Map extends Array<unknown> {
  [index: number]: MapY;
}

interface Vector2 extends Array<unknown> {
  [index: number]: number;
}

var map: Map = [];
var toLookMap: Map = [];

const infinite: boolean = false;

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
  for (let y = 0; y < map.length; y++) {
    if (map[y]) {
      for (let x = 0; x < map[y].length; x++) {
        var state = checkCell(x, y)
        if (map[y][x])
          ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function fixPos(x: number, y: number) {
  // so we don't need to repeat (!infinite) each time fixPos appears
  if (!infinite) {
    if (x >= width)  x = 0;
    else if (x < 0)  x = width - 1;
    if (y >= height) y = 0;
    else if (y < 0)  y = height - 1;
  }
  return [x, y]
}

function setCell(x: number, y: number, state?: boolean, smap: Map = map,
  tlmap: Map = toLookMap, drawit: boolean = true) {
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

function setCells(state: boolean, ...cells: Vector2[]) {
  for (const key in cells) {
    setCell(cells[key][0], cells[key][1], state, undefined, undefined, false)
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
  var newMap: Map = [];
  var newToLookMap: Map = [];
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
  draw();
}

function spawnGlider(x: number, y: number) {
  setCells(true, [x + 1, y + 1], [x + 2, y + 2], [x + 2, y + 3], [x + 1, y + 3], [x + 0, y + 3]);
}

spawnGlider(140,140)

function run() {
  if (!paused) {
    update();
  }
}
setInterval(run, 16);

document.addEventListener('keydown', function(event) {
  if(event.key == 'Enter') {
      if (paused) paused = false;
      else paused = true;
  }
});
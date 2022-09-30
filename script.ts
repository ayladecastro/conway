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

var paused: boolean = true;

const canvas: any = document.querySelector('.canvas');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

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

function setCell(x: number, y: number, state?: boolean, smap: Map = map, tlmap: Map = toLookMap) {
  if (!smap[y]) smap[y] = [];
  if (typeof state == 'undefined') state = !smap[y][x];
  if (state == true) {
    smap[y][x] = true;
  }
  else smap[y].splice(x, 1);
  if (state == true) {
    for (let ny = -1; ny <= 1; ny++) {
      for (let nx = -1; nx <= 1; nx++) {
        var sx: number = x + nx;
        var sy: number = y + ny;
        if (sx >= 0 && sy >= 0) {
          if (!tlmap[y + ny]) tlmap[y + ny] = [];
          tlmap[y + ny][x + nx] = true
        }
      }
    }
  }
}

function setCells(state: boolean, ...cells: Vector2[]) {
  for (const key in cells) {
    setCell(cells[key][0], cells[key][1], state)
  }
  draw()
}

function checkCell(x: number, y: number) {
  if (typeof map[y] == 'undefined' || typeof map[y][x] == 'undefined') return false;
  return true;
}

function checkNeighbors(x: number, y: number) {
  var neighbors = 0;
  for (let ny = -1; ny <= 1; ny++) {
    for (let nx = -1; nx <= 1; nx++) {
      if (!(nx == 0 && ny == 0)) {
        neighbors += Number(checkCell(x + nx, y + ny));
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

setCells(true, [1, 1], [2, 2], [2, 3], [1, 3], [0, 3])

function run() {
  if (!paused) {
    update();
    draw();
  }
}
setInterval(run, 16);

document.addEventListener('keydown', function(event) {
  if(event.key == 'Enter') {
      if (paused) paused = false;
      else paused = true;
  }
});
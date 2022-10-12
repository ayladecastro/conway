interface WorldY extends Array<unknown> {
  [index: number]: boolean;
}

interface World extends Array<unknown> {
  [index: number]: WorldY;
}

type Vector2 = [number, number]

let map: World = [];
let toLookMap: World = [];

let camera = {x: 0, y: 0}

const infinite: boolean = true;

let paused: boolean = true;

const canvas = <HTMLCanvasElement> document.querySelector('.canvas');
let width = canvas.width
let height = canvas.height
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
  ctx.fillStyle = 'rgb(70, 70, 70)';
  for (const cy in toLookMap) {
    let y = Number(cy)
    for (const cx in toLookMap[y]) {
      let x = Number(cx)
      let state = checkCell(x, y)
      ctx.fillRect(x + camera.x, y + camera.y, 1, 1);
    }
  }
  ctx.fillStyle = 'rgb(255, 255, 255)';
  for (const cy in map) {
    let y = Number(cy)
    for (const cx in map[y]) {
      let x = Number(cx)
      let state = checkCell(x, y)
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
  return [x, y];
}

function checkNeighbors(x: number, y: number, changeTLM = false, tlmap: World = toLookMap) {
  let neighbors: number = 0;
  for (let ny = -1; ny <= 1; ny++) {
    for (let nx = -1; nx <= 1; nx++) {      
      let sx = x + nx;
      let sy = y + ny;
      [sx, sy] = fixPos(sx, sy)
      if (changeTLM) {
        if (!tlmap[sy]) tlmap[sy] = [];
        tlmap[sy][sx] = true;
      }
      if (!(nx == 0 && ny == 0)) neighbors += Number(checkCell(sx, sy));
    }
  }
  return neighbors;
}

function setCell(x: number, y: number, state?: boolean,
  smap: World = map, tlmap: World = toLookMap, drawit: boolean = true) {
    [x, y] = fixPos(x, y)
    let lastState: boolean = map[y] && map[y][x] || false;
    if (typeof state == 'undefined') state = !lastState;

    if (state) {
      if (!lastState) checkNeighbors(x, y, true, tlmap);
      else {
        if (!tlmap[y]) tlmap[y] = [];
        tlmap[y][x] = true;
      }
      if (!smap[y]) smap[y] = [];
      smap[y][x] = true;
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

function update() {
  let newMap: World = [];
  let newToLookMap: World = [];
  for (const my in toLookMap) {
    for (const mx in toLookMap[my]) {
      let x = Number(mx);
      let y = Number(my);
      let s: boolean = checkCell(x, y);
      let n: number = checkNeighbors(x, y);
      if (n == 3 || n == 2 && s /*|| n == 6 && !s*/) {
        setCell(x, y, true, newMap, newToLookMap, false);
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
//setCells(true, 3, 3, [0, 0], [0, 1], [0, 2])
//setCell(0, 0, true)
//setCells(true, 50, 50, [2, 0], [3, 0], [4, 0], [1, 1], [4, 1],
//  [0, 2], [4, 2], [0, 3], [3, 3], [0, 4], [1, 4], [2, 4]);

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

  if(keysPressed[' '] || keysPressed['Enter']) {
      if (paused) paused = false;
      else paused = true;
  }
  if(keysPressed['z']) {
    update();
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
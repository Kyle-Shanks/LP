// - Canvas Context -
const cnv = document.getElementById('cnv');
const ctx = cnv.getContext('2d');
const container = document.getElementsByClassName('canvas-container')[0];

function frameFunction() {
  coverFrame();

  drawGrid();
  drawModeButtons();

  // Next Frame
  requestAnimationFrame(frameFunction);
};

function coverFrame() {
  ctx.fillStyle = 'rgba(30,30,30,1)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawGrid() {
  const gridSize = 40; // Each square is 20x20
  const grid = modes[currentMode].grid;

  for (let i in grid) {
    for (let j in grid[i]) {
      const color = (grid[i][j] && currentColor) ? LP.colors[currentColor] : 'rgba(60,60,60,1)';
      ctx.fillStyle = color;
      ctx.fillRect((gridSize*j)+50 + ((gridSize/10)*j), (gridSize*i)+65 + ((gridSize/10)*i), gridSize, gridSize);
    }
  }
}

function drawModeButtons() {
  for (let i in modeArr) {
    const color = (modeArr[i] === currentMode && currentColor) ? LP.colors[currentColor] : 'rgba(60,60,60,1)';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(246+(44*i),35,16,0,2*Math.PI);
    ctx.fill();
  }
}

// Go time
frameFunction();

// Connect to Launchpad
LP.connect().then(
  () => {
    LP.clear();
    LP.send([176,108,currentColor]); // Make session mode button light up
    LP.on('midimessage', onMessage);
    LP.on('press', onPress);
  },
  () => console.log('Aww snap, connection failed :/')
);

// Switching Modes
function onPress(msg) {
  if (LP.buttons.mode.includes(msg.data[1])) {
    LP.setModeColor(0);

    switch (msg.data[1]) {
      case 108: currentMode = 'session'; break;
      case 109: currentMode = 'user1'; break;
      case 110: currentMode = 'user2'; break;
      case 111: currentMode = 'mixer'; break;
    }
    currentColor = modes[currentMode].color;

    LP.setButtonColor(msg.data[1], currentColor);
    updateLP();
  }
}

// Pressing grid or arrow button
function onMessage(msg) {
  if (msg.data[0] === 144) {
    const row = 8 - (Math.floor(msg.data[1]/10));
    const col = (msg.data[1]%10) - 1;
    sendData(row, col, msg.data);
  } else if (LP.buttons.arrow.includes(msg.data[1])) {
    LP.setButtonColor(msg.data[1], (msg.data[2] ? currentColor : 0));
  }
}

function sendData(row,col,data) {
  const mode = modes[currentMode];
  modeTypeFuncs[mode.type](row,col,data,mode.grid);
}

// Sync Launchpad lights to the current grid
function updateLP() {
  LP.clearGrid();
  const grid = modes[currentMode].grid;

  for (let r in grid) {
    for (let c in grid[r]) {
      if (grid[r][c]) LP.setButtonColor((((7-r) + 1.0)*10)+(c*1 + 1.0), currentColor);
    }
  }
}

// 8x8 grid for each mode type
function emptyGrid(type) {
  const grid = Array(8).fill().map(el => Array(8).fill(0));
  switch(type) {
    case 'pan':
      for (let row of grid) {
        row[3] = 1;
        row[4] = 1;
      }
      break;
    case 'fader': grid[7].fill(1); break;
  }
  return grid;
}

let currentColor = 124;
let currentMode = 'session';

const modeArr = ['session','user1','user2','mixer'];
const modes = {
  session: {
    type: 'toggle',
    grid: emptyGrid('toggle'),
    color: 124,
  },
  user1: {
    type: 'gate',
    grid: emptyGrid('gate'),
    color: 78,
  },
  user2: {
    type: 'pan',
    grid: emptyGrid('pan'),
    color: 53,
  },
  mixer: {
    type: 'fader',
    grid: emptyGrid('fader'),
    color: 88,
  },
};

const modeTypeArr = ['gate','toggle','pan','fader'];
const modeTypeFuncs = {
  'gate': (row,col,data,grid) => {
    if (col === 8) {
      LP.setRowColor(row, (data[2] ? currentColor : 0));
      LP.setButtonColor(data[1], (data[2] ? currentColor : 0));
      grid[row].fill(data[2] ? 1 : 0);
    } else {
      LP.setButtonColor(data[1], (data[2] ? currentColor : 0));
      grid[row][col] = data[2] ? 1 : 0;
    }
  },
  'toggle': (row,col,data,grid) => {
    if (data[2]) {
      if (col === 8) {
        LP.setButtonColor(data[1], currentColor);
        grid[row] = grid[row].map(el => el ? 0 : 1);

        const arr = [1,2,3,4,5,6,7,8].map(el => el+((8-row)*10));
        for (let i in arr) {
          LP.setButtonColor(arr[i], grid[row][i] ? currentColor : 0);
        }
      } else {
        LP.setButtonColor(data[1], (grid[row][col] ? 0 : currentColor));
        grid[row][col] = grid[row][col] ? 0 : 1;
      }
    } else if (col === 8) {
      LP.setButtonColor(data[1]);
    }
  },
  'pan': (row,col,data,grid) => {
    if (data[2] && col < 8) {
      LP.setRowColor(row); // Clear row
      grid[row].fill(0);
      if (col < 3) {
        let i = data[1];
        while (i%10 < 5) {
          LP.setButtonColor(i,currentColor);
          grid[row][(i%10) - 1] = 1;
          i++;
        }
      } else if (col > 4) {
        let i = data[1];
        while (i%10 > 4) {
          LP.setButtonColor(i,currentColor);
          grid[row][(i%10) - 1] = 1;
          i--;
        }
      } else {
        LP.setButtonColor(((8-row)*10)+4,currentColor);
        LP.setButtonColor(((8-row)*10)+5,currentColor);
        grid[row][3] = 1;
        grid[row][4] = 1;
      }
    }
  },
  'fader': (row,col,data,grid) => {
    if (data[2]) {
      if (col === 8) {
        grid.forEach(r => r.fill(0));
        LP.clearGrid();

        for (let i = row; i < 8; i++) {
          grid[i].fill(1);
          LP.setRowColor(i, currentColor);
        }
        LP.setButtonColor(data[1], currentColor);
      } else {
        grid.forEach(r => r[col] = 0);
        LP.setColumnColor(col);

        for (let i = row; i < 8; i++) grid[i][col] = 1;
        for (let i = (7-row); i >= 0; i--) LP.setButtonColor(((i+1)*10)+col+1, currentColor);
      }
    } else if (col === 8) {
      LP.setButtonColor(data[1]);
    }
  },
};

function changeModeType(mode,newType) {
  if(modeArr.includes(mode) && modeTypeArr.includes(newType)) {
    modes[mode].type = newType;
    modes[mode].grid = emptyGrid(newType);
  }
  updateLP();
}

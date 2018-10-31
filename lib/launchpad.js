const LP = {
  // Variables
  _midiAccess: null,
  _launchpad: null,
  colors: [
    '#000000','#1C1C1C','#7C7C7C','#FCFCFC','#FF4E48','#FE0A00','#5A0000','#180002',
    '#FFBC63','#FF5700','#5A1D00','#241802','#FDFD21','#FDFD00','#585800','#181800',
    '#81FD2B','#40FD01','#165800','#132801','#35FD2B','#00FE00','#005801','#001800',
    '#35FC47','#00FE00','#005801','#001800','#32FD7F','#00FD3A','#015814','#001C0E',
    '#2FFCB1','#00FB91','#015732','#011810','#39BEFF','#00A7FF','#014051','#001018',
    '#4186FF','#0050FF','#011A5A','#010619','#4747FF','#0000FE','#00005A','#000018',
    '#8347FF','#5000FF','#160067','#0A0032','#FF48FE','#FF00FE','#5A005A','#180018',
    '#FB4E83','#FF0753','#5A021B','#210110','#FF1901','#9A3500','#7A5101','#3E6500',
    '#013800','#005432','#00537F','#0000FE','#01444D','#1A00D1','#7C7C7C','#202020',
    '#FF0A00','#BAFD00','#ACEC00','#56FD00','#008800','#01FC7B','#00A7FF','#021AFF',
    '#3500FF','#7800FF','#B4177E','#412000','#FF4A01','#82E100','#66FD00','#00FE00',
    '#00FE00','#45FD61','#01FBCB','#5086FF','#274DC8','#847AED','#D30CFF','#FF065A',
    '#FF7D01','#B8B100','#8AFD00','#815D00','#3A2802','#0D4C05','#005037','#131429',
    '#101F5A','#6A3C18','#AC0401','#E15136','#DC6900','#FEE100','#99E101','#60B500',
    '#1B1C31','#DCFD54','#76FBB9','#9698FF','#8B62FF','#404040','#747474','#DEFCFC',
    '#A20401','#340100','#00D201','#004101','#B8B100','#3C3000','#B45D00','#4C1300',
  ],
  buttons: {
    all: [
      11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,
      31,32,33,34,35,36,37,38,39,41,42,43,44,45,46,47,48,49,
      51,52,53,54,55,56,57,58,59,61,62,63,64,65,66,67,68,69,
      71,72,73,74,75,76,77,78,79,81,82,83,84,85,86,87,88,89,
      104,105,106,107,108,109,110,111
    ],
    grid: [
      11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,
      31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48,
      51,52,53,54,55,56,57,58,61,62,63,64,65,66,67,68,
      71,72,73,74,75,76,77,78,81,82,83,84,85,86,87,88,
    ],
    top: [104,105,106,107,108,109,110,111],
    mode: [108,109,110,111],
    arrow: [104,105,106,107],
    right: [19,29,39,49,59,69,79,89],
    quadrant: [
      [51,52,53,54,61,62,63,64,71,72,73,74,81,82,83,84],
      [55,56,57,58,65,66,67,68,75,76,77,78,85,86,87,88],
      [11,12,13,14,21,22,23,24,31,32,33,34,41,42,43,44],
      [15,16,17,18,25,26,27,28,35,36,37,38,45,46,47,48],
    ],
  },
  _callbacks: {
    "press": msg => {},
    "release": msg => {},
    "midimessage": msg => console.log(msg),
    "statechange": e => console.log("LP State: " + e.port.state),
  },

  // Setup Functions
  connect: function () {
    return new Promise((resolve, reject) => {
      if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then(midiSuccess, midiFailure);

      function midiSuccess(midi) {
        LP._midiAccess = midi;
        midi.onstatechange = LP._stateChangeCallback;

        for (let input of midi.inputs.values()) {
          input.onmidimessage = LP._midiMessageCallback;
        }
        for (let output of midi.outputs.values()) {
          if(output.name = 'Launchpad MK2') LP._launchpad = output;
        }
        resolve(midi);
      }
      function midiFailure() {
        console.error('No access to your MIDI devices.');
        reject();
      }
    });
  },
  send: function (arr) {
    if (!LP._midiAccess) throw "No MIDI Connection Established";
    if (!LP._launchpad) throw "No Launchpad Connection Established";
    LP._launchpad.send(arr);
  },

  // Event Callbacks
  on: function (eventType, callback) {
    if (!Object.keys(LP._callbacks).includes(eventType)) throw 'Invalid event type';
    LP._callbacks[eventType] = callback;
  },
  _midiMessageCallback: function (msg) {
    LP._callbacks.midimessage(msg);
    msg.data[2] ? LP._callbacks.press(msg) : LP._callbacks.release(msg);
  },
  _stateChangeCallback: function (e) {
    LP._callbacks.statechange(e);
  },

  // Color Functions
  setButton: function (buttonId, colorId = 0, type = 'solid') {
    if (!['solid', 'flash', 'pulse'].includes(type))
      throw "Invalid type. Must be 'solid', 'flash', or 'pulse'.";
    if (colorId > 127 || colorId < 0)
      throw "Invalid color id. Must be between 0 and 127.";
    if (!LP.buttons.all.includes(buttonId))
      throw "Invalid button id. Check 'LP.buttons.all' for valid button ids.";

    let typeId;
    switch (type) {
      case 'solid': typeId = (buttonId > 100 ? 176 : 144); break;
      case 'flash': typeId = (buttonId > 100 ? 177 : 145); break;
      case 'pulse': typeId = (buttonId > 100 ? 178 : 146); break;
    }

    LP.send([typeId, buttonId, colorId]);
  },
  setGroup: function (buttonIds, colorId, type) {
    for (let id of buttonIds) LP.setButton(id, colorId, type);
  },
  setRow: function (rowId, colorId, type) {
    if (rowId < 0 || rowId > 8) throw 'Invalid row id. Must be between 0 - 8.';

    if (rowId === 8) {
      LP.setTopRow(colorId, type);
      return;
    }

    const buttonIds = [1,2,3,4,5,6,7,8].map(n => n+(((8-rowId))*10));
    LP.setGroup(buttonIds, colorId, type);
  },
  setColumn: function (colId, colorId, type) {
    if (colId < 0 || colId > 8) throw 'Invalid column id. Must be between 0 - 8.';
    const buttonIds = [1,2,3,4,5,6,7,8].map(n => (n*10)+(colId+1));
    LP.setGroup(buttonIds, colorId, type);
  },
  setGrid: function (colorId, type) {
    LP.setGroup(LP.buttons.grid, colorId, type);
  },
  setRightColumn: function (colorId, type) {
    LP.setGroup(LP.buttons.right, colorId, type);
  },
  setTopRow: function (colorId, type) {
    LP.setGroup(LP.buttons.top, colorId, type);
  },
  setArrows: function (colorId, type) {
    LP.setGroup(LP.buttons.arrow, colorId, type);
  },
  setModeButtons: function (colorId, type) {
    LP.setGroup(LP.buttons.mode, colorId, type);
  },
  setQuadrant: function (quadrantId, colorId, type) {
    if (quadrantId < 0 || quadrantId > 3) throw 'Invalid quadrant id. Must be between 0 - 3.';
    LP.setGroup(LP.buttons.quadrant[quadrantId],colorId,type);
  },
  setAll: function (colorId, type) {
    LP.setGroup(LP.buttons.all, colorId, type);
  },
  clear: function () {
    LP.setGroup(LP.buttons.all);
  },
  clearGrid: function () {
    LP.setGroup(LP.buttons.grid);
  },
};

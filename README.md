# LP
This is LP. A javascript library written to connect and interact with the Novation Launchpad MKII directly from the browser.

![LP Screenshot](images/screenshot.png)

## Description
LP was made simply as an API to interact with the Launchpad MK2. It can be used to set up callbacks for the various events tied to the Launchpad and has a number of methods defined to light up the Launchpad for visual feedback to inputs. The goal was to make the API as open and flexible as possible to allow it to be used in a wide variety of projects.

The simple playground that was set up in the `script.js` and `canvas.js` files is to show how the launchpad can be used to interact directly with multiple matrices and how this can be used in conjunction with HTML5 canvas for visual feedback within the browser.

## Setup
To set up your Launchpad for use, simply call the `connect` method. This will return a promise so that callbacks can be set for both successful and failed connections.

```javascript
  // Connect to Launchpad
  LP.connect().then(
    // Successful Connection
    () => {
      LP.on('press', msg => console.log(`Button ${msg.data[1]} was pressed.`));
      LP.on('release', msg => console.log(`Button ${msg.data[1]} was released.`));
    },
    // Failed Connection
    () => console.log('Connection Failed :(')
  );
```

## API

LP includes many useful methods for setting up a super cool Launchpad project!

### Configuration API

The main methods for configuration are the following:

- `::connect` - Establish connection to the Launchpad
```javascript
  LP.connect().then(successCallback, failureCallback);
```

- `::send` - Send a midi command directly to the connected Launchpad. (Arguments: midiMessageArray)
```javascript
  LP.send([144,81,41]);  // This will make the top left grid button turn a solid blue color
  LP.send([146,18,53]);  // This will make the bottom right grid button pulse a purple color
  LP.send([176, 104, 72]);  // This will set the up arrow to a solid red color
  LP.send([177, 108, 88]);  // This will set the session button to a flashing blue color
```

- `::on` - Define callbacks on different Launchpad events (Arguments: eventType, callbackFunction)
```javascript
  LP.on('press', msg => console.log(msg));
  LP.on('onmidimessage', midiMessageCallback);
  LP.on('onstatechange', event => console.log("LP State: " + event.port.state));

  const midiMessageCallback = msg => {
    if (msg.data[2]) {
      console.log(`Button ${msg.data[1]} was pressed.`);
    } else {
      console.log(`Button ${msg.data[1]} was released.`);
    }
  };
```
The available Launchpad events are `'statechange'`, `'midimessage'`, `'press'`, and `'release'`

### Display API

The display API is a collection of methods written to light up and turn off different sections of the Launchpad.

- `::clear` - Turn off all of the lights on the Launchpad
- `::clearGrid` - Turn off the lights of the main 8x8 grid
- `::setButton` - Set the color of a specific button (Arguments: buttonId, colorId, colorType)
- `::setGroup` - Set the color of a group of buttons (Arguments: buttonIdArray, colorId, colorType)
- `::setRow` - Set the color of a row of buttons (Arguments: rowId, colorId, colorType)
- `::setColumn` - Set the color of a column of buttons (Arguments: columnId, colorId, colorType)
- `::setGrid` - Set the color of all grid button (Arguments: colorId, colorType)
- `::setRightColumn` - Set the color of the right row of circular buttons (Arguments: colorId, colorType)
- `::setTopRow` - Set the color of the top row of circular buttons (Arguments: colorId, colorType)
- `::setArrows` - Set the color of the arrow buttons in the top row (Arguments: colorId, colorType)
- `::setModeButtons` - Set the color of the mode buttons in the top row (Arguments: colorId, colorType)
- `::setQuadrant` - Set the color of a specific quadrant of the main grid (Arguments: quadrantId, colorId, colorType)
- `::setAll` - Set the color of all buttons on the Launchpad (Arguments: colorId, colorType)

The `colorId` argument corresponds to the color ids assigned to the Launchpad. This argument will default to 0, which will turn off the button.
Note: (A list of the colors by id if available in LP.colors)

The `colorType` argument that all of the coloring methods take will determine the behavior of the button once it is lit. The options are:
  - `'solid'` - This will simply set the button color. This is the default setting.
  - `'flash'` - This will have the button flash on and off
  - `'pulse'` - This will have the button fade in and out


### Helpful Variables

Along with the the methods above, there are also a few helpful variables defined that can be referenced for various purposes.

- `::colors` - This is a list of all of the colors available on the Launchpad with the position in the array corresponding to that color's id.

- `::buttons` - This is an object that hold various arrays of button ids corresponding to different sections on the Launchpad. This can be used as a quick and convenient source for the ids of different groups of buttons. These groups include:
  - `'all'` - A list of all of the button ids
  - `'grid'` - Button ids for the main 8x8 grid
  - `'top'` - Button ids for the top row of circular buttons
  - `'mode'` - Button ids for the four mode buttons of the top row
  - `'arrow'` - Button ids for the four arrow buttons of the top row
  - `'right'` - Button ids for the eight circular buttons to the right of the main grid
  - `'quadrant'` - This is an array containing four arrays, each with the button ids for the four quadrants of the main grid. The order of the quadrants goes top-left (0), top-right (1), bottom-left (2), and bottom-right (3).

## Usage Examples

Once a connection to the Launchpad has been established, the built-in methods will allow you to send messages to the launchpad and set up event listeners and callbacks for messages received from inputs through the Launchpad.

*** Usage examples coming soon ***

Ex: If you have an 8x8 2D array corresponding to the grid buttons of the Launchpad and you would like to update the values based on inputs from the Launchpad, you could do the following:

```javascript
  // 8x8 matrix
  const matrix = Array(8).fill().map(el => Array(8).fill(0));

  // Connecting to Launchpad
  LP.connect().then(connectionCallback);

  function connectionCallback() {
    LP.on('midimessage', msgCallback);
  }

  function msgCallback(msg) {
    // Check for grid or right column button
    if (msg.data[0] === 144) {
      const row = 8 - (Math.floor(msg.data[1]/10));
      const col = (msg.data[1]%10) - 1;

      LP.setButton(msg.data[1], msg.data[2]);

      // Check for right column button
      if (col === 8) {
        LP.setRow(row, msg.data[2]);
        matrix[row].fill(msg.data[2] ? 1 : 0);
      } else {
        matrix[row][col] = (msg.data[2] ? 1 : 0);
      }
    }
  }
```

This will set the position on the matrix to 1 whenever the corresponding button on the Launchpad is pressed, and will set it back to 0 whenever that button is released. If a circular button on the right column is pressed, the entire row will be set to 1.

This will also light up the buttons on the Launchpad as long as they are being pressed down, which is helpful for instant visual feedback for the user.

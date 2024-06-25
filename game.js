document.addEventListener('DOMContentLoaded', () => {
    const gameOutput = document.getElementById('game-output');
    const gameMap = document.getElementById('game-map');
    const gameInput = document.getElementById('game-input');
    const gameSubmit = document.getElementById('game-submit');
  
    let gameState = {
      currentRoom: 'cell',
      inventory: [],
      visitedRooms: ['cell']
    };
  
    const rooms = {
      cell: {
        description: `You wake up in a dimly lit <b>cell</b>. The rough stone walls are cold and damp. A single torch flickers in a sconce just outside the cell, casting eerie shadows. A guard is slumped against a wooden chair, snoring loudly. Past him you can see a hallway continuing north`,
        items: ['padlock', 'stone', 'bones'],
        examine: ['padlock', 'stone', 'bones', 'keyring', 'guard'],
        exits: {  },
      },
      hallway: {
        description: 'You are in a <b>hallway</b>. There are doors to the south, north, and east.',
        exits: { south: 'cell', north: 'end', east: 'study' }
      },
      end: {
        description: 'You have reached the end of the game. Congratulations!',
        exits: { south: 'hallway' }
      },
      study: {
        description: 'You are in a <b>study</b>. There are doors to the south, west and north',
        exits: { west: 'hallway', north: 'kitchen' }
      },
      kitchen: {
        description: 'You are in a <b>kitchen</b>. There are doors to the west.',
        exits: { west: 'end' }
      }
    };

    const items = {
        lockpick: {
          description: 'An old <b>lockpick</b> found behind the loose stone.',
          use: (currentRoom, gameState, rooms, target) => {
            if (currentRoom === 'cell') {
              if (target === 'padlock') {
                rooms[currentRoom].exits = { north: 'hallway'};
                return 'Using the lockpick on the padlock lets you out without waking the guard. A way north is open';
              } else {
                return 'You cannot use the lockpick with that.';
              }
            } else {
              return 'You cannot use the lockpick here.';
            }
          }
        },
        stone: {
          description: 'A loose <b>stone</b> in the wall.',
          use: (currentRoom, gameState, rooms, target) => {
            if (currentRoom === 'cell' && target === 'padlock') {
              return 'Using the stone on the padlock breaks it, but wakes up the guard.';
            } else if (currentRoom === 'cell' && target === 'stone') {
              return 'You cannot use the stone with itself.';
            } else {
              return 'You cannot use the stone here.';
            }
          }
        },
        bones: {
          description: 'Scattered bones in the corner, one with a sharp end.',
          use: (currentRoom, gameState, rooms, target) => {
            if (currentRoom === 'cell' && target === 'stone') {
                gameState.inventory.push('lockpick');
              return 'You use a bone to pry the loose stone free, revealing an old <b>lockpick</b> that you pocket.';
            } else if (currentRoom === 'cell' && target === 'keyring'){
                gameState.inventory.push('keyring');
                return 'Using the bone, you carefully lift the <b>keyring</b> from the guard\'s belt without waking him.';
            } else {
              return 'You cannot use the bones here.';
            }
          }
        },
        keyring: {
          description: `The guard's keyring, hanging loosely from his belt but out of reach.`,
          use: (currentRoom, gameState, rooms, target) => {
            if (currentRoom === 'cell' && target === 'padlock') {
                items.keyring.description = 'It holds dozens of keys';
                rooms[currentRoom].exits = { north: 'hallway'};
                return 'The door opens with a deafening creak but the guard remains a sleep. The way north is clear.';
            } else {
              return 'You cannot use the keyring here.';
            }
          }
        },
        guard: {
          description: 'A guard slumped against a wooden chair, snoring loudly.',
        },
        padlock: {
          description: 'The door to your cell is locked with an old rusted padlock.',
        }
      };
  
    const createAsciiMap = () => {
      const mapGrid = [
        [' ', 'end', 'kitchen'],
        [' ', 'hallway', 'study'],
        [' ', 'cell', ' ']
      ];
  
      let mapString = '';
  
      for (let row of mapGrid) {
        for (let room of row) {
            if (gameState.visitedRooms.includes(room)) {
                mapString += `[${room.charAt(0).toUpperCase()}`;
                if (room == gameState.currentRoom) {
                    mapString += '.';
                }
                mapString += '] '
            } else{
                mapString += '    '; // Spaces for empty cells
            }           
          }  
        
        mapString += '\n';
      }
      return `<pre>${mapString}</pre>`;
    };
  
    const renderGameState = () => {
        gameOutput.innerHTML += `<p>${rooms[gameState.currentRoom].description}</p>`;
        gameMap.innerHTML = createAsciiMap();
        gameOutput.scrollTop = gameOutput.scrollHeight;
    };
  
    const handleCommand = (command) => {
        const [action, ...targets] = command.split(' ');
        const currentRoom = rooms[gameState.currentRoom];
        if (action === 'use') {
            if (gameState.inventory.includes(targets[0])) {
                // Check if the command is for using an item with another item
                if (targets.includes('with') && targets.length === 3) {
                    const firstItem = targets[0];
                    const secondItem = targets[2];
                    
                    if (items[firstItem] && items[firstItem].use) {
                    const actionResult = items[firstItem].use(gameState.currentRoom, gameState, rooms, secondItem);
                    gameOutput.innerHTML += `<p>${actionResult}</p>`;
                    return;
                    }
                } 
                
                // If not using an item with another item, check normal use commands
                const target = targets.join(' ');
                if (items[target] && items[target].use) {
                    const actionResult = items[target].use(gameState.currentRoom, gameState, rooms, target);
                    gameOutput.innerHTML += `<p>${actionResult}</p>`;
                    
                } else {
                    gameOutput.innerHTML += `<p>Could not use ${targets}</p>`;
                }
            } else {
                gameOutput.innerHTML += `<p>Could not use ${targets.join(' ')}, have you picked it up yet?</p>`
            }
        } else if (action === 'go') {
            const target = targets.join(' ');
            if (target in rooms[gameState.currentRoom].exits) {
                gameState.currentRoom = rooms[gameState.currentRoom].exits[target];
                
                if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
                  gameState.visitedRooms.push(gameState.currentRoom);
                }
                
                renderGameState();
              } else {
                gameOutput.innerHTML += `<p>There is no exit ${target}.</p>`;
            }
        } else if (action === 'pickup') {
            const target = targets.join(' ')
            if (items[target] && (currentRoom.items.includes(target))) {
                gameState.inventory.push(target); // Add item to inventory
                gameOutput.innerHTML += `<p>You picked up <b>${target}</b>.</p>`;
            } else {
                gameOutput.innerHTML += `<p>Couldn't pick up ${target}</p>`;
            }
        } else if (action === 'examine') {
            const target = targets.join(' ');
          
            if (target === gameState.currentRoom) {
              gameOutput.innerHTML += `<p>You notice the following items in the room: ${currentRoom.examine.join(', ')}.</p>`;
            } else if (items[target]) {
              gameOutput.innerHTML += `<p>${items[target].description}</p>`;
            } else {
              gameOutput.innerHTML += `<p>Couldn't examine ${target}</p>`;
            }
        } else {
          gameOutput.innerHTML += `<p>Unknown command.</p>`;
        }
      };
      
  
    gameSubmit.addEventListener('click', () => {
      const command = gameInput.value.trim();
      gameInput.value = '';
      handleCommand(command);
    });
  
    gameInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        gameSubmit.click();
      }
    });
    gameOutput.innerHTML += '<p><i>Commands: examine [room or object], pickup [object], use [object] with [object], go [direction].</i></p>'
    renderGameState();
  });
  
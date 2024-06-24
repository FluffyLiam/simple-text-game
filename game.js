document.addEventListener('DOMContentLoaded', () => {
    const gameOutput = document.getElementById('game-output');
    const gameMap = document.getElementById('game-map');
    const gameInput = document.getElementById('game-input');
    const gameSubmit = document.getElementById('game-submit');
  
    let gameState = {
      currentRoom: 'start',
      inventory: [],
      visitedRooms: ['start']
    };
  
    const rooms = {
      start: {
        description: 'You are in a dark room. There are doors to the north and east.',
        exits: { north: 'hallway', east: 'library' }
      },
      hallway: {
        description: 'You are in a hallway. There are doors to the south, north, and east.',
        exits: { south: 'start', north: 'end', east: 'study' }
      },
      end: {
        description: 'You have reached the end of the game. Congratulations!',
        exits: { south: 'hallway' }
      },
      library: {
        description: 'You are in a library. There are doors to the west and north.',
        exits: { west: 'start', north: 'study' }
      },
      study: {
        description: 'You are in a study. There are doors to the south, west and north',
        exits: { south: 'library', west: 'hallway', north: 'kitchen' }
      },
      kitchen: {
        description: 'You are in a kitchen. There are doors to the west.',
        exits: { west: 'end' }
      }
    };
  
    const createAsciiMap = () => {
      const mapGrid = [
        [' ', 'end', 'kitchen'],
        [' ', 'hallway', 'study'],
        [' ', 'start', 'library']
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
      const [action, direction] = command.split(' ');
  
      if (action === 'go' && direction in rooms[gameState.currentRoom].exits) {
        gameState.currentRoom = rooms[gameState.currentRoom].exits[direction];
        
        if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
          gameState.visitedRooms.push(gameState.currentRoom);
        }
        
        renderGameState();
      } else {
        gameOutput.innerHTML += `<p>Unknown command or direction.</p>`;
        gameOutput.scrollTop = gameOutput.scrollHeight;
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
  
    renderGameState();
  });
  
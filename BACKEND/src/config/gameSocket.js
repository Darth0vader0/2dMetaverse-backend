// config/gameSocket.js

const maps = {}; // In-memory player map

function setupGameSocket(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("createMap", ({ playerName, mapId }) => {
      if (!maps[mapId]) {
        maps[mapId] = { players: {} };
      }

      maps[mapId].players[socket.id] = {
        playerName,
        x: 100,
        y: 100,
        direction: 0,   // ✅ Add default
        isMoving: false // ✅ Add default
      };

      socket.join(mapId);
      console.log(`${playerName} created and joined map: ${mapId}`);
    });

    socket.on("joinMap", ({ playerName, mapId }) => {
      if (!maps[mapId]) {
        maps[mapId] = { players: {} };
      }

      maps[mapId].players[socket.id] = {
        playerName,
        x: 100,
        y: 100,
        direction: 0,   // ✅ Add default
        isMoving: false // ✅ Add default
      };

      socket.join(mapId);

      const currentPlayers = Object.entries(maps[mapId].players).map(([id, info]) => ({
        playerId: id,
        playerName: info.playerName,
        x: info.x,
        y: info.y,
        direction: info.direction,
        isMoving: info.isMoving
      }));

      socket.emit("currentPlayers", currentPlayers);

      socket.to(mapId).emit("playerJoined", {
        playerId: socket.id,
        playerName,
        x: 100,
        y: 100,
        direction: 0,
        isMoving: false
      });

      console.log(`${playerName} joined map: ${mapId}`);
    });

    socket.on("playerMoved", ({ x, y, direction, isMoving }) => {
      for (const mapId in maps) {
        if (maps[mapId].players[socket.id]) {
          maps[mapId].players[socket.id].x = x;
          maps[mapId].players[socket.id].y = y;
          maps[mapId].players[socket.id].direction = direction;
          maps[mapId].players[socket.id].isMoving = isMoving;

          socket.to(mapId).emit("playerMoved", {
            playerId: socket.id,
            x,
            y,
            direction,
            isMoving
          });
          break;
        }
      }
    });
// player stopped moving
    socket.on("playerStopped", () => {
      for (const mapId in maps) {
          if (maps[mapId].players[socket.id]) {
              maps[mapId].players[socket.id].isMoving = false;
  
              socket.to(mapId).emit("playerMoved", {
                  playerId: socket.id,
                  x: maps[mapId].players[socket.id].x,
                  y: maps[mapId].players[socket.id].y,
                  direction: maps[mapId].players[socket.id].direction,
                  isMoving: false
              });
  
              break;
          }
      }
  });
    socket.on("disconnect", () => {
      for (const mapId in maps) {
        if (maps[mapId].players[socket.id]) {
          const playerName = maps[mapId].players[socket.id].playerName;
          delete maps[mapId].players[socket.id];

          socket.to(mapId).emit("playerLeft", socket.id);
          console.log(`${playerName} disconnected from map ${mapId}`);

          if (Object.keys(maps[mapId].players).length === 0) {
            delete maps[mapId];
          }

          break;
        }
      }
    });
  });
}

module.exports = setupGameSocket;
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
        y: 100
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
        y: 100
      };

      socket.join(mapId);

      const currentPlayers = Object.entries(maps[mapId].players).map(([id, info]) => ({
        playerId: id,
        playerName: info.playerName,
        x: info.x,
        y: info.y
      }));

      socket.emit("currentPlayers", currentPlayers);

      socket.to(mapId).emit("playerJoined", {
        playerId: socket.id,
        playerName,
        x: 100,
        y: 100
      });

      console.log(`${playerName} joined map: ${mapId}`);
    });

    socket.on("playerMoved", ({ x, y }) => {
      for (const mapId in maps) {
        if (maps[mapId].players[socket.id]) {
          maps[mapId].players[socket.id].x = x;
          maps[mapId].players[socket.id].y = y;

          socket.to(mapId).emit("playerMoved", {
            playerId: socket.id,
            x,
            y
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

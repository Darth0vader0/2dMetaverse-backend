const players = {}

const gameSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        socket.on("joinMap", ({ playerName, mapId }) => {
            socket.join(mapId);
            players[socket.id] = { playerName, mapId };

            console.log(`${playerName} joined map ${mapId}`);

            socket.to(mapId).emit("playerJoined", {
                playerId: socket.id,
                playerName,
            });

            socket.emit("joinedMap", {
                success: true,
                mapId,
            });
        });

        socket.on("playerMoved", ({ x, y }) => {
            const player = players[socket.id];
            if (!player) return;

            const { playerName, mapId } = player;

            socket.to(mapId).emit("playerMoved", {
                playerId: socket.id,
                playerName,
                x,
                y,
            });
        });

        socket.on("disconnect", () => {
            const player = players[socket.id];
            if (player) {
                const { playerName, mapId } = player;

                socket.to(mapId).emit("playerLeft", {
                    playerId: socket.id,
                    playerName,
                });

                delete players[socket.id];
            }

            console.log("❌ Player disconnected:", socket.id);
        });
    });
}

module.exports = gameSocket;
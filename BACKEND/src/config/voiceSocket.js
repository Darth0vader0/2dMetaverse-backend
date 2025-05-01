const mapForPlayersInVoiceChannel = new Map(); // voiceChannelCode => { players: {}, mapId }
const playerToVoiceChannel = new Map();       // socket.id => { voiceChannelCode, playerName, mapId }

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {

    // === CREATE VOICE CHANNEL ===
    socket.on("createVoiceChannel", ({ voiceChannelCode, playerName, mapId }) => {
      if (!mapForPlayersInVoiceChannel.has(voiceChannelCode)) {
        mapForPlayersInVoiceChannel.set(voiceChannelCode, { players: {}, mapId });
      }

      const channel = mapForPlayersInVoiceChannel.get(voiceChannelCode);
      channel.players[socket.id] = { playerName };

      socket.join(voiceChannelCode);
      playerToVoiceChannel.set(socket.id, { playerName, voiceChannelCode, mapId });

      io.to(mapId).emit("voiceChannelCreated", { voiceChannelCode, playerName });
      socket.emit("currentPlayersInVoiceChannel", [
        { playerId: socket.id, playerName }
      ]);

      console.log(`${playerName} created and joined voice channel: ${voiceChannelCode}`);
    });

    // === JOIN VOICE CHANNEL ===
    socket.on("joinVoiceChannel", ({ voiceChannelCode, playerName, mapId }) => {
      const channel = mapForPlayersInVoiceChannel.get(voiceChannelCode);
      if (!channel) {
        socket.emit("error", { message: "Voice channel not found" });
        return;
      }

      channel.players[socket.id] = { playerName };
      socket.join(voiceChannelCode);
      playerToVoiceChannel.set(socket.id, { playerName, voiceChannelCode, mapId });

      const currentPlayers = Object.entries(channel.players).map(([id, info]) => ({
        playerId: id,
        playerName: info.playerName,
      }));

      socket.emit("currentPlayersInVoiceChannel", currentPlayers);

      io.to(voiceChannelCode).emit("playerJoinedVoiceChannel", {
        playerId: socket.id,
        playerName,
      });

      console.log(`${playerName} joined voice channel: ${voiceChannelCode}`);
    });

    // === WEBRTC SIGNALING ===
    socket.on("webrtcOffer", ({ voiceChannelCode, offer, sender }) => {
      socket.to(voiceChannelCode).emit("webrtcOffer", { offer, sender });
    });

    socket.on("webrtcAnswer", ({ voiceChannelCode, answer, sender }) => {
      io.to(sender).emit("webrtcAnswer", { answer });
    });

    socket.on("iceCandidate", ({ voiceChannelCode, candidate, sender }) => {
      socket.to(voiceChannelCode).emit("iceCandidate", { candidate, sender });
    });

    // === LEAVE VOICE CHANNEL ===
    socket.on("leaveVoiceChannel", ({ mapId, voiceChannelCode, playerName }) => {
      socket.leave(voiceChannelCode);

      const channel = mapForPlayersInVoiceChannel.get(voiceChannelCode);
      if (channel && channel.players[socket.id]) {
        delete channel.players[socket.id];
        io.to(voiceChannelCode).emit("playerLeftChannel", { playerName });

        // Clean up if no players left
        if (Object.keys(channel.players).length === 0) {
          mapForPlayersInVoiceChannel.delete(voiceChannelCode);
        }
      }

      playerToVoiceChannel.delete(socket.id);
      console.log(`${playerName} left voice channel: ${voiceChannelCode}`);
    });

    // === HANDLE DISCONNECT ===
    socket.on("disconnect", () => {
      const playerData = playerToVoiceChannel.get(socket.id);
      if (playerData) {
        const { voiceChannelCode, playerName } = playerData;
        const channel = mapForPlayersInVoiceChannel.get(voiceChannelCode);

        if (channel && channel.players[socket.id]) {
          delete channel.players[socket.id];
          io.to(voiceChannelCode).emit("playerLeftChannel", { playerName });

          if (Object.keys(channel.players).length === 0) {
            mapForPlayersInVoiceChannel.delete(voiceChannelCode);
          }
        }
        playerToVoiceChannel.delete(socket.id);
        console.log(`${playerName} disconnected from voice channel: ${voiceChannelCode}`);
      }
    });
  });
};

module.exports = setupVoiceSocket;

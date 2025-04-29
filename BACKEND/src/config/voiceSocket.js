const mapForPlayersInVoiceChannel = new Map(); // voiceChannelCode for new voice channel in which all players will connect for voice chat

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("createVoiceChannel", ({ voiceChannelCode, playerName, mapId }) => {
      if (!mapForPlayersInVoiceChannel[voiceChannelCode]) {
        mapForPlayersInVoiceChannel[voiceChannelCode] = { players: {}, mapId }; // create a new voice channel if it doesn't exist
      }
      mapForPlayersInVoiceChannel[voiceChannelCode].players[socket.id] = { playerName }; // store the player in the map with their name
      socket.join(voiceChannelCode); // join the voice channel

      io.to(mapId).emit("voiceChannelCreated", { voiceChannelCode, playerName }); // notify the players in the map that the channel was created
      console.log(`${playerName} created and joined voice channel: ${voiceChannelCode}`);
    });

    socket.on("joinVoiceChannel", ({ voiceChannelCode, playerName, isInVoiceChannel, mapId }) => {
      if (!mapForPlayersInVoiceChannel[voiceChannelCode]) {
        socket.emit("error", { message: "Voice channel not found" });
        return;
      }
      mapForPlayersInVoiceChannel[voiceChannelCode].players[socket.id] = { playerName }; // store the player in the map with their name

      socket.join(voiceChannelCode); // join the voice channel

      const currentPlayers = Object.entries(mapForPlayersInVoiceChannel[voiceChannelCode].players).map(([id, info]) => ({
        playerId: id,
        playerName: info.playerName,
        isInVoiceChannel: isInVoiceChannel
      }));

      io.to(mapId).emit("currentPlayersInVoiceChannel", currentPlayers); // send the current players in the voice channel to the new player

      io.to(mapId).emit("playerJoinedVoiceChannel", {
        playerId: socket.id,
        playerName,
        isInVoiceChannel
      });
      // notify others in the map about the new player
      mapForPlayersInVoiceChannel.set(socket.id, { playerName, voiceChannelCode, mapId }); // store the player in the map with their name and voice channel code
      console.log(`${playerName} joined voice channel: ${voiceChannelCode}`);
    });

    // Handle WebRTC signaling for voice streaming
    socket.on("webrtcOffer", ({ voiceChannelCode, offer, sender, mapId }) => {
      // Broadcast the offer to all players in the same map except the sender
      socket.to(voiceChannelCode).emit("webrtcOffer", { offer, sender });
    });

    socket.on("webrtcAnswer", ({ voiceChannelCode, answer, sender, mapId }) => {
      // Broadcast the answer to the specific sender
      io.to(sender).emit("webrtcAnswer", { answer });
    });

    socket.on("iceCandidate", ({ voiceChannelCode, candidate, sender, mapId }) => {
      // Broadcast the ICE candidate to all players in the same map except the sender
      socket.to(voiceChannelCode).emit("iceCandidate", { candidate, sender });
    });

    socket.on("leaveVoiceChannel", ({ mapId }) => {
      const playerData = mapForPlayersInVoiceChannel.get(socket.id);
      if (playerData) {
        const { voiceChannelCode, playerName } = playerData;
        socket.leave(voiceChannelCode); // leave the voice channel
        io.to(mapId).emit("playerLeftChannel", { playerName }); // notify others in the map
        console.log(`${playerName} left voice channel: ${voiceChannelCode}`);
        mapForPlayersInVoiceChannel.delete(socket.id); // remove the player from the map
      }
    });

    // Disconnect from the voice channel
    socket.on("disconnect", () => {
      const playerData = mapForPlayersInVoiceChannel.get(socket.id);
      if (playerData) {
        const { voiceChannelCode, playerName, mapId } = playerData;
        io.to(mapId).emit("playerDisconnected", { playerName });
        console.log(`${playerName} left voice channel: ${voiceChannelCode}`);
        mapForPlayersInVoiceChannel.delete(socket.id); // remove the player from the map
      }
    });
  });
};

module.exports = setupVoiceSocket;
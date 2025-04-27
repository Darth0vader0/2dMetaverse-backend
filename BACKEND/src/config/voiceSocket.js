const mapForPlayersInVoiceChannel = new Map(); // voiceChannelCode for new voice channel in which all players will connect for voice chat

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {
    // join a voice channel (two arguments are passed: voiceChannelCode and playerName)
    socket.on("joinVoiceChannel", ({ voiceChannelCode, playerName }) => {
      socket.join(voiceChannelCode); // join the voice channel
      mapForPlayersInVoiceChannel.set(socket.id, { playerName, voiceChannelCode }); // store the player in the map with their name and voice channel code
      console.log(`${playerName} joined voice channel: ${voiceChannelCode}`);
    });

    // Handle WebRTC signaling for voice streaming
    socket.on("webrtcOffer", ({ voiceChannelCode, offer, sender }) => {
      // Broadcast the offer to all players in the same voice channel except the sender
      socket.to(voiceChannelCode).emit("webrtcOffer", { offer, sender });
    });

    socket.on("webrtcAnswer", ({ voiceChannelCode, answer, sender }) => {
      // Broadcast the answer to the specific sender
      io.to(sender).emit("webrtcAnswer", { answer });
    });

    socket.on("iceCandidate", ({ voiceChannelCode, candidate, sender }) => {
      // Broadcast the ICE candidate to all players in the same voice channel except the sender
      socket.to(voiceChannelCode).emit("iceCandidate", { candidate, sender });
    });

    // Disconnect from the voice channel
    socket.on("disconnect", () => {
      const playerData = mapForPlayersInVoiceChannel.get(socket.id);
      if (playerData) {
        const { voiceChannelCode, playerName } = playerData;
        socket.to(voiceChannelCode).emit("playerDisconnected", { playerName });
        console.log(`${playerName} left voice channel: ${voiceChannelCode}`);
        mapForPlayersInVoiceChannel.delete(socket.id); // remove the player from the map
      }
    });
  });
};

module.exports = setupVoiceSocket;
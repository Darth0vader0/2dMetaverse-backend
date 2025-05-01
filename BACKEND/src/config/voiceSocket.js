const mapForPlayersInVoiceChannel = new Map(); // voiceChannelCode for new voice channel in which all players will connect for voice chat

const setupVoiceSocket = (io) => {
  io.on("connection", (socket) => {

    const emitCurrentPlayersInVoiceChannel = (voiceChannelCode) => {
      const playersInVoiceChannel = Object.entries(mapForPlayersInVoiceChannel[voiceChannelCode]?.players || {}).map(([id, info]) => ({
        playerId: id,
        playerName: info.playerName,
      }));
      io.to(voiceChannelCode).emit("currentPlayersInVoiceChannel", playersInVoiceChannel);
    };

    socket.on("createVoiceChannel", ({ voiceChannelCode, playerName, mapId }) => {
      if (!mapForPlayersInVoiceChannel[voiceChannelCode]) {
        mapForPlayersInVoiceChannel[voiceChannelCode] = { players: {}, mapId }; // create a new voice channel if it doesn't exist
      }
      mapForPlayersInVoiceChannel[voiceChannelCode].players[socket.id] = { playerName }; // store the player in the map with their name
      socket.join(voiceChannelCode); // join the voice channel

      io.to(voiceChannelCode).emit("voiceChannelCreated", { voiceChannelCode, playerName }); // notify the voice channel participants
      emitCurrentPlayersInVoiceChannel(voiceChannelCode); // emit current players in the voice channel
      console.log(`${playerName} created and joined voice channel: ${voiceChannelCode}`);
    });

    socket.on("joinVoiceChannel", ({ voiceChannelCode, playerName, mapId }) => {
      if (!mapForPlayersInVoiceChannel[voiceChannelCode]) {
        socket.emit("error", { message: "Voice channel not found" });
        return;
      }
      mapForPlayersInVoiceChannel[voiceChannelCode].players[socket.id] = { playerName }; // store the player in the map with their name

      socket.join(voiceChannelCode); // join the voice channel

      emitCurrentPlayersInVoiceChannel(voiceChannelCode); // emit current players in the voice channel
      io.to(voiceChannelCode).emit("playerJoinedVoiceChannel", {
        playerId: socket.id,
        playerName,
      });
      console.log(`${playerName} joined voice channel: ${voiceChannelCode}`);
    });

    socket.on("leaveVoiceChannel", ({ voiceChannelCode, playerName }) => {
      socket.leave(voiceChannelCode); // leave the voice channel
      if (mapForPlayersInVoiceChannel[voiceChannelCode]) {
        delete mapForPlayersInVoiceChannel[voiceChannelCode].players[socket.id]; // remove the player from the voice channel
        if (Object.keys(mapForPlayersInVoiceChannel[voiceChannelCode].players).length === 0) {
          delete mapForPlayersInVoiceChannel[voiceChannelCode]; // delete the voice channel if empty
        }
      }
      io.to(voiceChannelCode).emit("playerLeftVoiceChannel", { playerName }); // notify the voice channel participants
      emitCurrentPlayersInVoiceChannel(voiceChannelCode); // emit current players in the voice channel
      console.log(`${playerName} left voice channel: ${voiceChannelCode}`);
    });

    socket.on("disconnect", () => {
      for (const [voiceChannelCode, channelData] of mapForPlayersInVoiceChannel.entries()) {
        if (channelData.players[socket.id]) {
          const { playerName } = channelData.players[socket.id];
          delete channelData.players[socket.id]; // remove the player from the voice channel
          if (Object.keys(channelData.players).length === 0) {
            mapForPlayersInVoiceChannel.delete(voiceChannelCode); // delete the voice channel if empty
          }
          io.to(voiceChannelCode).emit("playerDisconnected", { playerName }); // notify the voice channel participants
          emitCurrentPlayersInVoiceChannel(voiceChannelCode); // emit current players in the voice channel
          console.log(`${playerName} disconnected from voice channel: ${voiceChannelCode}`);
          break;
        }
      }
    });
  });
};

module.exports = setupVoiceSocket;
const app = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on("connection", (socket) => {
  console.log("new client connected", socket.id);

  socket.on("user_join", (data) => {
    const { name, room } = data;
    console.log(`A user named '${name}' joined the room '${room}'`);

    socket.join(room); // User joins the specified room

    socket.to(room).emit("user_join", name); // Send user_join event only to the users in the same room
  });

  socket.on("message", ({ name, message, room }) => {
    console.log(name, message, socket.id);

    io.to(room).emit("message", { name, message }); // Send message only to the users in the same room
  });

  socket.on("disconnect", () => {
    console.log("Disconnect Fired");
  });
});

http.listen(4000, () => {
  console.log(`listening on *:${4000}`);
});

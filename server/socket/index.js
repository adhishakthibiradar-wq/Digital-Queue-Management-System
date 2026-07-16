import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (room) => {
      if (room) {
        socket.join(room);
      }
    });

    socket.on("disconnect", () => {
      // Intentionally left empty for future real-time queue updates.
    });
  });

  return io;
};

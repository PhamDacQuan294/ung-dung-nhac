import { Server, Socket } from "socket.io";

export const chatSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
  })
}
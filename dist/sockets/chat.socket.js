"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSocket = void 0;
const chatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
    });
};
exports.chatSocket = chatSocket;

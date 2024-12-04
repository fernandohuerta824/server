const { Server } = require('socket.io')

let io

module.exports = {
    init: httpServer => {
        io = new Server(httpServer, {
            cors: {
                origin: "http://192.168.100.188:3000"
            }
        })
    },
    getIO: () => {
        if(!io) {
            throw new Error('Socket.io not initializad')
        }

        return io
    }
}

import * as wsock from "socket.io"

import {ConsolePlayer} from '../../driver/console'
import {ProcessPlayer} from '../../driver/process'
import {adaptWebSocket} from '../../driver/wsock'


let port = parseInt(process.argv[2], 10);
let command = process.argv[3];
 
console.log('listen', port);
let server = wsock(port);
server.on('connection', (socket) => {
    let player = new ProcessPlayer(command);
    adaptWebSocket(socket, player);
});

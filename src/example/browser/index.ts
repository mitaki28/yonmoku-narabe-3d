import * as three from 'three.js'
import * as wsock from 'socket.io-client'
import 'babel-polyfill'

import {Color} from "../../core/color"
import {Rule} from '../../core/rule'
import {TimeLimitProxy} from "../../driver/client"
import {ConsolePlayer} from "../../driver/console"
import {Server} from "../../driver/server"

import {WebGLObserver} from '../../browser/webgl'
import {WebSocketPlayer} from '../../driver/wsock'

export function waitForEvent<T>(socket: SocketIOClient.Socket, ev: string) {
    return new Promise<T>((resolve, reject) => {
        socket.once(ev, (data: any) => {
            resolve(<T>data);
        });        
    });
}


async function main() {
    let observer = new WebGLObserver(window.innerHeight, window.innerWidth);
    observer.animate();
    //let blackPlayer = observer.player();
    //let whitePlayer = observer.player();
    let blackSocket = wsock("http://localhost:4000");
    await waitForEvent(blackSocket, 'connect');
    let blackPlayer = new TimeLimitProxy(new WebSocketPlayer(blackSocket), 10000);

    //let whiteSocket = wsock("http://192.168.6.198:4001");
    let whiteSocket = wsock("http://localhost:4001");
    await waitForEvent(whiteSocket, 'connect');    
    let whitePlayer = new TimeLimitProxy(new WebSocketPlayer(whiteSocket), 10000);
    
    new Server(whitePlayer, blackPlayer, observer).start({
        initialColor: Color.Black,
        numRow: 4,
        numCol: 4,
        cells: [
            [[Color.Black], [], [], [Color.White]],
            [[], [], [], []],
            [[], [], [], []],
            [[Color.White], [], [], [Color.Black]]
        ],
        maxLayer: 4,
        requiredConnection: 4
    });
    document.body.appendChild(observer.renderer.domElement);  
};
main();


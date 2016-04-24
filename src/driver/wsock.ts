import * as wsock from "socket.io"
import * as events from "events"

import {Color} from "../core/color"
import {State} from "../core/state"
import {Rule} from "../core/rule"

import {Player} from "./client"

export function waitForEvent<T>(socket: SocketIO.Socket, ev: string) {
    return new Promise<T>((resolve, reject) => {
        socket.once(ev, (data: any) => {
            resolve(<T>data);
        });        
    });
}

export function adaptWebSocket(socket: SocketIO.Socket, player: Player) {
    socket.on('init', async (rule: Rule) => {
        try {
            await player.init(rule)        
        } catch (e) {
            console.log(e);
        }
        socket.emit('init done', null);
    });
    socket.on('assign', async (color: Color) => {
        await player.assign(color);
        socket.emit('assign done', null); 
    });
    socket.on('send', async () => {
        let [row, col] = await player.send();
        socket.emit('send done', [row, col]); 
    });
    socket.on('recv', async (pos: [number, number]) => {
        let [row, col] = pos;
        await player.recv(row, col);
        socket.emit('recv done', null); 
    });
    socket.on('finish', async (winner: void|Color) => {
        await player.finish(winner);
        socket.emit('finish done', null);
    });
    socket.on('fail', async (data: {who: void|Color, error: string}) => {
        await player.fail(data.who, data.error);
        socket.emit('fail done', null);
    });
}

export class WebSocketPlayer implements Player {
    socket: SocketIO.Socket;
    constructor(socket) {
        this.socket = socket;
    }
    async init(rule: Rule): Promise<void> {
        this.socket.emit('init', rule);
        await waitForEvent(this.socket, 'init done');
    }
    async assign(color: Color): Promise<void> {
        this.socket.emit('assign', color);
        await waitForEvent(this.socket, 'assign done');
    }
    async send(): Promise<[number, number]> {
        this.socket.emit('send');
        let ans = await waitForEvent<[number, number]>(this.socket, 'send done');
        return ans;
    }
    async recv(row: number, col: number): Promise<void> {
        this.socket.emit('recv', [row, col]);
        await waitForEvent(this.socket, 'recv done');
    }
    async finish(winner: Color | void): Promise<void> {
        this.socket.emit('finish', winner);
        await waitForEvent(this.socket, 'finish done');        
    }
    async fail(who: Color | void, error: string): Promise<void> {
        this.socket.emit('fail', {who: who, error: error});
        await waitForEvent(this.socket, 'fail done');  
    }   
    
}
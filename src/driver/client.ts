import {Color} from "../core/color"
import {Rule} from "../core/rule"
import {State} from "../core/state"

import {withTimeLimit, LoggingOnReject} from "../util"

export interface Observer {
    init(rule: Rule): Promise<void>;
    recv(row: number, col: number): Promise<void>;
    finish(winner: Color|void): Promise<void>;
    fail(who: Color|void, error: string): Promise<void>;
}

export abstract class StatefulObserver implements Observer {
    state: State;
    async init(rule: Rule): Promise<void> {
        this.state = new State(rule);
        await this.onInit(rule);
        return;
    }
    async recv(row: number, col: number): Promise<void> {
        await this.onRecv(row, col);
        this.state.put(row, col);
        return;
    }
    async finish(winner: Color|void): Promise<void> { 
        await this.onFinish(winner);
        return;
    }
    async fail(who: Color|void, error: string): Promise<void> {
        await this.onFail(who, error);
        return;
    } 
    
    async onInit(rule: Rule): Promise<void> { return; }
    async onRecv(row: number, col: number): Promise<void> { return; }
    async onFinish(winner: Color|void): Promise<void> { return; }
    async onFail(who: Color|void, error: string): Promise<void> { return; }
}

export class NullObserver extends StatefulObserver {
    constructor() { super(); }
}

export interface Player extends Observer {
    assign(color: Color): Promise<void>;
    send(): Promise<[number, number]>;
}

export abstract class StatefulPlayer extends StatefulObserver implements Player {
    color: Color;
    async assign(color: Color): Promise<void> {
        this.color = color;
        await this.onAssign(color);
        return;
    }
    async send(): Promise<[number, number]> {
        const [row, col] = await this.handle();
        this.state.put(row, col);
        return <[number, number]>[row, col];        
    }
    abstract handle(): Promise<[number, number]>;
    async onAssign(color: Color): Promise<void> { return; }
}

export class TimeLimitProxy implements Player {
    player: Player;
    limit: number;
    constructor(player: Player, limit: number) {
        this.player = player;        
        this.limit = limit;
    } 
    async init(rule: Rule): Promise<void> {
        return await withTimeLimit(this.player.init(rule), this.limit);
    }
    async assign(color: Color): Promise<void> {
        return await withTimeLimit(this.player.assign(color), this.limit);
    }
    async send(): Promise<[number, number]> {
        return await withTimeLimit(this.player.send(), this.limit);
    }
    async recv(row: number, col: number): Promise<void> {
        return await withTimeLimit(this.player.recv(row, col), this.limit);
    }
    async finish(winner: Color|void): Promise<void> {
        return await withTimeLimit(this.player.finish(winner), this.limit);
    }
    async fail(who: Color|void, error: string): Promise<void> {
         return await withTimeLimit(this.player.fail(who, error), this.limit);
    }    
}
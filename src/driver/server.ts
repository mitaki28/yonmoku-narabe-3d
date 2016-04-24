import {Color, another} from "../core/color"
import {Rule} from "../core/rule"
import {State} from "../core/state"
import {Observer, Player, NullObserver} from "./client"
import {LoggingOnReject} from "../util"

export class Server {
    currentHandler: Color|void; 
    state: State;
    observer: Observer
    clients: Map<Color, Player>;
    constructor(blackClient: Player, whiteClient: Player, observer: Observer = new NullObserver) {
        this.clients = new Map<Color, Player>();
        this.clients.set(Color.Black, blackClient);
        this.clients.set(Color.White, whiteClient);
        this.observer = observer;
        this.currentHandler = undefined;
    }
    
    async withPlayer<T>(color: Color, f: (player: Player) => Promise<T>): Promise<T> {
        this.currentHandler = color;
        let ret = await f(this.clients.get(color));
        this.currentHandler = undefined;
        return ret; 
    }
    
    async withObserver<T>(f: (observer: Observer) => Promise<T>): Promise<T> {
        try {
            return f(this.observer); 
        } catch (e) {
            console.error('Observer: ', e);
        }
    }
    
    async mainRoutine(rule: Rule): Promise<void> {
        await this.withObserver((observer) => observer.init(rule) );
        await this.withPlayer(Color.Black, (player) => player.init(rule) );
        await this.withPlayer(Color.White, (player) => player.init(rule) );
        
        await this.withPlayer(Color.Black, (player) => player.assign(Color.Black) );
        await this.withPlayer(Color.White, (player) => player.assign(Color.White) );
        while (!this.state.isGameOver()) {
            let row, col;
            await this.withPlayer( this.state.color, async (player) => {
                [row, col] = await player.send();
                this.state.put(row, col);            
            });
            await this.withObserver((observer) => observer.recv(row, col));
            await this.withPlayer( this.state.color, async (player) => player.recv(row, col) );
        }        
    }

    @LoggingOnReject
    async start(rule: Rule): Promise<void> {
        this.state = new State(rule);
        try {
            try {
                await this.mainRoutine(rule);
            } catch (e) {
                console.log("" + e);
                await Promise.all([
                    this.observer.fail(this.currentHandler, "" + e),
                    this.clients.get(Color.Black).fail(this.currentHandler, "" + e),
                    this.clients.get(Color.White).fail(this.currentHandler, "" + e)
                ]);
                return;
            }
            await Promise.all([
                this.observer.finish(this.state.winner()),
                this.clients.get(Color.Black).finish(this.state.winner()),
                this.clients.get(Color.White).finish(this.state.winner())            
            ]);
        } catch (e) {
            console.error('Finalize:', e);
            if (e instanceof Error) {
                console.error('Stack: ', e.stack);
            }
            
        }
    }
}
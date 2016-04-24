import * as readline from "readline"

import {Color} from "../core/color"
import {State} from "../core/state"
import {Rule} from "../core/rule"

import {StatefulPlayer} from "./client"
import {Server} from "./server"

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt('>>> ');
function gets(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        rl.once('line', (line: string) => {
            resolve(line);
        });
    });
}



export class ConsolePlayer extends StatefulPlayer {
    constructor() { super(); }
    
    async handle(): Promise<[number, number]> {
        // for (let row = 0; row < this.state.board.numRow(); row++) {
        //     for (let col = 0; col < this.state.board.numCol(); col++) {
        //         process.stdout.write('[');
        //         for (let layer = 0; layer < this.state.board.numLayer(row, col); layer++) {
        //             process.stdout.write(this.state.board.get(row, col, layer) == Color.Black ? "#" : "-");
        //         }
        //         process.stdout.write(']')
        //     }
        //     console.log()
        // }
        for (;;) {
            try {
                rl.prompt();
                let line = await gets();
                let [row, col] = line.split(/\s+/).map((v) => parseInt(v, 10));
                if (!this.state.canPut(row, col)) throw new Error(`Can not put at ${row} ${col}`);
                return <[number, number]>[row, col];                            
            } catch (e) {
                console.log(e);
            }
        }
    }
    async onInit(rule: Rule): Promise<void> {
        console.log(rule);
        return;
    }
    async onAssign(color: Color): Promise<void> {
        console.log('You are', color);
        return;
    }

    async onRecv(row: number, col: number): Promise<void> {
        console.log('Opponent puts at ', row, col); 
        return;
    }
    async onFinish(winner: Color | void): Promise<void> {
        console.log(winner, 'wins');
        return;
    }
    async onFail(who: Color | void, error: string): Promise<void> {
        console.log(who, 'fail.');
        console.log('Because:', error);
        return;
    }

}
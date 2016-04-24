import * as events from "events"
import * as cp from "child_process"
import * as stream from "stream"
import * as readline from "readline"

import {Color} from "../core/color"
import {State} from "../core/state"
import {Rule} from "../core/rule"
import {LoggingOnReject} from "../util"

import {Player} from "./client"

function readLine(rl: readline.ReadLine): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        rl.question('', (line) => {
            resolve(line);    
        });
    });
} 

export class ProcessPlayer implements Player {
    path: string;
    proc: cp.ChildProcess;
    reader: readline.ReadLine;
    constructor(path: string) {
        this.path = path;
    }
    
    @LoggingOnReject
    async init(rule: Rule): Promise<void> {
        if (this.proc != null) {
            this.terminateProcess();
            this.proc = null;
            this.reader = null;
        }
        this.proc = cp.execFile(this.path);
        this.proc.stderr.pipe(process.stderr);
        this.reader = readline.createInterface({
            input: this.proc.stdout
        });        
        this.proc.stdin.write('INIT\n');
        this.proc.stdin.write(`${rule.numRow} ${rule.maxLayer} ${rule.numCol}\n`);
        for (let row = 0; row < rule.numRow; row++) {
            for (let col = 0; col < rule.numCol; col++) {
                let len = rule.cells[row][col].length;
                this.proc.stdin.write(`${len}`);
                for (let layer = 0; layer < len; layer++) {
                    this.proc.stdin.write(` ${rule.cells[row][col][layer]}`);
                }
                this.proc.stdin.write('\n');
            }
        }
        return;
    }
    
    @LoggingOnReject
    async assign(color: Color): Promise<void> {
        this.proc.stdin.write('ASSIGN\n');
        this.proc.stdin.write(`${color}\n`)
        return;
    }
    
    @LoggingOnReject
    async send(): Promise<[number, number]> {
        this.proc.stdin.write('SEND\n');
        try {
            let line = await readLine(this.reader);  
            let [row, col] = line.split(' ').map((s) => parseInt(s, 10));
            return <[number, number]>[row, col];      
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    
    @LoggingOnReject
    async recv(row: number, col: number): Promise<void> {
        this.proc.stdin.write('RECV\n');
        this.proc.stdin.write(`${row} ${col}\n`);
    }
    
    @LoggingOnReject
    async finish(winner: Color | void): Promise<void> {
        this.proc.stdin.write('FIN\n');
        if (typeof winner === 'undefined') {
            this.proc.stdin.write('2\n');
        } else {
            this.proc.stdin.write('${color}\n');            
        }
        this.terminateProcess(1000);
    }
    
    @LoggingOnReject
    async fail(who: Color | void, error: string): Promise<void> {
        this.proc.stdin.write('FAIL\n');
        if (typeof who === 'undefined') {
            this.proc.stdin.write('2\n');
        } else {
            this.proc.stdin.write(`${who}\n`);            
        }
        this.proc.stdin.write(`${error}\n`);
        this.proc.stdin.end();
        this.terminateProcess(1000);
    }
    
    terminateProcess(delay: number = 0) {
        let proc = this.proc;
        if (delay == 0) {
            proc.kill();
        } else {
            setTimeout(() => { proc.kill(); }, delay);            
        }
    }
}
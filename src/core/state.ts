import {Color, another} from "./color"
import {Board} from "./board"
import {Rule} from "./rule"
import {dirs3d} from "./util"

export interface Link {
    state: State;
    action: [number, number];
}

export class State {
    rule: Rule;
    color: Color;
    board: Board;
    prev: Link;
    constructor(rule: Rule) {
        this.rule = rule;
        this.color = rule.initialColor;
        this.board = new Board(rule.numRow, rule.numCol);
        for (const [row, col] of this.board.keys2d()) {
            for (const color of rule.cells[row][col]) {
                this.board.push(row, col, color);
            }
        }
    }

    clone(): State {
        const newState = new State(this.rule);
        newState.color = this.color;
        newState.board = this.board.clone();
        newState.prev = this.prev;
        return newState;
    }

    canPut(row: number, col: number): boolean {
        return this.board.contains2d(row, col)
            && this.board.numLayer(row, col) < this.rule.maxLayer;
    }

    canPutAny(): boolean {
        for (let [row, col] of this.board.keys2d()) {
            if (this.canPut(row, col)) return true;
        }
        return false;
    }

    put(row: number, col: number) {
        if (this.isGameOver()) {
            throw new Error("Game is over");
        }
        if (!this.canPut(row, col)) {
            throw new Error(`Can not put at ${row} ${col}`);
        }
        this.prev = {
            state: this.clone(),
            action: [row, col]
        };
        this.board.push(row, col, this.color);
        this.color = another(this.color);
    }

    winner(): Color|void {
        for (let [row, col, layer] of this.board.keys3d()) {
            for (let [drow, dcol, dlayer] of dirs3d()) {
                const color = this.board.get(row, col, layer);
                let r = row, c = col, l = layer, count = 0;
                while (this.board.contains3d(r, c, l) && this.board.get(r, c, l) === color) {
                    count++;
                    r += drow, c += dcol, l += dlayer;
                }
                if (count >= this.rule.requiredConnection) return color;
            }
        }
        return;
    }

    isGameOver(): boolean {
        if (!this.canPutAny() || typeof this.winner() !== "undefined") {
            return true;
        } else {
            return false;
        }
    }
}

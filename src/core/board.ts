import {Color} from "./color"

export class Board {
    private _numRow: number;
    private _numCol: number;
    private _stacks: Color[][][];
    constructor(numRow: number, numCol: number) {
        this._numRow = numRow;
        this._numCol = numCol;
        this._stacks = Array<Color[][]>(numRow);
        for (let row = 0; row < numRow; row++) {
            this._stacks[row] = Array<Color[]>(numCol);
            for (let col = 0; col < numCol; col++) {
                this._stacks[row][col] = Array<Color>();
            }
        }
    }

    clone(): Board {
        const newBoard = new Board(this.numRow(), this.numCol());
        for (let [row, col] of this.keys2d()) {
            newBoard._stacks[row][col] = [].concat(this._stacks[row][col]);
        }
        return newBoard;
    }

    numRow(): number {
        return this._numRow;
    }

    numCol(): number {
        return this._numCol;
    }

    numLayer(row: number, col: number): number {
        if (!this.contains2d(row, col)) {
            throw new Error("index out of bounds");
        }
        return this._stacks[row][col].length;
    }

    contains2d(row: number, col: number): boolean {
        return 0 <= row && row < this._numRow
        && 0 <= col && col < this._numCol;
    }

    contains3d(row: number, col: number, layer:number): boolean {
        return this.contains2d(row, col)
               && 0 <= layer && layer < this._stacks[row][col].length;
    }

    push(row: number, col: number, color: Color) {
        if (!this.contains2d(row, col)) {
            throw new Error("index out of bounds");
        }
        this._stacks[row][col].push(color);
    }

    get(row: number, col: number, layer: number): Color {
        if (!this.contains3d(row, col, layer)) {
            throw new Error("index out of bounds");
        }
        return this._stacks[row][col][layer];
    }

    *keys2d(): Iterable<[number, number]> {
        for (let row = 0; row < this._numRow; row++) {
            for (let col = 0; col < this._numCol; col++) {
                yield [row, col];
            }
        }
    }

    *keys3d(): Iterable<[number, number, number]> {
        for (let [row, col] of this.keys2d()) {
            for (let layer = 0; layer < this._stacks[row][col].length; layer++) {
                yield [row, col, layer];
            }
        }
    }
}

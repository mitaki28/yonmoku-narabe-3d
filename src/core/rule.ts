import {Color, another} from "./color"
import {Board} from "./board"

export interface Rule {
    initialColor: Color;
    numRow: number;
    numCol: number;
    cells: Color[][][];
    maxLayer: number;
    requiredConnection: number;
}

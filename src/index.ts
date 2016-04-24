import {Color} from "./core/color"
import {Board} from "./core/board"

import {Server} from "./driver/server"
import {ConsolePlayer} from "./driver/console"



if (require.main === module) {
    let initialBoard = new Board(4, 4);
    initialBoard.push(0, 0, Color.Black);
    initialBoard.push(0, 3, Color.White);
    initialBoard.push(3, 0, Color.White);
    initialBoard.push(3, 3, Color.Black);
    new Server(new ConsolePlayer, new ConsolePlayer).start({
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
}

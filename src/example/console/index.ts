import {Color} from "../../core/color"
import {Rule} from '../../core/rule'
import {ConsolePlayer} from "../../driver/console"
import {Server} from "../../driver/server"


let blackPlayer = new ConsolePlayer;
let whitePlayer = new ConsolePlayer;    
new Server(blackPlayer, whitePlayer).start({
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
    

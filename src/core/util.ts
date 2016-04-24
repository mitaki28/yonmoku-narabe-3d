export function* dirs3d(): Iterable<[number, number, number]> {
    for (let drow = -1; drow <= 1; drow++) {
        for (let dcol = -1; dcol <= 1; dcol++) {
            for (let dlayer = -1; dlayer <= 1; dlayer++) {
                if (drow == 0 && dcol == 0 && dlayer == 0) continue;
                yield [drow, dcol, dlayer];
            }
        }
    }
}

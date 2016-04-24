
export const enum Color { Black, White }

export function another(color: Color): Color {
    return (color == Color.Black ? Color.White : Color.Black);
}

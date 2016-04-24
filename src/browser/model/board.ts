import * as three from "three.js"
import {Poll} from "./poll";
import {Stone} from "./stone";
import {Ground} from "./ground";


export class Grid extends three.Object3D {
    maxLayer: number;
    poll: Poll;
    ground: Ground;
    constructor(maxLayer: number) {
        super();
        this.maxLayer = maxLayer;
        
        this.poll = new Poll;
        this.poll.height = maxLayer;
        this.poll.radius = 0.1;
        this.poll.position.y = maxLayer / 2;
        this.add(this.poll);
        
        this.ground = new Ground;
        this.ground.scale.set(1, 0.1, 1);
        this.ground.position.y -= 0.1 / 2;
        this.add(this.ground);
    }
    
    layerToY(layer: number): number {
        return (this.ground.position.y + this.ground.scale.y / 2 + layer + 0.5) * this.scale.y + this.position.y;
    }
}

export class BoardBase extends three.Object3D {
	
	numRow: number;
	numCol: number;
    maxLayer: number;
	grids: Grid[][];

	constructor(numRow: number, numCol: number, maxLayer: number) {
		super();
		this.numRow = numRow;
		this.numCol = numCol;
        this.maxLayer = maxLayer;
		
		this.grids = new Array<Array<Grid>>();
		const xmin = -numRow / 2;
		const zmin = -numCol / 2;
		for (let row = 0; row < numRow; row++) {
			this.grids.push(new Array<Grid>());
			for (let col = 0; col < numCol; col++) {
                const grid = new Grid(maxLayer);
                grid.position.x = xmin + row;
                grid.position.z = zmin + col;
				this.grids[row].push(grid);
				this.add(grid);
			}
		}
	}
	
	grid(row:number, col: number): Grid {
		return this.grids[row][col];
	}
	
	indexOf(item: three.Object3D): [number, number] {
		for (let row = 0; row < this.numRow; row++) {
			for (let col = 0; col < this.numCol; col++) {
				if (this.grids[row][col].poll.mesh === item) return [row, col];
			}
		}
		return null;
	}
	
	*values(): Iterable<three.Mesh> {
		for (let row = 0; row < this.numRow; row++) {
			for (let col = 0; col < this.numCol; col++) {
				yield this.grids[row][col].poll.mesh;
			}
		}
	}
}
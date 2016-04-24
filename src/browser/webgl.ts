import * as three from 'three.js'

import {Color, another} from '../core/Color'
import {Rule} from '../core/Rule'
import {State} from '../core/State'
import {dirs3d} from '../core/util'
import {StatefulPlayer, StatefulObserver} from '../driver/client'
import {sleep} from '../util';

import {BoardBase as BoardBaseModel} from './model/board'
import {Stone as StoneModel} from './model/stone'
import {TrackballControls} from './lib/trackballcontrol' 



export function waitForAnimationFrame(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        window.requestAnimationFrame(() => {
            resolve();
        });
    });
}

export function waitForEvent(element: Element, names: Array<string>): Promise<Event> {
    return new Promise((resolve) => {
        let listener = (ev: Event) => {
            for (let name of names) {
                element.removeEventListener(name, listener);
            }
            resolve(ev);
        };
        for (let name of names) {
            element.addEventListener(name, listener);
        }
    });
}

export class BoardModel extends three.Object3D {
	
	numRow: number;
	numCol: number;
    maxLayer: number;
    base: BoardBaseModel; 
	stones: StoneModel[][][];
    guide: three.Object3D;

	constructor(numRow: number, numCol: number, maxLayer: number) {
		super();
		this.numRow = numRow;
		this.numCol = numCol;
        this.maxLayer = maxLayer;
		
		this.base = new BoardBaseModel(numRow, numCol, maxLayer);
        this.add(this.base);
        this.stones = new Array<StoneModel[][]>(numRow);
        for (let row = 0; row < numRow; row++) {
            this.stones[row] = new Array<StoneModel[]>(numCol);
            for (let col = 0; col < numCol; col++) {
                this.stones[row][col] = new Array<StoneModel>();
            }
        }
	}
    
    positionAt(row: number, col: number, layer: number): three.Vector3 {
        const grid = this.base.grid(row, col);
        return new three.Vector3(grid.position.x, grid.layerToY(layer), grid.position.z);
    }
    
    makeStoneAt(row: number, col: number, layer: number, color: Color) {
        const stone = new StoneModel(color == Color.Black ? 0x000000 : 0xffffff);
        stone.radius = 0.3;
        let pos = this.positionAt(row, col, layer);
        stone.position.set(pos.x, pos.y, pos.z);
        return stone;     
    }
        
    push(row: number, col: number, color: Color, dry: boolean = false): StoneModel {
        const layer = this.stones[row][col].length;
        const stone = this.makeStoneAt(row, col, layer, color);
        if (!dry) {
            this.stones[row][col].push(stone);
            this.add(stone);
        }
        return stone;
    }
}


export class WebGLObserver extends StatefulObserver {

    screenSize: three.Vector2;
    camera: three.Camera;
    //light: three.Light;
    scene: three.Scene;
    renderer: three.WebGLRenderer;
    control: any;

    board: BoardModel;
    stones: StoneModel[][][];

    constructor(screenHeight: number, screenWidth: number) {
        super();
        this.screenSize = new three.Vector2(screenWidth, screenHeight);
        this.renderer = new three.WebGLRenderer();
        this.renderer.setSize(screenWidth, screenHeight);
        this.renderer.setClearColor(0xaaaaaa);
    }

    player(): WebGLSharedPlayer {
        return new WebGLSharedPlayer(this);
    }

    async onInit(rule: Rule): Promise<void> {
        const numRow = this.state.rule.numRow;
        const numCol = this.state.rule.numCol;
        const maxLayer = this.state.rule.maxLayer;

        this.camera = new three.PerspectiveCamera(750, this.screenSize.x / this.screenSize.y, 1, 10000);
        this.camera.position.z = 750;
        this.camera.position.y = 750;
        this.camera.rotation.x = -Math.PI / 4;


        this.scene = new three.Scene();
        
        let light = new three.DirectionalLight(0xffffff, 1.0);
        light.position.set(0, 1, 0);
        this.scene.add(light);
        let dlight = new three.DirectionalLight(0xffffff, 0.5);
        light.position.set(0.5, -1, 0.5);
        this.scene.add(dlight);

        this.board = new BoardModel(numRow, numCol, maxLayer);
        for (let [row, col] of this.state.board.keys2d()) {
            for (let layer = 0; layer < this.state.board.numLayer(row, col); layer++) {
                this.board.push(row, col, this.state.board.get(row, col, layer));
            }
        }
        this.board.scale.set(100, 100, 100);
        this.scene.add(this.board);
        this.control = new TrackballControls(this.camera);
    }


	
    makeGuildLine(row: number, col: number, layer: number, drow: number, dcol: number, dlayer: number): three.Line|void {
    	let s = this.board.positionAt(row, col, layer);
        let ct = 0;
        let color = this.state.board.get(row, col, layer);
    	while (this.state.board.contains3d(row, col, layer)
                && this.state.board.get(row, col, layer) === color) {
    		row += drow;
    		col += dcol;
            layer += dlayer;
            ct++;
    	}
        row -= drow, col -= dcol, layer -= dlayer;
        if (ct < this.state.rule.requiredConnection) return;
    	let t = this.board.positionAt(row, col, layer);
    	let geo = new three.Geometry;
    	geo.vertices.push(s, t);
    	let mat = new three.LineDashedMaterial({
    		linewidth: 10,
    		color: 0xff0000, 
    	});
    	return new three.Line(geo, mat);	
    }
    
    *makeGuideLines(row: number, col: number, layer: number): IterableIterator<three.Line> {
    	for (let [drow, dcol, dlayer] of dirs3d()) {
            let line = this.makeGuildLine(row, col, layer, drow, dcol, dlayer);
            if (line instanceof three.Line) {
                yield line;
            }
    	}
    }
	

    async onRecv(row: number, col: number): Promise<void> {
        let stone = this.board.push(row, col, this.state.color);
        let frame = 30;
        let f = 8;
        let t = stone.position.y;
        let delta = (t - f) / frame;
        stone.position.y = f;
        for (let d = 0; d < frame; d++) {
            stone.position.y += delta;
            await sleep(10);
        }
    }
    
    async onFinish(winner: Color|void): Promise<void> {
        if (this.board.guide != null) {
            this.board.remove(this.board.guide);
            this.board.guide = null;
        }
        this.board.guide = new three.Object3D;
        this.board.add(this.board.guide);
        for (let [row, col, layer] of this.state.board.keys3d()) {
            for (let line of this.makeGuideLines(row, col, layer)) {
                this.board.guide.add(line);
            }
        }
    }    

    async animate(): Promise<void> {
        for (; ;) {
            await waitForAnimationFrame();
            if (!this.scene || !this.camera) continue;
            this.renderer.render(this.scene, this.camera);
            this.control.update();
        }
    }


    pointedObjects(ev: MouseEvent, objects: three.Object3D[]): three.Intersection[] {
        const bb = this.renderer.domElement.getBoundingClientRect();
        const x = ev.clientX - bb.left;
        const y = ev.clientY - bb.top;
        const width = bb.width;
        const height = bb.height;
        let v = new three.Vector2(
            2 * (x / width) - 1,
            1 - 2 * (y / height)
        );
        let raycaster = new three.Raycaster();
        raycaster.setFromCamera(v, this.camera);
        return raycaster.intersectObjects(objects);
    }
}

class WebGLSharedPlayer extends StatefulPlayer {

    parent: WebGLObserver;

    constructor(parent: WebGLObserver) {
        super();
        this.parent = parent;
    }

    async handle(): Promise<[number, number]> {
        for (; ;) {
            let ev = await waitForEvent(this.parent.renderer.domElement, ['mousemove', 'click']);
            if (this.parent.board.guide != null) {
                this.parent.board.remove(this.parent.board.guide);
                this.parent.board.guide = null;
            }
            if (ev instanceof MouseEvent) {
                let intersections = this.parent.pointedObjects(ev, Array.from(this.parent.board.base.values()));
                if (intersections.length == 0) continue;
                let obj = intersections[0].object;
                const [row, col] = this.parent.board.base.indexOf(obj);
                if (!this.state.canPut(row, col)) continue;
                if (ev.type == 'mousemove') {
                    console.log('hoge');
                    this.parent.board.guide = new three.Object3D;
                    let stone = this.parent.board.push(row, col, this.state.color, true);
                    console.log(stone);
                    // for (let line of this.parent.makeGuideLines(row, col, this.game.state.color)) {
                    //     this.parent.guide.add(line);
                    // }
                    this.parent.board.guide.add(stone);
                    this.parent.board.add(this.parent.board.guide);
                } else if (ev.type == 'click') {
                    if (this.state.canPut(row, col)) {
                        return <[number, number]>[row, col];
                    }
                }
            }
        }
    }

}
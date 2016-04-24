import * as three from "three.js"

export class Poll extends three.Object3D {

    mesh: three.Mesh;

	constructor() {
		super();
		let geometry = new three.CylinderGeometry(0.5, 0.5, 1, 32);
		let mat = new three.MeshPhongMaterial({ color: 0xdddddd });
		this.mesh = new three.Mesh(geometry, mat);
		this.add(this.mesh);
	}
    
    set radius(r : number) {
        this.scale.x = r;
        this.scale.z = r;
    }
    
    get radius(): number {
        return this.scale.x;
    }
    
    set height(h: number) {
        this.scale.y = h;
    } 
    
    get height(): number {
        return this.scale.y;
    }    
    
}
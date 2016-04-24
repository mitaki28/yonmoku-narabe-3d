import * as three from "three.js"

export class Stone extends three.Object3D {

	constructor(color: number) {
		super();
		let geometry = new three.SphereGeometry(1, 32, 32);
		let mat = new three.MeshPhongMaterial({ color: color });
		let mesh = new three.Mesh(geometry, mat);
		this.add(mesh);
	}
    
    set radius(r : number) {
        this.scale.x = r;
        this.scale.y = r;
        this.scale.z = r;
    }
    
    get radius(): number {
        return this.scale.x;
    }
}
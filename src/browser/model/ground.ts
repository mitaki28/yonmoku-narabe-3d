import * as three from "three.js"

export class Ground extends three.Object3D {

	constructor() {
		super();
		let geometry = new three.CubeGeometry(1, 1, 1);
		let mat = new three.MeshBasicMaterial({ color: 0x335533 });
		let mesh = new three.Mesh(geometry, mat);
		this.add(mesh);
	}
    
}
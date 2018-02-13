$(document).ready(function() {
	$('#loading').hide();
})

var panoTexture;
var container, renderer, scene, camera, mesh, fov = 45;
var start = Date.now();

var orbs;

var color_plane, color_mat;

window.addEventListener( 'load', init );

function init() {

	container = document.getElementById( 'container' );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 100;
	camera.position.y = 00;
	camera.target = new THREE.Vector3( 0, 0, 0 );

	scene.add( camera );

	panoTexture = new THREE.TextureLoader().load( 'assets/ocean.jpg' );

	var sphere = new THREE.Mesh( new THREE.SphereGeometry( 1000, 60, 60 ), new THREE.MeshBasicMaterial( { map: panoTexture } ) );
	sphere.scale.x = -1;
	sphere.doubleSided = true;
	scene.add( sphere );
	
	var n_orbs = 20;
	var orb_parent = new THREE.Object3D();
	orbs = []
	for (var i = 0; i < n_orbs; i++) {
		//var orb = init_mirror( 30,5,0,2 )
		var theta =  i * 2 * Math.PI / n_orbs
		var x = 30  * Math.sin( theta ) 
		var y = 30 * Math.cos( theta ) 
		//var orb = init_orb( x,5,y,2 )
		var orb = init_mirror( x,5,y,6,6 )
		
		orbs.push( orb )
		
		/*	
		var pivot = new THREE.Object3D();
		pivot.add(orb)
		pivot.rotation.y = theta
		*/
		orb_parent.add(orb)
	}
	orb_parent.rotation.x += 0 
	scene.add(orb_parent)

	//black backdrop
	var geometry = new THREE.PlaneGeometry( 200, 200, 1,1 );
	var plane_material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, plane_material );
	plane.position.z = -30;
	scene.add( plane );

	//scene base
	var geometry = new THREE.CylinderGeometry( 20, 20, 1, 32 ); 
	var white_material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
	var base = new THREE.Mesh( geometry, white_material );
	base.position.y = -20;
	//base.rotation.x += Math.PI * .5 
	scene.add( base );

	//trunk
	var geometry = new THREE.CylinderGeometry( 2, 2, 30, 32 ); 
	var white_material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
	var base = new THREE.Mesh( geometry, white_material );
	base.position.y = -5;
	//base.rotation.x += Math.PI * .5 
	scene.add( base );

	//puff
	var mesh = new THREE.Mesh( new THREE.IcosahedronGeometry( 20, 5 ), white_material );
	mesh.position.x = 0;
	mesh.position.y = 10;
	mesh.position.z = 0;
	scene.add( mesh );

	
	// tree
	/*
	var loader = new THREE.OBJLoader();
	// load a resource
	loader.load(
		// resource URL
		'assets/objs/tree.obj',
		// called when resource is loaded
		function ( object ) {
			var tree = new THREE.Mesh( object.geometry, white_material )
			scene.add( object );
		}
	);
	*/

	// Pulse Plane
	var geometry = new THREE.PlaneGeometry( 200, 200, 1,1 );
	color_mat = new THREE.MeshBasicMaterial( {transparent: true, opacity:0.1, color: 0xffffff, side: THREE.DoubleSide} );
	color_plane = new THREE.Mesh( geometry, color_mat );
	color_plane.position.z = -10;
	scene.add( color_plane );

	renderer = new THREE.WebGLRenderer( {antialias:true, alpha:true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	container.appendChild( renderer.domElement );

	var controls = new THREE.OrbitControls( camera, renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	render();

}

function world_position(object) {
	var position = new THREE.Vector3();
	position.setFromMatrixPosition( object.matrixWorld );
	return position
}

function init_mirror(x,y,z,w,h) {
	var geometry = new THREE.PlaneGeometry( w, h, 1,1 );
	material = new THREE.ShaderMaterial( {

		uniforms: {
			tShine: { type: "t", value: panoTexture },
			time: { type: "f", value: 10 },
			weight: { type: "f", value: 0 }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		side:THREE.DoubleSide,
	} );
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;
	
	scene.add( mesh );
	return mesh
}

function init_orb(x,y,z,r) {
	material = new THREE.ShaderMaterial( {

		uniforms: {
			tShine: { type: "t", value: panoTexture },
			time: { type: "f", value: 0 },
			weight: { type: "f", value: 0 }
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
	} );
	
	mesh = new THREE.Mesh( new THREE.IcosahedronGeometry( r, 5 ), material );
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;
	
	scene.add( mesh );

	return mesh;
}

function onWindowResize() {
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}

var start = Date.now();
var portName = '1 /dev/cu.usbmodem1421';
var in_data = -1;
var ppl = init_population();

var words = [
	'hellooo dearie',
	"it's been a while",
	'yes',
]

var pulse_vx = 0;
var pulse_decay = 0.9;
var pulse_f = .03; 
var pulse_max = 1.0;

var finger_down = false;

var t_down = 0;
var mag = 0.1;

var in_data = 0;

$(document).mousedown( function() {
	finger_down = true;
})

$(document).mouseup(function() {
	finger_down = false;
})

function render() {

	//$('#pop').html(current_formatted(ppl));
	
	
	var t = Date.now() - start;

	material.uniforms[ 'time' ].value = .00025 * t ;
	material.uniforms[ 'weight' ].value = 0;
	
	//update_pulse()	
	color_mat.opacity = pulse_vx;

	renderer.render( scene, camera );
	requestAnimationFrame( render );

	for (var i=0; i < orbs.length; i++) {
		orbs[i].lookAt( camera.position )
		//orbs[i].rotation.y += 0 
		orbs[i].lookAt( new THREE.Vector3( 0,5,0) )
	}

}

function update_pulse() {
	pulse_vx *= pulse_decay;
	if (finger_down) {
		pulse_vx += pulse_f;
		mag *= .99;
	}
	if (pulse_vx > pulse_max) pulse_vx = pulse_max;
	if (pulse_vx < 0) pulse_vx = 0;
}

function scale(val, min, max) {
	// to 0 , 1
	return (val - min) / (max-min)
}

function sum(arr) {
	var total = 0;
	for (var i =0; i < arr.length; i++) {
		total += arr[i];	
	}
	return total 
}


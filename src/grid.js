import {Scene, Geometry, Vector3, LineBasicMaterial, Line, LinePieces, LineSegments} from 'three'

/**
 *
 * @param {Scene} scene
 * @param {number} x1
 * @param {number} x2
 * @param {number} dx
 * @param {number} z1
 * @param {number} z2
 * @param {number} dz
 * @param {number} y
 * @param {object} options
 */
export let addGrid = function(scene, x1, x2, dx, y1, y2, dy, z, options) {

  var geometry = new Geometry()

  // Lines of constant x
  for (let x=x1; x<=x2; x+=dx) {
    geometry.vertices.push( new Vector3( x, y1, z) );
    geometry.vertices.push( new Vector3( x, y2, z) );
  }
  for (let y=y1; y<=y2; y+=dy) {
    geometry.vertices.push( new Vector3( x1, y, z) );
    geometry.vertices.push( new Vector3( x2, y, z) );
  }
  var material = new LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

  var line = new LineSegments( geometry, material );
  line.type = LinePieces;
  scene.add( line );

}
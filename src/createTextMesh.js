import {TextGeometry} from 'three'
import {MeshFaceMaterial} from 'three'
import {MeshPhongMaterial} from 'three'
import {MultiMaterial} from 'three'
import {GeometryUtils} from 'three'
import {Mesh} from 'three'
import {FlatShading} from 'three'
import {SmoothShading} from 'three'
// import {typeface_js} from 'three'
// var typeface = require('three.regular.helvetiker');
// typeface_js.loadFace(typeface);
import {FontLoader} from 'three'
//import {Matrix4} from 'three'
//import {GeometryUtils as GeoUtils} from 'threex'

var fontMap = {
  "helvetiker"  : 0,
  "optimer"  	  : 1,
  "gentilis" 	  : 2,
  "droid sans"  : 3,
  "droid serif" : 4
};

var weightMap = {
  "normal"	: 0,
  "bold"		: 1
}

export let createTextMesh = function (text, options) {
  let textGeo = new TextGeometry( text, options )
  textGeo.scale(options.scale, options.scale, options.scale)

  textGeo.computeBoundingBox();
  textGeo.computeVertexNormals();

  // "fix" side normals by removing z-component of normals for side faces
  // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

  if ( ! options.bevelEnabled ) {

    var triangleAreaHeuristics = 0.1 * ( options.height * options.size );

    for ( var i = 0; i < textGeo.faces.length; i ++ ) {

      var face = textGeo.faces[ i ];

      if ( face.materials[ 0 ].id == options.textMaterialSide.id ) {

        for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
          face.vertexNormals[ j ].z = 0;
          face.vertexNormals[ j ].normalize();
        }

        var va = textGeo.vertices[ face.a ].position;
        var vb = textGeo.vertices[ face.b ].position;
        var vc = textGeo.vertices[ face.c ].position;
        var s = GeometryUtils.triangleArea( va, vb, vc );

        if ( s > triangleAreaHeuristics ) {
          for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
            face.vertexNormals[ j ].copy( face.normal );
          }
        }
      }
    }
  }

  //var centerOffset = -0.5 * ( textGeo.boundingBox.x[ 1 ] - textGeo.boundingBox.x[ 0 ] );
  var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

  const textMesh = new Mesh( textGeo, options.faceMaterial );

  textMesh.position.x = centerOffset;
  textMesh.position.z = options.hover;
  // textMesh.position.y = 4;
  textMesh.position.y = options.depthOffset;

  textMesh.rotation.y = 0;
  textMesh.rotation.x = Math.PI / 2;

  return textMesh

}

let callTextMesh = function (font) {

  let material = new MultiMaterial( [
    new MeshPhongMaterial( { color: 0xffffff, shading: FlatShading } ), // front
    new MeshPhongMaterial( { color: 0xffffff, shading: SmoothShading } ) // side
  ] );

  const text = 'Three.js Rotation';
  const options = {
    size: 70,
    height: 20,
    scale: 0.04,
    // hover: 30,
    hover: 1.5,
    depthOffset: 10,
    curveSegments: 4,
    bevelThickness:2,
    bevelSize:1.5,
    bevelSegments:3,
    bevelEnabled:true,
    bend:false,

    //font: "optimer",  // helvetiker, optimer, gentilis, droid sans, droid serif
    font: font,
    weight: "normal",		// normal bold
    style: "normal",		// normal italic
    //material: new MeshPhongMaterial( { color: 0xEE7600, shading: FlatShading } ),
    //material: material,
    material: 0,
    faceMaterial: material,
    groupMaterial: new MeshPhongMaterial( { color: 0xEE7600, shading: FlatShading } ),
    //extrudeMaterial: new MeshPhongMaterial( { color: 0xCD853F, shading: SmoothShading } ),
    extrudeMaterial: 1,
    textMaterial: new MeshPhongMaterial( { color: 0xffffff, shading: SmoothShading } )
  }

  return createTextMesh(text, options)

}

export let addTextMesh = function() {
  return new Promise((res, rej) => {
    var loader = new FontLoader();
    //var fontFile = 'fonts/helvetiker_regular.typeface.js'
    var fontFile = 'fonts/optimer_regular.typeface.js'
    loader.load( fontFile, function ( font ) {
      console.log('font loaded')
      const textMesh = callTextMesh(font)
      res(textMesh)
    })
  })
}

// http://express/threejs/www/index.html

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshBasicMaterial,
  MultiMaterial,
  BoxBufferGeometry,
  Mesh,
  Object3D,
  EdgesHelper,
  Vector3,
  Matrix4
} from 'three';

import {addPointLight} from './lights'
import {randomizePointLight} from './lights'
import {addDirectionalLight} from './lights'
import {addFog} from './lights'
import {addGrid} from './grid'
import {addTextMesh} from './createTextMesh'
import {setResizeHandler} from './resize'

const scene = setupScene();
const camera = setupCamera();
const renderer = setupRenderer();
addObjectsAndRender({scene, renderer});

function setupScene() {
  const scene = new Scene();
  let pointLight = addPointLight(scene)
  randomizePointLight(pointLight)
  addDirectionalLight(scene)
  addFog(scene)
  return scene;
}

function setupCamera() {
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0,-8,8);
  camera.up = new Vector3(0,0,1);
  camera.lookAt(new Vector3(0,0,0));
  return camera;
}

function setupRenderer() {
  const renderer = new WebGLRenderer({alpha: true});
  renderer.setClearColor(0xdddddd, 0.2);
  renderer.setSize(window.innerWidth, window.innerHeight);
  setResizeHandler(camera, renderer)
  document.body.appendChild(renderer.domElement);
  return renderer;
}

async function addObjectsAndRender({scene, renderer}) {
  addGrid(scene, -5, 5, 1, -5, 5, 1, 0, null)
  /*
   * Wait for font to load
   */
  const textMesh = await addTextMesh();
  scene.add(textMesh)

  /*
   * The 3D shape has it origin at the center.
   * Set the group position so the bottom of the shape is at z = 0.
   */
  const width = 1;
  const depth = 4;
  const height = 1;
  let group = createCuboid({width, depth, height});
  group.position.set(0, 0, depth / 2);
  scene.add(group);

  const rotationPoint = new Vector3(0, 0, 4);
  const axis = new Vector3(0, 1, 0);
  const angle = -Math.PI / 8;
  const rotationMatrix = createRotationMatrix({point: rotationPoint, axis, angle})

  /*
   * Rotate cuboid at a specified interval, to emphasize rotation point
   */
  let time0 = new Date().getTime();
  let time;
  const deltaSec = 0.5;
  const deltaMs = deltaSec * 1000;
  function render(){
    time = new Date().getTime();
    if ((time - time0) > deltaMs) {
      time0 = time;
      applyRotationMatrix(group, rotationMatrix);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
}

function createCuboid({width, height, depth, materials, edgeHex}) {

  if (!Array.isArray(materials) || materials.length !== 6) {
    materials = [
      new MeshBasicMaterial({color: 0xff0000}), // right
      new MeshBasicMaterial({color: 0x0000ff}), // left
      new MeshBasicMaterial({color: 0x00ff00}), // top
      new MeshBasicMaterial({color: 0xffff00}), // bottom
      new MeshBasicMaterial({color: 0x00ffff}), // back
      new MeshBasicMaterial({color: 0xff00ff})  // front
    ];
  }

  var cubeSidesMaterial = new MultiMaterial(materials);
  var cubeGeometry = new BoxBufferGeometry(width, height, depth, 1, 1, 1);
  var cube = new Mesh(cubeGeometry, cubeSidesMaterial);

  let group = new Object3D()
  let edgeValue = 0x333333;
  if (edgeHex && edgeHex[0] === '#') {
    edgeValue = parseInt(edgeHex.slice(1), 16)
  }
  let edges = new EdgesHelper(cube, edgeValue);
  edges.material.linewidth = 2
  group.add(cube)
  group.add(edges)
  return group
}

/**
 * To rotate an object about a given point:
 * 1. translate the object to that point
 * 2. rotate the object
 * 3. translate object back to the original point
 *
 * These 3 operations are combined into a single matrix so it can be
 * repeatedly called in an animation loop, saving significant computation time.
 *
 * @param {Object3D} object3D
 * @param {Vector3} point
 * @param {Vector3} axis
 * @param {number} angle
 * @returns {Matrix4}
 */
function createRotationMatrix({object3D, point, axis, angle}) {

  axis.normalize();

  var matrix_t1 = new Matrix4();
  matrix_t1.makeTranslation(-point.x, -point.y, -point.z);
  var matrix_r = new Matrix4();
  matrix_r.makeRotationAxis(axis, angle);
  var matrix_t2 = new Matrix4();
  matrix_t2.makeTranslation(point.x, point.y, point.z);

  // Multiply matrices in the reverse order
  matrix_r.multiply(matrix_t1);
  matrix_t2.multiply(matrix_r);
  return matrix_t2;
}

function applyRotationMatrix (object3D, rotationMatrix) {
  object3D.applyMatrix(rotationMatrix);
}

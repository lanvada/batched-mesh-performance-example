import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  type BatchedMesh,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Method, initMesh } from './utils';

const MAX_GEOMETRY_COUNT = 200000;

const guiOptions: {
  method: string;
  count: number;
  sortObjects: boolean;
  perObjectFrustumCulled: boolean;
} = {
  count: 200000,
  method: Method.BATCHED,
  sortObjects: true,
  perObjectFrustumCulled: true,
};

//create a three.js renderer
const container = document.getElementById('app')!;
const renderer = new WebGLRenderer({
  antialias: true,
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
container.appendChild(canvas);
// add a stats panel
const stats = new Stats();
container.appendChild(stats.dom);
// create a three.js scene and a camera
const scene = new Scene();
scene.background = new Color(0x000000);
const camera = new PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000,
);
camera.position.z = 30;
scene.add(camera);
// add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
// gui
const gui = new GUI();
gui
  .add(guiOptions, 'count', 1, MAX_GEOMETRY_COUNT)
  .step(100)
  .onChange((value) => {
    initMesh(scene, guiOptions.method, value);
    if (guiOptions.method === Method.BATCHED) {
      scene.traverse((object: any) => {
        if ((object as BatchedMesh).isBatchedMesh) {
          object.sortObjects = guiOptions.sortObjects;
          object.perObjectFrustumCulled = guiOptions.perObjectFrustumCulled;
        }
      });
    }
  });
gui.add(guiOptions, 'method', Method).onChange((value) => {
  initMesh(scene, value, guiOptions.count);
  if (guiOptions.method === Method.BATCHED) {
    scene.traverse((object: any) => {
      if ((object as BatchedMesh).isBatchedMesh) {
        object.sortObjects = guiOptions.sortObjects;
        object.perObjectFrustumCulled = guiOptions.perObjectFrustumCulled;
      }
    });
  }
});
gui.add(guiOptions, 'sortObjects').onChange((value) => {
  scene.traverse((object: any) => {
    if ((object as BatchedMesh).isBatchedMesh) {
      object.sortObjects = value;
    }
  });
});
gui.add(guiOptions, 'perObjectFrustumCulled').onChange((value) => {
  scene.traverse((object: any) => {
    if ((object as BatchedMesh).isBatchedMesh) {
      object.perObjectFrustumCulled = value;
    }
  });
});

// handle window resize
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

render();
// render the scene
function render() {
  stats.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
initMesh(scene, Method.BATCHED, guiOptions.count);

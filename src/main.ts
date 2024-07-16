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
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

const MAX_GEOMETRY_COUNT = 200000;

const guiOptions: {
  useWebGPU: boolean;
  method: string;
  count: number;
  sortObjects: boolean;
  perObjectFrustumCulled: boolean;
} = {
  useWebGPU: false,
  count: 200000,
  method: Method.BATCHED,
  sortObjects: false,
  perObjectFrustumCulled: true,
};

const container = document.getElementById('app')!;
const { webGPURenderer, webGLRenderer, scene, camera, stats } = initScene();
webGLRenderer.setSize(container.offsetWidth, container.offsetHeight);
webGLRenderer.domElement.style.display = 'block';
webGPURenderer.domElement.style.display = 'none';
// gui
const gui = new GUI();
gui.add(guiOptions, 'useWebGPU').onChange((value) => {
  if (value) {
    webGPURenderer.setSize(container.offsetWidth, container.offsetHeight);
    webGLRenderer.domElement.style.display = 'none';
    webGPURenderer.domElement.style.display = 'block';
  } else {
    webGLRenderer.setSize(container.offsetWidth, container.offsetHeight);
    webGLRenderer.domElement.style.display = 'block';
    webGPURenderer.domElement.style.display = 'none';
  }
});
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
  const width = container.offsetWidth;
  const height = container.offsetWidth;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  webGPURenderer.setSize(width, height);
  webGLRenderer.setSize(width, height);
}

render();
// render the scene
function render() {
  if (guiOptions.useWebGPU) {
    webGPURenderer.render(scene, camera);
  } else {
    webGLRenderer.render(scene, camera);
  }
  stats.update();
  requestAnimationFrame(render);
}

initMesh(scene, Method.BATCHED, guiOptions.count);

function initScene(): {
  webGPURenderer: WebGPURenderer;
  webGLRenderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  stats: Stats;
} {
  //create a three.js renderer
  const container = document.getElementById('app')!;
  const webGPURenderer = new WebGPURenderer({
    antialias: true,
  });
  webGPURenderer.setSize(container.offsetWidth, container.offsetHeight);
  webGPURenderer.setPixelRatio(window.devicePixelRatio);
  const canvas1 = webGPURenderer.domElement;
  container.appendChild(canvas1);

  const webGLRenderer = new WebGLRenderer({
    antialias: true,
  });
  webGLRenderer.setSize(container.offsetWidth, container.offsetHeight);
  webGLRenderer.setPixelRatio(window.devicePixelRatio);
  const canvas2 = webGLRenderer.domElement;
  container.appendChild(canvas2);

  // add a stats panel
  const stats = new Stats();
  container.appendChild(stats.dom);
  // create a three.js scene and a camera
  const scene = new Scene();
  scene.background = new Color(0x000000);
  const camera = new PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000,
  );
  camera.position.z = 30;
  scene.add(camera);
  // add orbit controls
  const controls = new OrbitControls(camera, container);
  controls.target.set(0, 0, 0);
  return { webGPURenderer, webGLRenderer, scene, camera, stats };
}

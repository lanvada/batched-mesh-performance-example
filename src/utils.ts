import {
  BatchedMesh,
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  Euler,
  Matrix4,
  Mesh,
  MeshNormalMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Object3D,
  type Scene,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const Method = {
  BATCHED: 'BATCHED',
  MERGED: 'MERGED',
};

const position = new Vector3();
const rotation = new Euler();
const quaternion = new Quaternion();
const scale = new Vector3();
function randomizeMatrix(matrix: Matrix4): Matrix4 {
  position.x = Math.random() * 40 - 20;
  position.y = Math.random() * 40 - 20;
  position.z = Math.random() * 40 - 20;
  rotation.x = Math.random() * 2 * Math.PI;
  rotation.y = Math.random() * 2 * Math.PI;
  rotation.z = Math.random() * 2 * Math.PI;
  quaternion.setFromEuler(rotation);
  scale.x = scale.y = scale.z = 0.5 + Math.random() * 0.5;
  return matrix.compose(position, quaternion, scale);
}

export function initMesh(scene: Scene, method: string, count: number) {
  cleanup(scene);
  if (method === Method.BATCHED) {
    const batchedMesh = initBatchedMesh(initGeometries(), count);
    scene.add(batchedMesh);
  } else {
    const mergedMesh = initMergedMesh(initGeometries(), count);
    scene.add(mergedMesh);
  }
}

function cleanup(scene: Scene) {
  const children = [...scene.children];
  scene.clear();
  children.forEach((child: Object3D) => {
    if ((child as Mesh).isMesh) {
      (child as Mesh).geometry.dispose();
    }
  });
}

function initGeometries(): BufferGeometry[] {
  return [
    new ConeGeometry(1.0, 2.0),
    new BoxGeometry(2.0, 2.0, 2.0),
    new SphereGeometry(1.0, 16, 8),
  ];
}

function initBatchedMesh(
  geometries: BufferGeometry[],
  totalCount: number,
) {
  const geometryCount = totalCount;
  const vertexCount = geometries.length * 512;
  const indexCount = geometries.length * 1024;

  const matrix = new Matrix4();
  const mesh = new BatchedMesh(
    geometryCount,
    vertexCount,
    indexCount,
    new MeshNormalMaterial(),
  );

  // disable full-object frustum culling since all of the objects can be dynamic.
  mesh.frustumCulled = false;

  const geometryIds = [
    mesh.addGeometry(geometries[0]),
    mesh.addGeometry(geometries[1]),
    mesh.addGeometry(geometries[2]),
  ];

  for (let i = 0; i < geometryCount; i++) {
    const id = mesh.addInstance(geometryIds[i % geometryIds.length]);
    mesh.setMatrixAt(id, randomizeMatrix(matrix));
  }

  return mesh;
}

function initMergedMesh(
  geometries: BufferGeometry[],
  totalCount: number,
) {
  const geometryCount = totalCount;
  const matrix = new Matrix4();

  const tempGeometries = [];
  for (let i = 0; i < geometryCount; i++) {
    const geometry = geometries[i % geometries.length];
    const transform = randomizeMatrix(matrix);
    const newGeo = geometry.clone();
    newGeo.applyMatrix4(transform);
    tempGeometries.push(newGeo);
  }
  const geometry = mergeGeometries(tempGeometries, false);
  const mesh = new Mesh(geometry, new MeshNormalMaterial());

  return mesh;
}

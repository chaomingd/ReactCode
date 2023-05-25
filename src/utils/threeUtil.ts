import * as THREE from 'three';

export function disposeMesh(mesh: THREE.Mesh | THREE.Line) {
  if (!mesh) return;
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }
  if (mesh.material) {
    if (mesh.material instanceof Array) {
      mesh.material.forEach((mt) => {
        mt.dispose();
      });
    } else {
      mesh.material.dispose();
    }
  }
}

type TThreeObject = THREE.Object3D | THREE.Mesh;

export function disposeScene(scene: THREE.Scene | TThreeObject) {
  function worker(children: TThreeObject[]) {
    children &&
      children.forEach((item) => {
        if (item instanceof THREE.Object3D) {
          worker(item.children);
        } else {
          disposeMesh(item);
        }
      });
  }
  worker(scene.children);
}

<template>
  <div class="glitter">
    <canvas id="canvas" class="canvas" width="600" height="400"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import vertexShader from "../shader/vertexShader.vert";
import fragmentShader from "../shader/fragmentShader.frag";
// import glitter from "../js/glitter";

export default {
  name: "Glitter",
  data: () => {
    const scene = new THREE.Scene();
    const renderer = null;
    const camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
    const light = new THREE.AmbientLight(0x404040);
    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() }
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms
    });

    const cube = new THREE.Mesh(geometry, material);
    return {
      scene,
      renderer,
      camera,
      light,
      geometry,
      material,
      uniforms,
      cube
    };
  },
  mounted() {
    const _canvas = document.getElementById("canvas");
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: _canvas
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uniforms.resolution.value.x = this.renderer.domElement.width;
    this.uniforms.resolution.value.y = this.renderer.domElement.height;

    this.camera.position.set(0, 0, 2);
    this.light.position.set(0, 0, 10);
    this.scene.add(this.cube);
    this.scene.add(this.light);

    this.animate();

    window.addEventListener("resize", this.onResize);
  },
  methods: {
    animate() {
      requestAnimationFrame(this.animate);

      this.uniforms.time.value += 0.01;

      this.renderer.render(this.scene, this.camera);
    },
    onResize() {
      //レスポンシブ 対応
      //windowのサイズを取得
      const width = window.innerWidth;
      const height = window.innerHeight;

      //レンダラーのサイズを調整
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);

      // カメラのアスペクト比を正す
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  }
};
</script>

<style scoped lang="scss"></style>

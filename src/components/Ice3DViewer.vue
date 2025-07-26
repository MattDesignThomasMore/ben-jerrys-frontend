<template>
  <div ref="container" class="three-container"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Color
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default {
  name: 'Ice3DViewer',
  props: {
    flavor: String,
    sprinkleColor: String
  },
  setup(props) {
    const container = ref(null);
    let scene, camera, renderer, controls;
    let iceMesh = null;

    const sprinkleMeshes = {
      Geel: null,
      Blauw: null,
      Groen: null
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const onResize = () => {
      if (!container.value) return;
      camera.aspect = container.value.clientWidth / container.value.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    };

    const updateFlavorColor = (flavor) => {
      if (!iceMesh) return;
      let color = '#ffffff';
      if (flavor === 'Chocolade') color = '#5D3A00';
      if (flavor === 'Vanille') color = '#fff5c3';
      if (flavor === 'Aardbei') color = '#ff6fa5';
      if (flavor === 'Karamel') color = '#c69c6d';
      iceMesh.material.color = new Color(color);
    };

    const updateSprinkleVisibility = (kleur) => {
      // Verberg eerst alles
      Object.values(sprinkleMeshes).forEach(mesh => {
        if (mesh) mesh.visible = false;
      });

      // Toon gekozen kleur
      if (sprinkleMeshes[kleur]) {
        sprinkleMeshes[kleur].visible = true;
      }
    };

    onMounted(() => {
      scene = new Scene();

      camera = new PerspectiveCamera(
        45,
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.5, 3);

      renderer = new WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
      container.value.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      scene.add(new AmbientLight(0xffffff, 0.6));
      const dir = new DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 10, 7.5);
      scene.add(dir);

      const loader = new GLTFLoader();
      const url = process.env.BASE_URL + 'models/ice.glb';
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1.8, 1.8, 1.8);
          scene.add(model);

          model.traverse((child) => {
            if (child.isMesh) {
              console.log('🧊 Mesh:', child.name);

              if (child.name === 'Node-Mesh_1') {
                iceMesh = child;
              }

              // Mapping gebaseerd op wat je ziet in kleuren:
              if (child.name === 'Node-Mesh_2') sprinkleMeshes['Geel'] = child;   // was "bruin"
              if (child.name === 'Node-Mesh_3') sprinkleMeshes['Blauw'] = child;
              if (child.name === 'Node-Mesh_4') sprinkleMeshes['Groen'] = child;
            }
          });

          updateFlavorColor(props.flavor);
          updateSprinkleVisibility(props.sprinkleColor);
        },
        (xhr) => {
          console.log(`📦 Laden: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
        },
        (err) => {
          console.error('❌ Fout bij laden:', err);
        }
      );

      animate();
      window.addEventListener('resize', onResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    });

    // Reageer op props
    watch(() => props.flavor, updateFlavorColor);
    watch(() => props.sprinkleColor, updateSprinkleVisibility);

    return { container };
  }
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 400px;
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #f9f9f9;
}
</style>

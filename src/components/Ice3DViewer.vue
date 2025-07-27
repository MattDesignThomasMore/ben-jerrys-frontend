<template>
  <div class="welcome-banner">
    <h1>🍦 Welkom bij de Ben & Jerry's Ice Configurator!</h1>
    <p>
      Stel hier je eigen unieke ijsje samen. Klik op het ijsje om je favoriete smaak te kiezen
      en geef het wat sprinkles! 😋
    </p>
  </div>

  <div
    ref="container"
    class="three-container"
    @click="onCanvasClick"
    @mousemove="onMouseMove"
  ></div>

  <!-- Interactieve smaakselector -->
  <div v-if="iceSelected" class="flavor-popup" @click.stop>
    <div class="flavor-title">Kies je smaak:</div>
    <div class="flavor-options">
      <div
        v-for="flavorOption in flavorOptions"
        :key="flavorOption.name"
        :class="['flavor-circle', { selected: props.flavor === flavorOption.name }]"
        :style="{ background: flavorOption.color }"
        @click="selectFlavor(flavorOption.name)"
      >
        {{ flavorOption.emoji }}
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Raycaster,
  Vector2,
  Color,
  Mesh,
  MeshBasicMaterial
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  defineProps,
  defineEmits
} from 'vue';

const props = defineProps({
  flavor: String,
  sprinkleColor: String
});
const emit = defineEmits(['update:flavor']);

const container = ref(null);
let scene, camera, renderer, controls;
let iceMesh = null;
let iceOutlineMesh = null;
const raycaster = new Raycaster();
const pointer = new Vector2();
const iceSelected = ref(false);

const sprinkleMeshes = {
  Geel: null,
  Blauw: null,
  Groen: null
};

const flavorOptions = [
  { name: 'Vanille', color: '#fff5c3', emoji: '🤍' },
  { name: 'Chocolade', color: '#5D3A00', emoji: '🍫' },
  { name: 'Aardbei', color: '#ff6fa5', emoji: '🍓' },
  { name: 'Karamel', color: '#c69c6d', emoji: '🍯' }
];

function updateFlavorColor(flavor) {
  if (!iceMesh) return;
  const found = flavorOptions.find(f => f.name === flavor);
  iceMesh.material.color = new Color(found ? found.color : '#ffffff');
}

function updateSprinkleVisibility(kleur) {
  Object.values(sprinkleMeshes).forEach(mesh => {
    if (mesh) mesh.visible = false;
  });
  if (sprinkleMeshes[kleur]) sprinkleMeshes[kleur].visible = true;
}

function showOutlineMesh(active) {
  if (iceOutlineMesh) {
    iceOutlineMesh.visible = active;
    iceOutlineMesh.material.opacity = active ? 0.9 : 0.0;
    iceOutlineMesh.material.color.set(active ? 0x00bfff : 0x000000);
  }
}

function onCanvasClick(event) {
  const intersects = raycastToIce(event);
  iceSelected.value = intersects.length > 0;
}

function onMouseMove(event) {
  const intersects = raycastToIce(event);
  showOutlineMesh(intersects.length > 0);
}

function raycastToIce(event) {
  if (!iceMesh || !container.value) return [];
  const rect = container.value.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObject(iceMesh);
}

function selectFlavor(flavor) {
  emit('update:flavor', flavor);
  iceSelected.value = false;
}

onMounted(() => {
  scene = new Scene();
  camera = new PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 1.5, 3);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  container.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new AmbientLight(0xffffff, 0.6));
  const dir = new DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  const loader = new GLTFLoader();
  const url = process.env.BASE_URL + 'models/ice.glb';
  loader.load(url, gltf => {
    const model = gltf.scene;
    model.scale.set(1.8, 1.8, 1.8);
    scene.add(model);

    model.traverse(child => {
      if (child.isMesh) {
        if (child.name === 'Node-Mesh_1') {
          iceMesh = child;

          const outlineMaterial = new MeshBasicMaterial({
            color: 0x00bfff,
            transparent: true,
            opacity: 0.0,
            depthWrite: false
          });
          iceOutlineMesh = new Mesh(child.geometry.clone(), outlineMaterial);
          iceOutlineMesh.scale.set(1.07, 1.07, 1.07);
          iceOutlineMesh.visible = false;
          scene.add(iceOutlineMesh);
        }

        if (child.name === 'Node-Mesh_2') sprinkleMeshes['Geel'] = child;
        if (child.name === 'Node-Mesh_3') sprinkleMeshes['Blauw'] = child;
        if (child.name === 'Node-Mesh_4') sprinkleMeshes['Groen'] = child;
      }
    });

    updateFlavorColor(props.flavor);
    updateSprinkleVisibility(props.sprinkleColor);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    if (!container.value) return;
    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  }

  onResize();
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {});
  controls.dispose();
  renderer.dispose();
});

watch(() => props.flavor, updateFlavorColor);
watch(() => props.sprinkleColor, updateSprinkleVisibility);
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(to right, #00c4cc, #8ed1fc);
  padding: 1.2rem 1rem;
  border-radius: 12px;
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.welcome-banner h1 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.welcome-banner p {
  font-size: 1rem;
  margin: 0;
}

.three-container {
  width: 100%;
  height: 400px;
  margin-bottom: 1.5rem;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #f9f9f9;
  position: relative;
  cursor: pointer;
}

.flavor-popup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.97);
  padding: 1rem;
  text-align: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  animation: slide-up 0.3s ease;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.flavor-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.flavor-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.flavor-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  cursor: pointer;
  border: 3px solid transparent;
  transition: transform 0.2s ease, border 0.2s ease;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

.flavor-circle:hover {
  transform: scale(1.15);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
}

.flavor-circle.selected {
  border-color: #111;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.3);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

<template>
  <div class="full-screen">
    <div class="instruction" v-if="step === 1">
      ✅ Klik op de ijsbol om je smaak te kiezen.
    </div>

    <div ref="container" class="three-container" @click="onCanvasClick" @mousemove="onMouseMove"></div>

    <!-- STAP 1: Smaak -->
    <div v-if="step === 1 && iceSelected" class="popup" @click.stop>
      <div class="popup-header">
        <span class="step">Stap 1: Kies je smaak</span>
        <button class="next-button" @click="goToNextStep">Volgende →</button>
      </div>
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

    <!-- STAP 2: Toppings -->
    <div v-if="step === 2" class="popup" @click.stop>
      <div class="popup-header">
        <span class="step">Stap 2: Kies je toppings</span>
        <button class="next-button" @click="goToNextStep">Volgende →</button>
      </div>
      <div class="flavor-options">
        <div
          v-for="(value, kleur) in sprinkleMeshes"
          :key="kleur"
          :class="['flavor-circle', { selected: props.sprinkleColor === kleur }]"
          :style="{ background: kleur.toLowerCase() }"
          @click="selectTopping(kleur)"
        >
          🍬
        </div>
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
const emit = defineEmits(['update:flavor', 'update:sprinkleColor']);

const container = ref(null);
let scene, camera, renderer, controls;
let iceMesh = null;
let iceOutlineMesh = null;
const raycaster = new Raycaster();
const pointer = new Vector2();
const iceSelected = ref(false);
const step = ref(1);

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
  Object.values(sprinkleMeshes).forEach(mesh => mesh && (mesh.visible = false));
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
  if (step.value === 1) iceSelected.value = intersects.length > 0;
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
  updateFlavorColor(flavor);
}

function selectTopping(kleur) {
  emit('update:sprinkleColor', kleur);
  updateSprinkleVisibility(kleur);
}

function goToNextStep() {
  step.value++;
  iceSelected.value = false;
}

onMounted(() => {
  scene = new Scene();
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 3);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
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

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
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
.full-screen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background: #f4f6fa;
}

.instruction {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 1rem;
  color: #333;
}

.three-container {
  width: 100%;
  height: 100vh;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.popup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 1rem 1.5rem;
  text-align: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  animation: slide-up 0.3s ease;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.step {
  font-weight: bold;
  font-size: 1rem;
  color: #666;
}

.next-button {
  background: #00bfff;
  color: #fff;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s ease;
}

.next-button:hover {
  background: #0099cc;
}

.flavor-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
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

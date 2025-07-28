<template>

<!-- Welkomsttekst -->
<div class="welcome-text">
  <div class="wood-sign">
    <div class="bunting"></div>
    <div class="lights">
      <span v-for="n in 16" :key="n" class="bulb"></span>
    </div>
    <div class="sign-content">
      <div class="text">
        <h1>🍦 Welkom bij <span class="brand">Ben & Jerry’s</span> ijsconfigurator</h1>
        <p>Stel jouw droomijsje samen in 3 simpele stappen</p>
      </div>
    </div>
  </div>
</div>



  <div class="ice-app">
    <!-- 3D canvas -->
    <div
      ref="canvasContainer"
      class="canvas"
      @click="handleCanvasClick"
      @mousemove="handleMouseMove"
    ></div>

    <!-- Stepper UI -->
    <transition name="fade">
      <div v-if="step === 1 && isIceSelected" class="ui-card">
        <header class="ui-header">
          <h2>Stap 1: Kies je smaak</h2>
          <button
            class="btn primary"
            :disabled="order.flavor === null"
            @click="nextStep"
          >
            Volgende →
          </button>
        </header>
        <div class="options">
          <button
            v-for="option in flavors"
            :key="option.name"
            class="option-btn"
            :class="{ selected: order.flavor === option.name }"
            :style="{ backgroundColor: option.color }"
            @click="selectFlavor(option.name)"
          >
            {{ option.emoji }}
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="step === 2" class="ui-card">
        <header class="ui-header">
          <h2>Stap 2: Kies je toppingkleur</h2>
          <button
            class="btn primary"
            :disabled="order.topping === null"
            @click="nextStep"
          >
            Volgende →
          </button>
        </header>
        <div class="options">
          <button
            v-for="option in toppings"
            :key="option.name"
            class="option-btn"
            :class="{ selected: order.topping === option.name }"
            :style="{ backgroundColor: option.color }"
            @click="selectTopping(option.name)"
          >
            {{ option.emoji }}
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="step === 3 && !orderConfirmed" class="ui-card">
        <header class="ui-header">
          <h2>Stap 3: Afrekenen</h2>
        </header>
        <form class="form" @submit.prevent="submitOrder">
          <input v-model="order.name" required placeholder="👤 Naam" />
          <input v-model="order.address" required placeholder="🏠 Adres" />
          <input
            v-model.number="order.price"
            required
            type="number"
            step="0.01"
            min="0.5"
            placeholder="💶 Prijs"
          />
          <button class="btn submit" type="submit">Bestellen</button>
        </form>
        <p v-if="error" class="message error">
          ❌ Er is iets misgegaan. Probeer opnieuw.
        </p>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="orderConfirmed" class="ui-card confirmation">
        <h2>🎉 Bestelling bevestigd</h2>
        <p>Bedankt voor je bestelling, <strong>{{ order.name }}</strong>!</p>
        <ul class="summary">
          <li><strong>🆔 Ordernummer:</strong> #{{ orderId }}</li>
          <li><strong>🍦 Smaak:</strong> {{ lastOrder.flavorDisplay }}</li>
          <li><strong>🍬 Topping:</strong> {{ lastOrder.toppingDisplay }}</li>
          <li><strong>🏠 Adres:</strong> {{ lastOrder.address }}</li>
          <li><strong>💶 Totaal:</strong> €{{ lastOrder.price.toFixed(2) }}</li>
        </ul>
        <button class="btn" @click="reset">🔄 Nieuwe bestelling</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
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
  MeshBasicMaterial,
  sRGBEncoding,
  ACESFilmicToneMapping,
  EquirectangularReflectionMapping
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const canvasContainer = ref();
const step = ref(1);
const isIceSelected = ref(false);
const orderConfirmed = ref(false);
const orderId = ref('');
const error = ref(false);
const order = reactive({ flavor: null, topping: null, name: '', address: '', price: null });
const lastOrder = reactive({ flavor: null, topping: null, name: '', address: '', price: 0 });

let scene, camera, renderer, controls;
let iceMesh, outlineMesh;
const sprinkleMeshes = { Geel: null, Blauw: null, Groen: null, Geen: null };
const pointer = new Vector2();
const raycaster = new Raycaster();

const flavors = [
  { name: 'Vanille', color: '#FFD67A', emoji: '🤍' },
  { name: 'Chocolade', color: '#5D3A00', emoji: '🍫' },
  { name: 'Aardbei', color: '#ff6fa5', emoji: '🍓' },
  { name: 'Karamel', color: '#c69c6d', emoji: '🍯' },
  { name: 'Geen', color: '#cccccc', emoji: '🚫' }
];

const toppings = [
  { name: 'Geel', color: '#ffd900', },
  { name: 'Blauw', color: '#4dc6ff', },
  { name: 'Groen', color: '#5cdb71', },
  { name: 'Geen', color: '#dddddd', emoji: '🚫' }
];

function selectFlavor(name) {
  order.flavor = name;
  const sel = flavors.find(f => f.name === name);
  if (iceMesh) iceMesh.material.color = new Color(sel?.color || '#ffffff');
}

function selectTopping(name) {
  order.topping = name;
  Object.values(sprinkleMeshes).forEach(m => m && (m.visible = false));
  if (name !== 'Geen' && sprinkleMeshes[name]) sprinkleMeshes[name].visible = true;
}

function nextStep() {
  if (step.value < 3) {
    isIceSelected.value = false;
    step.value++;
  }
}

watch(order, () => {
  lastOrder.flavorDisplay = order.flavor === 'Geen' ? 'Geen smaak' : order.flavor;
  lastOrder.toppingDisplay = order.topping === 'Geen' ? 'Geen topping' : order.topping;
});

function reset() {
  Object.assign(order, { flavor: null, topping: null, name: '', address: '', price: null });
  orderConfirmed.value = false;
  step.value = 1;
}

async function submitOrder() {
  error.value = false;
  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error();
    orderId.value = Math.floor(100000 + Math.random() * 900000);
    Object.assign(lastOrder, { ...order, price: order.price });
    orderConfirmed.value = true;
  } catch {
    error.value = true;
  }
}

function handleCanvasClick(evt) {
  if (step.value !== 1) return;
  isIceSelected.value = raycast(evt).length > 0;
}

function handleMouseMove(evt) {
  if (!outlineMesh) return;
  const hit = raycast(evt).length > 0;
  outlineMesh.visible = hit;
  outlineMesh.material.opacity = hit ? 0.7 : 0;
}

function raycast(evt) {
  const rect = canvasContainer.value.getBoundingClientRect();
  pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return iceMesh ? raycaster.intersectObject(iceMesh) : [];
}

onMounted(() => {
  // 1) Scene en camera
  scene = new Scene();
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(2, 0, 1);
  camera.lookAt(0, 0, 0);

  

  // 2) Renderer
  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  canvasContainer.value.appendChild(renderer.domElement);

  // 3) Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 4) Lights
  scene.add(new AmbientLight(0xffffff, 0.6));
  const dir = new DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  // 5) HDR-omgeving laden
  const hdrUrl = window.location.origin + '/textures/benjerrys_shop.hdr';
  new RGBELoader().load(
    hdrUrl,
    tex => {
      // bij succes
      tex.mapping = EquirectangularReflectionMapping;
      scene.background = tex;
      scene.environment = tex;
    },
    undefined,
    err => {
      console.error('HDR load error:', err);
      // valt terug op default (geen crash)
    }
  );

  // 6) GLTF-model
// 6) GLTF-model
new GLTFLoader().load('/models/ice.glb', gltf => {
  const model = gltf.scene;

  // 1) schaal en lift het hele model
  model.scale.set(1.8, 1.8, 1.8);
  model.position.y = 0.1;
  scene.add(model);

  // 2) traverse voor hoofd‑mesh en sprinkles
  model.traverse(child => {
    if (!child.isMesh) return;

    // hoofd-ijs mesh: bewaar voor selectie
    if (child.name === 'Node-Mesh_1') {
      iceMesh = child;
      iceMesh.material.color = new Color('#ffffff');

      // outline als child van dezelfde mesh
      outlineMesh = new Mesh(
        child.geometry.clone(),
        new MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0 })
      );
      // neem dezelfde scale mee en zet lichtjes groter
      outlineMesh.scale.copy(child.scale).multiplyScalar(1.05);
      // voeg toe als child, niet direct aan scene
      child.add(outlineMesh);
    }

    // sprinkles blijven onder model hangen, dus liften automatisch mee
    if (child.name === 'Node-Mesh_2') sprinkleMeshes.Geel  = child;
    if (child.name === 'Node-Mesh_3') sprinkleMeshes.Blauw = child;
    if (child.name === 'Node-Mesh_4') sprinkleMeshes.Groen = child;
  });

  // 3) alle sprinkles initieel verbergen
  Object.values(sprinkleMeshes).forEach(m => m && (m.visible = false));
});


  // 7) Animatie-loop
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
});
</script>

<style scoped>
.ice-app {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(to bottom right, #eef1f5, #d3e3f2);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.ui-card {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  animation: slide-up 0.3s ease-out;
  z-index: 10;
}

.ui-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.option-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-size: 1.4rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn.selected {
  border-color: #000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.form {
  display: grid;
  gap: 1rem;
}

input {
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary {
  background: #00bfff;
  color: white;
}

.primary:disabled {
  background: #cbe9f6;
  cursor: not-allowed;
}

.submit {
  background: #28a745;
  color: white;
}

.message.error {
  color: red;
  margin-top: 1rem;
}

.confirmation {
  text-align: center;
}

.summary {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
}

.summary li {
  margin-bottom: 0.5rem;
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

.fade-enter-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Welkomstbord */
.welcome-text {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  animation: drop-in 1s ease-out forwards;
  width: 100%;
  max-width: 700px;
}

.wood-sign {
  background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') repeat;
  background-color: #8b5e3c;
  border-radius: 0 0 32px 32px;
  border-bottom: 8px solid #6b4c2a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  padding: 2rem 2rem 3rem;
  position: relative;
  overflow: hidden;
  text-align: center;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
  color: #fff8e1;
}

.sign-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.sign-content .text {
  flex: 1;
}

.sign-content h1 {
  margin: 0;
  font-size: 2.2rem;
  color: #fffde7;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
}

.sign-content p {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: #fffbe6;
}

.ice-icon {
  width: 48px;
  height: auto;
}

.ice-icon.left {
  transform: rotate(-15deg);
}

.ice-icon.right {
  transform: rotate(15deg);
}

/* Lampjes boven het bord */
.lights {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 1;
}

.bulb {
  width: 14px;
  height: 14px;
  background: #ffd700;
  border-radius: 50%;
  box-shadow: 0 0 6px #ffd700;
  animation: blink 1.4s infinite ease-in-out;
}

.bulb:nth-child(even) {
  background: #ff69b4;
  box-shadow: 0 0 6px #ff69b4;
  animation-delay: 0.3s;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes drop-in {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}


</style>

<template>
  <div class="ice-app">
    <div ref="container" class="canvas-container" @click="onCanvasClick" @mousemove="onMouseMove"></div>

    <transition name="fade-slide">
      <div v-if="step === 1 && iceSelected" class="step-card glass">
        <div class="step-header">
          <h3> Stap 1: Kies je smaak</h3>
          <button class="btn-next" :disabled="!order.flavor" @click="goToNextStep">Volgende →</button>
        </div>
        <div class="flavors">
          <div
            v-for="opt in flavorOptions"
            :key="opt.name"
            class="flavor-button"
            :class="{ selected: order.flavor === opt.name }"
            :style="{ background: opt.color }"
            @click="selectFlavor(opt.name)"
          >
            {{ opt.emoji }}
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-slide">
      <div v-if="step === 2" class="step-card glass">
        <div class="step-header">
          <h3>Stap 2: Kies je toppings</h3>
          <button class="btn-next" :disabled="!order.topping" @click="goToNextStep">Volgende →</button>
        </div>
        <div class="flavors">
          <div
            v-for="kleur in Object.keys(sprinkleMeshes)"
            :key="kleur"
            class="flavor-button"
            :class="{ selected: order.topping === kleur }"
            :style="{ background: kleur.toLowerCase() }"
            @click="selectTopping(kleur)"
          >
            {{ kleur === 'Geel' ? '🌟' : kleur === 'Blauw' ? '💧' : '🌿' }}
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-slide">
      <div v-if="step === 3" class="step-card glass">
        <div class="step-header">
          <h3>🧾 Stap 3: Afrekenen</h3>
        </div>
        <form class="checkout-form" @submit.prevent="submitOrder">
          <input v-model="order.name" required placeholder="👤 Naam" />
          <input v-model="order.address" required placeholder="🏠 Adres" />
          <input v-model.number="order.price" required min="0.5" step="0.01" placeholder="💶 Prijs" type="number" />
          <button type="submit" class="btn-submit">📦 Bestel Nu</button>
        </form>
        <p v-if="success" class="success-msg">✅ Bestelling verzonden!</p>
        <p v-if="error" class="error-msg">❌ Er is iets misgegaan.</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {
  Scene, PerspectiveCamera, WebGLRenderer, AmbientLight,
  DirectionalLight, Raycaster, Vector2, Color, Mesh, MeshBasicMaterial
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ref, reactive, onMounted } from 'vue'

const container = ref()
let scene, camera, renderer, controls
let iceMesh = null, iceOutline = null
const raycaster = new Raycaster(), pointer = new Vector2()

const step = ref(1)
const iceSelected = ref(false)
const order = reactive({ flavor: '', topping: '', name: '', address: '', price: null })
const success = ref(false), error = ref(false)

const flavorOptions = [
  { name: 'Vanille', color: '#fff5c3', emoji: '🤍' },
  { name: 'Chocolade', color: '#5D3A00', emoji: '🍫' },
  { name: 'Aardbei', color: '#ff6fa5', emoji: '🍓' },
  { name: 'Karamel', color: '#c69c6d', emoji: '🍯' }
]
const sprinkleMeshes = { Geel: null, Blauw: null, Groen: null }

function raycast(evt) {
  const rect = container.value.getBoundingClientRect()
  pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  return iceMesh ? raycaster.intersectObject(iceMesh) : []
}
function onCanvasClick(evt) {
  if (step.value !== 1) return
  iceSelected.value = raycast(evt).length > 0
}
function onMouseMove(evt) {
  if (!iceOutline) return
  iceOutline.visible = raycast(evt).length > 0
  iceOutline.material.opacity = iceOutline.visible ? 0.8 : 0
}
function selectFlavor(name) {
  order.flavor = name
  const opt = flavorOptions.find(f => f.name === name)
  if (iceMesh) iceMesh.material.color = new Color(opt?.color || '#ffffff')
}
function selectTopping(kleur) {
  order.topping = kleur
  Object.values(sprinkleMeshes).forEach(m => m && (m.visible = false))
  sprinkleMeshes[kleur] && (sprinkleMeshes[kleur].visible = true)
}
function goToNextStep() {
  if (step.value < 3) {
    step.value++
    iceSelected.value = false
  }
}
async function submitOrder() {
  success.value = error.value = false
  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
    if (!res.ok) throw new Error()
    success.value = true
    Object.assign(order, { flavor: '', topping: '', name: '', address: '', price: null })
    step.value = 1
  } catch { error.value = true }
}

onMounted(() => {
  scene = new Scene()
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 1.5, 3)
  renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  scene.add(new AmbientLight(0xffffff, 0.6))
  const light = new DirectionalLight(0xffffff, 0.8)
  light.position.set(5, 10, 7.5)
  scene.add(light)

  new GLTFLoader().load('/models/ice.glb', gltf => {
    const model = gltf.scene
    model.scale.set(1.8, 1.8, 1.8)
    scene.add(model)
    model.traverse(child => {
      if (!child.isMesh) return
      if (child.name === 'Node-Mesh_1') {
        iceMesh = child
        iceMesh.material.color = new Color('#ffffff')
        iceOutline = new Mesh(child.geometry.clone(), new MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0 }))
        iceOutline.scale.set(1.05, 1.05, 1.05)
        scene.add(iceOutline)
      }
      if (child.name === 'Node-Mesh_2') sprinkleMeshes.Geel = child
      if (child.name === 'Node-Mesh_3') sprinkleMeshes.Blauw = child
      if (child.name === 'Node-Mesh_4') sprinkleMeshes.Groen = child
    })
    Object.values(sprinkleMeshes).forEach(m => m && (m.visible = false))
  })

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
.ice-app {
  font-family: 'Poppins', sans-serif;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(to bottom right, #eef1f5, #d3e3f2);
}
.canvas-container {
  width: 100vw;
  height: 100vh;
}
.step-card {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 10;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
}
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.btn-next, .btn-submit {
  background: #00bfff;
  color: white;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.btn-next:disabled {
  background: #a3d7eb;
  cursor: not-allowed;
}
.btn-next:hover:enabled, .btn-submit:hover {
  background: #0099cc;
  transform: scale(1.05);
}
.flavors {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
.flavor-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.flavor-button.selected {
  border-color: #222;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}
.checkout-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}
.checkout-form input {
  padding: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 1rem;
}
.success-msg { color: green; margin-top: 1rem; }
.error-msg { color: red; margin-top: 1rem; }
.fade-slide-enter-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  transform: translateY(20px);
  opacity: 0;
}
</style>

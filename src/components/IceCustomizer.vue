<template>
  <!-- Welkomstbord -->
  <div class="welcome-text" v-if="!orderConfirmed && step < 3">
    <div class="wood-sign">
      <div class="lights">
        <span v-for="n in 16" :key="n" class="bulb"></span>
      </div>
      <div class="sign-content">
        <h1>🍦 Welkom bij <span class="brand">Ben & Jerry’s</span> ijsconfigurator</h1>
        <p>Stel jouw droomijsje samen in 3 simpele stappen</p>
      </div>
    </div>
  </div>

  <!-- 3D‑canvas altijd op achtergrond -->
  <div
    ref="canvasContainer"
    class="canvas"
    @click="handleCanvasClick"
    @mousemove="handleMouseMove"
  ></div>

  <div class="ice-app">
    <!-- Stap 1: Smaak kiezen -->
    <transition name="fade">
      <div v-if="step === 1 && isIceSelected" class="ui-card">
        <header class="ui-header">
          <h2>Stap 1: Kies je smaak</h2>
          <button class="btn primary" :disabled="!order.flavor" @click="nextStep">
            Volgende →
          </button>
        </header>
        <div class="options">
          <button
            v-for="f in flavors"
            :key="f.name"
            class="option-btn"
            :class="{ selected: order.flavor === f.name }"
            :style="{ backgroundColor: f.color }"
            @click="selectFlavor(f.name)"
          >{{ f.emoji }}</button>
        </div>
      </div>
    </transition>

    <!-- Stap 2: Topping kiezen -->
    <transition name="fade">
      <div v-if="step === 2" class="ui-card">
        <header class="ui-header">
          <h2>Stap 2: Kies je toppingkleur</h2>
          <button class="btn primary" :disabled="!order.topping" @click="nextStep">
            Volgende →
          </button>
        </header>
        <div class="options">
          <button
            v-for="t in toppings"
            :key="t.name"
            class="option-btn"
            :class="{ selected: order.topping === t.name }"
            :style="{ backgroundColor: t.color }"
            @click="selectTopping(t.name)"
          >{{ t.emoji || '' }}</button>
        </div>
      </div>
    </transition>

    <!-- Stap 3: Full‑page checkout -->
    <transition name="fade">
      <div v-if="step === 3 && !orderConfirmed" class="checkout-page">
        <!-- Linkerpaneel: cart + preview snapshot -->
        <div class="cart-card">
          <h2>Shopping Cart</h2>
          <table class="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Smaak</th>
                <th>Topping</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🍦 IJsje</td>
                <td>{{ flavorDisplay }}</td>
                <td>{{ toppingDisplay }}</td>
                <td class="qty-cell">
                  <button @click="decrementQty">–</button>
                  {{ order.quantity }}
                  <button @click="incrementQty">+</button>
                </td>
                <td>€{{ totalPrice.toFixed(2) }}</td>
                <td><button class="remove-btn" @click="backToConfig">×</button></td>
              </tr>
              <tr v-if="showDetails" class="details-row">
                <td colspan="6">
                  <div class="detail-col">
                    <strong>Smaak details</strong><br/>
                    <span>🎨 Kleur: {{ flavorColor }}</span><br/>
                    <span>🍦 Tekstuur: {{ flavorTexture }}</span>
                  </div>
                  <div class="detail-col">
                    <strong>Topping details</strong><br/>
                    <span>🎨 Kleur: {{ toppingColor }}</span><br/>
                    <span>✨ Type: {{ toppingType }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <button class="toggle-details" @click="showDetails = !showDetails">
            {{ showDetails ? 'Hide Details' : 'Show Details' }}
          </button>
          <div class="summary-row">
            <a href="#" @click.prevent="backToConfig">← Continue Customizing</a>
            <div class="totals">
              <div>Subtotal: €{{ totalPrice.toFixed(2) }}</div>
              <div>Shipping: Free</div>
              <div class="grand-total">Total: €{{ totalPrice.toFixed(2) }}</div>
            </div>
          </div>

          <h3>Your Customized Ice Cream</h3>
          <img v-if="previewImage" :src="previewImage" class="preview-image" />
        </div>

        <!-- Rechterpaneel: formulier -->
        <div class="form-card">
          <div class="contact-section">
            <h3>Contact information</h3>
            <input v-model="order.email" type="email" placeholder="Email" required />
            <label><input type="checkbox" v-model="order.subscribe" /> Email me with news and offers</label>
            <div class="two-col">
              <input v-model="order.firstName" placeholder="First name" required />
              <input v-model="order.lastName" placeholder="Last name" required />
            </div>
            <input v-model="order.company" placeholder="Company (optional)" />
            <input v-model="order.address" placeholder="Address" required />
            <input v-model="order.apt" placeholder="Apartment, suite, etc. (optional)" />
            <div class="two-col">
              <input v-model="order.city" placeholder="City" required />
              <select v-model="order.country">
                <option>United States</option>
                <option>Europe</option>
                <option>Other</option>
              </select>
            </div>
            <div class="two-col">
              <input v-model="order.zip" placeholder="ZIP code" required />
              <input v-model="order.phone" placeholder="Phone (optional)" />
            </div>
          </div>

          <div class="payment-section">
            <h3>Payment Info</h3>
            <div class="payment-methods">
              <label><input type="radio" value="MasterCard" v-model="order.paymentMethod" /> Master Card</label>
              <label><input type="radio" value="Amex" v-model="order.paymentMethod" /> American Express</label>
              <label><input type="radio" value="Visa" v-model="order.paymentMethod" /> Visa</label>
            </div>
            <input v-model="order.cardName" placeholder="Name On Card" required />
            <input v-model="order.cardNumber" placeholder="Card Number" required />
            <div class="two-col">
              <input
                v-model="order.expirationDate"
                placeholder="MM / YY"
                required
              />
              <input v-model="order.cvv" placeholder="CVV" required />
            </div>
            <button class="checkout-btn" :disabled="!canCheckout" @click="submitOrder">
              Check Out
            </button>
            <p v-if="error" class="error-msg">❌ Something went wrong. Please try again.</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bevestiging -->
    <transition name="fade">
      <div v-if="orderConfirmed" class="ui-card confirmation">
        <h2>🎉 Bestelling bevestigd</h2>
        <p>Bedankt voor je bestelling, <strong>{{ order.firstName }}</strong>!</p>
        <ul class="summary">
          <li><strong>🆔 Ordernummer:</strong> #{{ orderId }}</li>
          <li><strong>🍦 Smaak:</strong> {{ flavorDisplay }}</li>
          <li><strong>🍬 Topping:</strong> {{ toppingDisplay }}</li>
          <li><strong>🏠 Adres:</strong> {{ order.address }}</li>
          <li><strong>💶 Totaal:</strong> €{{ lastOrder.price.toFixed(2) }}</li>
        </ul>
        <button class="btn" @click="reset">🔄 Nieuwe bestelling</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  AmbientLight, DirectionalLight,
  Raycaster, Vector2, Color,
  Mesh, MeshBasicMaterial,
  sRGBEncoding, ACESFilmicToneMapping,
  EquirectangularReflectionMapping
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// refs & state
const canvasContainer = ref();
const step = ref(1);
const isIceSelected = ref(false);
const orderConfirmed = ref(false);
const orderId = ref('');
const error = ref(false);
const showDetails = ref(false);
const previewImage = ref(null);

// reactive order
const order = reactive({
  flavor: null,
  topping: null,
  quantity: 1,
  unitPrice: 0,
  firstName: '',
  lastName: '',
  email: '',
  subscribe: false,
  company: '',
  address: '',
  apt: '',
  city: '',
  country: 'United States',  
  zip: '',
  phone: '',
  paymentMethod: null,
  cardName: '',
  cardNumber: '',
  expirationDate: '',
  cvv: ''
});
const lastOrder = reactive({ price: 0 });

// pricing maps
const flavorPrices = { Vanille: 2.5, Chocolade: 3.0, Aardbei: 3.5, Karamel: 3.0, Geen: 0 };
const toppingPrices = { Geel: 0.5, Blauw: 0.5, Groen: 0.5, Geen: 0 };

// options
const flavors = [
  { name: 'Vanille', color: '#fff5c3', emoji: '🤍' },
  { name: 'Chocolade', color: '#5D3A00', emoji: '🍫' },
  { name: 'Aardbei', color: '#ff6fa5', emoji: '🍓' },
  { name: 'Karamel', color: '#c69c6d', emoji: '🍯' },
  { name: 'Geen', color: '#cccccc', emoji: '🚫' }
];
const toppings = [
  { name: 'Geel', color: '#ffd900' },
  { name: 'Blauw', color: '#4dc6ff' },
  { name: 'Groen', color: '#55fa70' },
  { name: 'Geen', color: '#dddddd', emoji: '🚫' }
];

// computed
const totalPrice = computed(() => order.unitPrice * order.quantity);
const flavorDisplay = computed(() =>
  order.flavor === 'Geen' ? 'Geen smaak' : order.flavor
);
const toppingDisplay = computed(() =>
  order.topping === 'Geen' ? 'Geen topping' : order.topping
);
const flavorColor = computed(() =>
  flavors.find(f => f.name === order.flavor)?.color || '—'
);
const flavorTexture = computed(() =>
  order.flavor === 'Vanille' ? 'Smooth' : 'Creamy'
);
const toppingColor = computed(() =>
  toppings.find(t => t.name === order.topping)?.color || '—'
);
const toppingType = computed(() =>
  order.topping === 'Geen' ? 'None' : 'Sprinkles'
);
const canCheckout = computed(() =>
  order.email &&
  order.firstName &&
  order.lastName &&
  order.address &&
  order.city &&
  order.zip &&
  order.paymentMethod &&
  order.cardName &&
  order.cardNumber &&
  order.expirationDate &&
  order.cvv &&
  totalPrice.value > 0 &&
  !error.value
);

// selection handlers
function selectFlavor(name) {
  order.flavor = name;
  order.unitPrice =
    (flavorPrices[name] || 0) + (toppingPrices[order.topping] || 0);
  if (iceMesh) {
    iceMesh.material.color = new Color(
      flavors.find(f => f.name === name).color
    );
  }
}
function selectTopping(name) {
  order.topping = name;
  order.unitPrice =
    (flavorPrices[order.flavor] || 0) + (toppingPrices[name] || 0);
  Object.values(sprinkleMeshes).forEach(m => m && (m.visible = false));
  if (name !== 'Geen' && sprinkleMeshes[name]) {
    sprinkleMeshes[name].visible = true;
  }
}

// navigation
function nextStep() {
  if (step.value < 3) {
    isIceSelected.value = false;
    step.value++;
  }
}
function backToConfig() {
  step.value = 1;
  showDetails.value = false;
  previewImage.value = null;
}

// quantity
function incrementQty() {
  order.quantity++;
}
function decrementQty() {
  if (order.quantity > 1) order.quantity--;
}

// snapshot at step 3
watch(step, newStep => {
  if (newStep === 3) {
    renderer.render(scene, camera);
    previewImage.value = renderer.domElement.toDataURL();
  }
});

// reset
function reset() {
  Object.assign(order, {
    flavor: null,
    topping: null,
    quantity: 1,
    unitPrice: 0,
    firstName: '',
    lastName: '',
    email: '',
    subscribe: false,
    company: '',
    address: '',
    apt: '',
    city: '',
    country: 'United States',
    zip: '',
    phone: '',
    paymentMethod: null,
    cardName: '',
    cardNumber: '',
    expirationDate: '',
    cvv: ''
  });
  orderConfirmed.value = false;
  step.value = 1;
  showDetails.value = false;
  previewImage.value = null;
}

// submit order
async function submitOrder() {
  error.value = false;
  try {
    const payload = {
      flavor: order.flavor,
      topping: order.topping,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalPrice: totalPrice.value,
      customer: {
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        address: order.address,
        apt: order.apt,
        city: order.city,
        zip: order.zip,
        country: order.country,
        phone: order.phone
      },
      payment: {
        method: order.paymentMethod,
        nameOnCard: order.cardName,
        cardNumber: order.cardNumber,
        expirationDate: order.expirationDate,
        cvv: order.cvv
      }
    };
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    orderId.value = Math.floor(100000 + Math.random() * 900000);
    lastOrder.price = totalPrice.value;
    orderConfirmed.value = true;
  } catch {
    error.value = true;
  }
}

// raycast
function handleCanvasClick(evt) {
  if (step.value !== 1) return;
  const hits = raycast(evt);
  isIceSelected.value = hits.length > 0;
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

// Three.js setup
let scene, camera, renderer, controls, iceMesh, outlineMesh;
const sprinkleMeshes = { Geel: null, Blauw: null, Groen: null, Geen: null };  
const pointer = new Vector2();  
const raycaster = new Raycaster();  

onMounted(() => {
  scene = new Scene();
  camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2, 0, 1);
  camera.lookAt(0, 0, 0);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;  
  renderer.toneMappingExposure = 1;  
  canvasContainer.value.appendChild(renderer.domElement);  

  controls = new OrbitControls(camera, renderer.domElement);  
  controls.enableDamping = true;  

  scene.add(new AmbientLight(0xffffff, 0.6));  
  const dir = new DirectionalLight(0xffffff, 0.8);  
  dir.position.set(5, 10, 7.5);  
  scene.add(dir);  

  new RGBELoader().load(
    window.location.origin + '/textures/benjerrys_shop.hdr',
    tex => {
      tex.mapping = EquirectangularReflectionMapping;
      scene.background = tex;
      scene.environment = tex;
    },
    undefined,
    err => console.warn('HDR load error', err)
  );

  new GLTFLoader().load('/models/ice.glb', gltf => {
    const model = gltf.scene;
    model.scale.set(1.8, 1.8, 1.8);
    model.position.y = 0.1;
    scene.add(model);

    model.traverse(child => {
      if (!child.isMesh) return;
      if (child.name === 'Node-Mesh_1') {
        iceMesh = child;
        iceMesh.material.color = new Color('#ffffff');
        outlineMesh = new Mesh(
          child.geometry.clone(),
          new MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0 })
        );
        outlineMesh.scale.copy(child.scale).multiplyScalar(1.05);
        child.add(outlineMesh);
      }
      if (child.name === 'Node-Mesh_2') sprinkleMeshes.Geel = child;
      if (child.name === 'Node-Mesh_3') sprinkleMeshes.Blauw = child;
      if (child.name === 'Node-Mesh_4') sprinkleMeshes.Groen = child;
    });
    Object.values(sprinkleMeshes).forEach(m => m && (m.visible = false));
  });

  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
});
</script>

<style scoped>
.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Welkomstbord */
.welcome-text {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  width: 100%;
  max-width: 700px;
  animation: drop-in 1s ease-out forwards;
}
.wood-sign {
  background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') repeat #8b5e3c;
  border-radius: 0 0 32px 32px;
  border-bottom: 8px solid #6b4c2a;
  padding: 2rem;
  text-align: center;
  font-family: 'Comic Sans MS', cursive;
  color: #fff8e1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
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
  animation: blink 1.4s infinite;
}
.bulb:nth-child(even) {
  background: #ff69b4;
  box-shadow: 0 0 6px #ff69b4;
  animation-delay: 0.3s;
}

/* Overlay kaarten Stap 1 & 2 */
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
  z-index: 10;
  animation: slide-up 0.3s ease-out;
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
  transition: all 0.2s;
}
.option-btn.selected {
  border-color: #000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

/* Full-page checkout */
.checkout-page {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem;
  z-index: 20;
  position: relative;
}
.cart-card {
  flex: 2;
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}
.cart-card h2 {
  margin-top: 0;
  font-size: 1.6rem;
}
.cart-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.cart-table th,
.cart-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
.qty-cell button {
  background: #5cff00;
  border: none;
  padding: 0 0.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  margin: 0 0.25rem;
}
.remove-btn {
  background: #5cff00;
  border: none;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
}
.toggle-details {
  background: #5cff00;
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}
.details-row td {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #f9f9f9;
}
.detail-col {
  flex: 1;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.summary-row a {
  text-decoration: none;
  color: #00bfff;
}
.totals div {
  margin-bottom: 0.25rem;
}
.grand-total {
  font-weight: bold;
}
.preview-image {
  width: 100%;
  border-radius: 8px;
  margin-top: 1rem;
}

/* Form panel */
.form-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.contact-section,
.payment-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.two-col {
  display: flex;
  gap: 1rem;
}
input,
select {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.payment-methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.payment-methods label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.checkout-btn {
  width: 100%;
  background: #5cff00;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
}
.checkout-btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}
.error-msg {
  color: red;
  margin-top: 0.5rem;
}

/* Confirmation */
.confirmation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 2rem;
  text-align: center;
  z-index: 30;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}
.confirmation .summary {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
}
.confirmation .summary li {
  margin-bottom: 0.5rem;
}

/* Animations */
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
@keyframes blink {
  0%,100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
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

  <template>
    <div class="welcome-text" v-if="!orderConfirmed && step < 3">
      <div class="wood-sign">
        <div class="lights">
          <span v-for="n in 16" :key="n" class="bulb"></span>
        </div>
        <div class="sign-content">
          <h1>Welkom bij <span class="brand">Ben & Jerry’s</span> ijsconfigurator</h1>
          <p>Klik op het ijsje om je droomcombinatie samen te stellen</p>
        </div>
      </div>
    </div>

    <div
      ref="canvasContainer"
      class="canvas"
      @click="handleCanvasClick"
      @mousemove="handleMouseMove"
    ></div>

    <div class="ice-app">
      <!-- Stap 1: Smaak kiezen  ------>
      <transition name="fade">
        <div v-if="step === 1 && isIceSelected" class="ui-card">
          <header class="ui-header">
            <h2>Stap 1: Kies je smaak</h2>
            <button class="btn primary" :disabled="!order.flavor" @click="nextStep">
              Volgende
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
      </transition></div>

      <!-- Stap 2: Topping kiezen ---->
      <transition name="fade">
        <div v-if="step === 2" class="ui-card">
          <header class="ui-header">
            <!-- Terug-knop naar stap 1 -->
                <div class="header-left">
       <button class="btn-back" @click="prevStep" aria-label="Terug">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
    <path d="M15 19L8 12l7-7" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2.2" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
  </svg>
</button>

        <h2>Stap 2: Kies je topping</h2>
      </div>
            <button class="btn primary" :disabled="!order.topping" @click="nextStep">
              Afrekenen
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

     <!-- Stap 3 overlay met blur -------->
<transition name="overlay-fade">
  <div
    v-if="step === 3 && !orderConfirmed"
    class="modal-overlay"
    style="z-index: 19;"
  ></div>
</transition>

<transition name="fade">
  <div
    v-if="step === 3 && !orderConfirmed"
    class="cart-fullcard"
    style="z-index: 20;"
  >
    <h2>Shopping cart & gegevens</h2>
    <div v-if="previewImage" class="preview-wrapper">
      <img :src="previewImage" class="preview-image-large" alt="Preview ijsje" />
    </div>
    <table class="cart-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Smaak</th>
          <th>Topping</th>
          <th>Aantal</th>
          <th>Totaal</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>IJsje</td>
          <td>{{ flavorDisplay }}</td>
          <td>{{ toppingDisplay }}</td>
          <td class="qty-cell">
            <button @click="decrementQty">–</button>
            {{ order.quantity }}
            <button @click="incrementQty">+</button>
          </td>
          <td>€{{ totalPrice.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="summary-row">
      <a href="#" @click.prevent="backToConfig">← Verder aanpassen</a>
      <div class="totals">
        <div>Subtotaal: €{{ totalPrice.toFixed(2) }}</div>
        <div>Verzending: Gratis</div>
        <div class="grand-total">Totaal: €{{ totalPrice.toFixed(2) }}</div>
      </div>
    </div>
    <hr />
    <form @submit.prevent="submitOrder" class="combined-form">
  <div class="form-group">
    <label for="full-name" style="display: block; margin-bottom: 4px;">
      Volledige naam
    </label>
    <input
      v-model="order.name"
      type="text"
      required
      name="full-name"
      id="full-name"
      placeholder="bv. Max Debruin"
      autocomplete="name"
    />
  </div>

  <div class="form-group">
    <label for="full-address" style="display: block; margin-bottom: 4px;">
      Volledig adres
    </label>
    <input
      v-model="order.address"
      type="text"
      required
      name="full-address"
      id="full-address"
      placeholder="bv. Molenstraat 15, 9000 Gent"
      autocomplete="street-address"
    />
  </div>

  <button class="checkout-btn full-width" :disabled="!canCheckout" type="submit">
    Bestellen (€{{ totalPrice.toFixed(2) }})
  </button>

  <p v-if="error" class="error-msg">❌ Er is iets misgegaan. Probeer opnieuw.</p>
</form>
  </div>
</transition>

  <transition name="overlay-fade">
    <div v-if="orderConfirmed" class="modal-overlay"></div>
  </transition>

  <!-- Bevestiging met animatie ---->
  <transition name="card-pop" appear>
    <div v-if="orderConfirmed" class="confirmation-card">
    <div class="confirmation-icon">
  <svg width="80" height="80" viewBox="0 0 80 80">
    <circle class="checkmark-circle" cx="40" cy="40" r="38"/>
    <path class="checkmark-check" d="M25 42 L36 53 L56 32"/>
  </svg>
</div>
      <h2 class="confirmation-title">Bestelling bevestigd</h2>
      <p class="confirmation-text">Bedankt voor je bestelling, <strong>{{ order.name }}</strong>! Je ijsje is onderweg.</p>
      <ul class="confirmation-details">
        <li><span class="label">Ordernummer:</span> #{{ orderId }}</li>
        <li><span class="label">Smaak:</span> {{ flavorDisplay }}</li>
        <li><span class="label">Topping:</span> {{ toppingDisplay }}</li>
        <li><span class="label">Adres:</span> {{ order.address }}</li>
        <li><span class="label">Totaal:</span> €{{ lastOrder.price.toFixed(2) }}</li>
      </ul>
    <button class="btn-new-order" @click="resetOrder">
  Nieuwe bestelling
</button>
    </div>
  </transition>
</template>

  <script setup>
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import {
  Scene, PerspectiveCamera, WebGLRenderer,
  AmbientLight, DirectionalLight,
  Raycaster, Vector2, Color,
  Mesh, MeshBasicMaterial,
  LinearSRGBColorSpace, ACESFilmicToneMapping,
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
  const previewImage = ref(null);

  const order = reactive({ flavor: null, topping: null, quantity: 1, name: '', address: '' });
  const lastOrder = reactive({ price: 0 });


  const pricePerIce = 1.99;


  const flavors = [
    { name: 'Vanille', color: '#F9E79F', emoji: '🤍' },
    { name: 'Chocolade', color: '#5D3A00', emoji: '🍫' },
    { name: 'Aardbei', color: '#ff6fa5', emoji: '🍓' },
    { name: 'Karamel', color: '#c69c6d', emoji: '🍯' },
    { name: 'Geen', color: '#cccccc', emoji: '🚫' }
  ];
  const toppings = [
    { name: 'Geel', color: '#ffd900' },
    { name: 'Blauw', color: '#4dc6ff' },
    { name: 'Groen', color: '#32CD32' },
    { name: 'Geen', color: '#dddddd', emoji: '🚫' }
  ];

  // computed
  const totalPrice = computed(() => pricePerIce * order.quantity);
  const flavorDisplay = computed(() => order.flavor === 'Geen' ? 'Geen smaak' : order.flavor);
  const toppingDisplay = computed(() => order.topping === 'Geen' ? 'Geen topping' : order.topping);
  const canCheckout = computed(() => order.name && order.address && totalPrice.value > 0 && !error.value);

  // handlers
  function selectFlavor(name) {
    order.flavor = name;
    if (iceMesh) iceMesh.material.color = new Color(flavors.find(f => f.name === name).color);
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
  function prevStep() {
    step.value = 1;
    isIceSelected.value = true;
  }
  function backToConfig() {
    step.value = 1;
  }
  function incrementQty() { order.quantity++; }
  function decrementQty() { if (order.quantity > 1) order.quantity--; }

  watch(step, newStep => {
    if (newStep === 3) {
      renderer.render(scene, camera);
      previewImage.value = renderer.domElement.toDataURL();
    }
  });

  async function submitOrder() {
    error.value = false;
    try {
      const payload = {
        flavor: order.flavor,
        topping: order.topping,
        quantity: order.quantity,
        name: order.name,
        address: order.address,
        price: totalPrice.value
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

function resetOrder() {
  order.flavor        = null
  order.topping       = null
  order.quantity      = 1
  order.name          = ''
  order.address       = ''
  lastOrder.price     = 0

  orderConfirmed.value = false
  step.value           = 1
  isIceSelected.value  = false
  previewImage.value   = null

  // ─── 2) **Reset je 3D‑mod
  if (iceMesh) {
    iceMesh.material.color.set('#ffffff')      
  }
  Object.values(sprinkleMeshes).forEach(m => {
    if (m) m.visible = false                   
  })
}


  let scene, camera, renderer, controls, iceMesh, outlineMesh;
  const sprinkleMeshes = { Geel: null, Blauw: null, Groen: null };
  const pointer = new Vector2();
  const raycaster = new Raycaster();

  function handleCanvasClick(e) {
    if (step.value !== 1) return;
    const r = canvasContainer.value.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    isIceSelected.value = iceMesh && raycaster.intersectObject(iceMesh).length > 0;
  }

  function handleMouseMove(e) {
    if (!outlineMesh) return;
    const r = canvasContainer.value.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = iceMesh && raycaster.intersectObject(iceMesh).length > 0;
    outlineMesh.visible = hit;
    outlineMesh.material.opacity = hit ? 0.7 : 0;
  }

  onMounted(() => {
    scene = new Scene();
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2,0,1);
    camera.lookAt(0,0,0);
    renderer = new WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
   renderer.toneMappingExposure = 3.5;
    canvasContainer.value.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new AmbientLight(0xffffff,0.6));
    const dir = new DirectionalLight(0xffffff,0.8);
    dir.position.set(5,10,7.5);
    scene.add(dir);
    new RGBELoader().load(
      window.location.origin + '/textures/benjerrys_shop.hdr',
      tex => {
        tex.mapping = EquirectangularReflectionMapping;
        scene.background = scene.environment = tex;
      },
      undefined,
      err => console.warn(err)
    );
    new GLTFLoader().load(
      '/models/ice.glb',
      gltf => {
        const m = gltf.scene;
        m.scale.set(1.8,1.8,1.8);
        m.position.y = 0.1;
        scene.add(m);
        m.traverse(c => {
          if (!c.isMesh) return;
          if (c.name === 'Node-Mesh_1') {
            iceMesh = c;
            iceMesh.material.color = new Color('#ffffff');
            outlineMesh = new Mesh(
              c.geometry.clone(),
              new MeshBasicMaterial({ color:0x00bfff, transparent:true, opacity:0 })
            );
            outlineMesh.scale.copy(c.scale).multiplyScalar(1.05);
            c.add(outlineMesh);
          }
          if (c.name === 'Node-Mesh_2') sprinkleMeshes.Geel = c;
          if (c.name === 'Node-Mesh_3') sprinkleMeshes.Blauw = c;
          if (c.name === 'Node-Mesh_4') sprinkleMeshes.Groen = c;
        });
        Object.values(sprinkleMeshes).forEach(m => m && (m.visible = false));
      }
    );
    (function anim() {
      requestAnimationFrame(anim);
      controls.update();
      renderer.render(scene, camera);
    })();
  });
  </script>

  <style scoped>
  /* === Layout Positions ==== */
  .canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

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

  .ui-card,
  .confirmation {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: 10;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  }

  .confirmation {
    background: #fff;
    z-index: 30;
    padding: 2rem;
    text-align: center;
  }

  
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.3; }
  }

  @keyframes drop-in {
    from { transform: translate(-50%, -100%); opacity: 0; }
    to   { transform: translate(-50%, 0); opacity: 1; }
  }

  /* === Wood Sign Header === */
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

  /* === Decorative Lights === */
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

  /* === UI Card === */
  .ui-card {
    padding: 1.5rem;
    animation: slide-up 0.3s ease-out;
  }

  /* header met 2 kinderen: .header-left en .btn.primary */
  .ui-header {
    display: flex;
    justify-content: space-between; 
    align-items: center;
    margin-bottom: 1rem;
  }

  /* groep pijl + titel naast elkaar */
  .header-left {
    display: flex;
    align-items: center;
  }

  /* minder ruimte tussen pijl en titel */
  .btn.secondary {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    margin-right: 0.5rem;
  }

  /* === Options Buttons === */
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

  /* === Cart Fullcard === */
  .cart-fullcard {
    background: #fff;
    width: 68vw;
    max-height: 90vh;
    margin: 2vh auto;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: visible;
    z-index: 20;
  }

  .cart-fullcard h2 {
    margin-top: 0;
    font-size: 1.8rem;
    text-align: center;
  }

  .preview-wrapper {
    text-align: center;
    margin-bottom: 1rem;
  }

  .preview-image-large {
    max-width: 60%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* === Cart Table === */
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
    background: #00ffae;
    border: none;
    padding: 0 0.5rem;
    font-size: 1.2rem;
    cursor: pointer;
    margin: 0 0.25rem;
  }

  /* === Summary and Totals === */
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .summary-row a {
    color: #00bfff;
    text-decoration: none;
  }

  .totals div {
    margin-bottom: 0.25rem;
    text-align: right;
  }

  .grand-total {
    font-weight: bold;
  }

  /* === Forms === */
  .combined-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .form-group input {
    width: 98%;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  .full-width {
    width: 100%;
  }

  /* === Buttons === */
  .checkout-btn {
    padding: 1rem;
    background: #00ffae;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    border-radius: 8px;
  }

  .checkout-btn:disabled {
    background: #e0e0e0;
    cursor: not-allowed;
  }

  .btn.primary {
    background-color: #00c4cc;       /* Frisse aqua-tint */
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.6rem 1.4rem;
    border: none;
    border-radius: 12px;
    transition: background-color 0.2s ease, transform 0.15s ease;
  }

  .btn.primary:hover:not(:disabled) {
    background-color: #009fa6;       /* Donkerdere tint bij hover */
    transform: translateY(-1px);
  }

  .btn.primary:disabled {
    background-color: #c8f1f3;
    color: #666;
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* === Secondary Terug‑knop === */
  .btn.secondary {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    margin-right: 1rem;
  }

  /* === Error & Confirmation === */
  .error-msg {
    color: red;
    margin-top: 0.5rem;
    text-align: center;
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

  /* === Transitions === */
  .fade-enter-active {
    transition: all 0.3s ease;
  }

  .fade-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }

  /* Overlay achter de kaart */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 999;
  }

  /* De bevestigings‑kaart */
  .confirmation-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    z-index: 1000;
  }

  /* Icon bovenaan */
  .confirmation-icon {
    font-size: 3rem;
    color: #28a745;
    margin-bottom: 1rem;
  }

  /* Titel */
  .confirmation-title {
    font-size: 1.75rem;
    margin: 0.5rem 0;
    color: #333333;
  }

  /* Onderliggende tekst */
  .confirmation-text {
    font-size: 1rem;
    color: #555555;
    margin-bottom: 1.5rem;
  }

  /* Details in twee kolommen */
  .confirmation-details {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
    width: 100%;
  }
  .confirmation-details li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eeeeee;
  }
  .confirmation-details li:last-child {
    border-bottom: none;
  }
  .confirmation-details .label {
    font-weight: 600;
    color: #333333;
  }

  /* Knop onderaan */
  .btn-new-order {
    display: inline-block;
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    background: #007bff;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .btn-new-order:hover {
    background: #00b0b7;
  }

  /* Fade‑transition (blijft ongewijzigd) */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }

  /* Overlay achter de kaart - volledig wit */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #ffffff; /* geheel wit */
  z-index: 999;
}

/* De bevestigings‑kaart */
.confirmation-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  z-index: 1000;
}

/* Overlay Fade */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 999;
}

/* Card Fade-in (subtieler) */
.card-fade-enter-active {
  transition: opacity 0.4s ease;
}
.card-fade-enter-from {
  opacity: 0;
}
.card-fade-enter-to {
  opacity: 1;
}

.confirmation-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  z-index: 1000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  opacity: 0; /* initiële opacity */
  animation: fade-in 0.4s ease forwards;
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

/* Verbeterde luxe checkmark-animatie */
.confirmation-icon {
  margin-bottom: 1rem;
}

.checkmark-circle {
  stroke: #28a745;
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 251;
  stroke-dashoffset: 251;
  animation: draw-circle 0.8s ease-out forwards;
}

.checkmark-check {
  stroke: #28a745;
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: draw-check 0.6s ease-out 0.6s forwards;
}

@keyframes draw-circle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}

/* Tekststijling ongewijzigd */
.confirmation-title {
  font-size: 1.75rem;
  margin: 0.5rem 0;
  color: #333;
}
.confirmation-text {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.5rem;
}
.confirmation-details {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  text-align: left;
}
.confirmation-details li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.confirmation-details li:last-child {
  border-bottom: none;
}
.label {
  font-weight: 600;
  color: #00b0b7;
}

/* Knopstijling ongewijzigd */
.btn-new-order {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background:  #00c4cc;;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.modal-overlay {
  position: fixed;
  inset: 0;                      /* top:0; right:0; bottom:0; left:0; */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  /* inline z‑index: 19 in je template; als je dit liever in CSS zet: */
  z-index: 19;
}

/* Transition voor de overlay */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* Zorg dat de cart-fullcard boven de overlay zweeft */
.cart-fullcard {
  /* inline z‑index: 20 in je template; als je dit liever in CSS zet: */
  z-index: 20;
  position: relative; /* om de z-index effectief te maken */
}

.checkout-btn:hover:not(:disabled) {
  /* maak ’m 10% donkerder */
  filter: brightness(0.9);
  /* of hardcode een iets donkerdere tint:
     background-color: #00e6c0;
  */
  transition: filter 0.2s ease;
}

.btn-back {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #e5e7eb;     /* subtiele border */
  border-radius: 10px;           /* zachte hoeken */
  background: #fff;              /* clean */
  color: #374151;                /* neutraal donkergrijs */
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.btn-back .icon {
  width: 18px;
  height: 18px;
}

.btn-back:hover {
  background: #f9fafb;           /* subtiele hover */
  border-color: #d1d5db;
}

.btn-back:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.4); /* nette focusring */
}

.btn-back {
  margin-right: 16px; /* ruimte tussen knop en tekst */
}


</style>
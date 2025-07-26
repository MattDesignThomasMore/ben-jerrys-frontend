<template>
  <div class="customizer-card">
    <h2>🍦 Stel je eigen ijsje samen</h2>

    <!-- 3D-viewer bovenaan, smaak & topping worden meegegeven -->
    <Ice3DViewer :flavor="order.flavor" :topping="order.topping" />

    <!-- Formulier -->
    <form @submit.prevent="submitOrder" class="order-form">
      <label>
        Smaak:
        <select v-model="order.flavor" required>
          <option disabled value="">-- Kies een smaak --</option>
          <option>Vanille</option>
          <option>Chocolade</option>
          <option>Aardbei</option>
          <option>Karamel</option>
        </select>
      </label>

      <label>
        Topping:
        <select v-model="order.topping" required>
          <option disabled value="">-- Kies een topping --</option>
          <option>Sprinkles</option>
          <option>Chocoladesaus</option>
          <option>Noten</option>
        </select>
      </label>

      <label>
        Naam:
        <input type="text" v-model="order.name" required />
      </label>

      <label>
        Adres:
        <input type="text" v-model="order.address" required />
      </label>

      <label>
        Prijs (€):
        <input
          type="number"
          v-model.number="order.price"
          min="0.5"
          step="0.01"
          required
        />
      </label>

      <button type="submit">Bestel Nu</button>
    </form>

    <p v-if="success" class="success">✅ Bestelling verzonden!</p>
    <p v-if="error" class="error">❌ Er is iets misgegaan.</p>
  </div>
</template>

<script>
import Ice3DViewer from './Ice3DViewer.vue'

export default {
  name: 'IceCustomizer',
  components: { Ice3DViewer },
  data() {
    return {
      order: {
        flavor: '',
        topping: '',
        name: '',
        address: '',
        price: null
      },
      success: false,
      error: false
    }
  },
  methods: {
    async submitOrder() {
      this.success = this.error = false
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.order)
        })
        if (!res.ok) throw new Error()
        this.success = true
        this.order = { flavor: '', topping: '', name: '', address: '', price: null }
      } catch {
        this.error = true
      }
    }
  }
}
</script>

<style scoped>
.customizer-card {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.order-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}
.order-form label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}
.order-form input,
.order-form select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.order-form button {
  margin-top: 1rem;
  background: #ff6b6b;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.success {
  color: green;
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>

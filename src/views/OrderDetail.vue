<template>
  <div class="order-detail">
    <h1>📝 Bestelling Details</h1>

    <div class="field">
      <label>Klant:</label>
      <p>{{ order.name }}</p>
    </div>

    <div class="field">
      <label>Adres:</label>
      <p>{{ order.address }}</p>
    </div>

    <div class="field">
      <label>Smaak:</label>
      <p>{{ order.flavor }}</p>
    </div>

    <div class="field">
      <label>Topping:</label>
      <p>{{ order.topping }}</p>
    </div>

    <div class="field">
      <label>Prijs:</label>
      <p>€ {{ parseFloat(order.price).toFixed(2) }}</p>
    </div>

    <div class="field">
      <label>Status:</label>
      <select v-model="order.status" @change="updateStatus">
        <option value="te verwerken">Te verwerken</option>
        <option value="verzonden">Verzonden</option>
        <option value="geannuleerd">Geannuleerd</option>
      </select>
    </div>

    <div class="field">
      <label>Besteld op:</label>
      <p>{{ formatDate(order.createdAt) }}</p>
    </div>

    <router-link class="back-link" to="/admin">← Terug naar overzicht</router-link>
  </div>
</template>

<script>
export default {
  name: 'OrderDetail',
  data() {
    return {
      order: {}
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    const res = await fetch(`http://localhost:5000/api/orders/${id}`);
    this.order = await res.json();
  },
  methods: {
    formatDate(date) {
      if (!date) return 'Geen datum';
      return new Date(date).toLocaleString('nl-BE');
    },
    async updateStatus() {
      await fetch(`http://localhost:5000/api/orders/${this.order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: this.order.status })
      });
    }
  }
};
</script>

<style scoped>
.order-detail {
  max-width: 600px;
  margin: 50px auto;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  font-family: sans-serif;
}
.field {
  margin-bottom: 15px;
}
.field label {
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}
.field p, select {
  background: #f3f3f3;
  padding: 8px;
  border-radius: 6px;
}
select {
  border: 1px solid #ccc;
  width: 100%;
}
.back-link {
  display: inline-block;
  margin-top: 20px;
  text-decoration: none;
  color: #3498db;
}
</style>

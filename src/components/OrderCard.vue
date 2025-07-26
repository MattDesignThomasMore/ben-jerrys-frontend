<template>
  <div class="order-card">
    <h3>{{ order.name }}</h3>
    <p>{{ order.flavor }} met {{ order.topping }}</p>
    <p>Status:
      <select v-model="selectedStatus" @change="updateStatus">
        <option value="te verwerken">Te verwerken</option>
        <option value="verzonden">Verzonden</option>
        <option value="geannuleerd">Geannuleerd</option>
      </select>
    </p>
    <button @click="deleteOrder">🗑 Verwijderen</button>
    <router-link :to="`/admin/order/${order._id}`">🔎 Bekijk details</router-link>
  </div>
</template>

<script>
export default {
  name: 'OrderCard',
  props: {
    order: Object
  },
  data() {
    return {
      selectedStatus: this.order.status
    };
  },
  methods: {
    async updateStatus() {
      await fetch(`http://localhost:5000/api/orders/${this.order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: this.selectedStatus })
      });
      this.$emit('refresh');
    },
    async deleteOrder() {
      await fetch(`http://localhost:5000/api/orders/${this.order._id}`, {
        method: 'DELETE'
      });
      this.$emit('refresh');
    }
  }
};
</script>

<style scoped>
.order-card {
  background: #f3f3f3;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
}
</style>

<template>
  <div>
    <h2>📦 Alle bestellingen</h2>
    <OrderCard
      v-for="order in orders"
      :key="order._id"
      :order="order"
      @refresh="fetchOrders"
    />
  </div>
</template>

<script>
import OrderCard from './OrderCard.vue';

export default {
  name: 'OrderList',
  components: { OrderCard },
  data() {
    return {
      orders: []
    };
  },
  methods: {
    async fetchOrders() {
      const res = await fetch('http://localhost:5000/api/orders');
      this.orders = await res.json();
    }
  },
  mounted() {
    this.fetchOrders();
  }
};
</script>

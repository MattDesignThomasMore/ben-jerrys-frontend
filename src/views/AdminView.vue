<template>
  <div class="admin-view">
    <h1>🔧 Adminpaneel</h1>
    <OrderList />
  </div>
</template>

<script>
import OrderList from '../components/OrderList.vue';

export default {
  name: 'AdminView',
  components: { OrderList }
};
</script>

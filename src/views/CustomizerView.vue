<template>
  <div class="view-wrapper">
    <IceCustomizer />
  </div>
</template>

<script>
import IceCustomizer from '@/components/IceCustomizer.vue';

export default {
  name: 'CustomizerView',
  components: { IceCustomizer }
};
</script>

<style scoped>
.view-wrapper {
  padding: 2rem;
  background: #f0f0f5;
  min-height: 100vh;
}
</style>

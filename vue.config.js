// vue.config.js
const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  // Zorg dat BASE_URL altijd correct wijst naar public/
  publicPath: process.env.NODE_ENV === 'production'
    ? (process.env.BASE_URL || '/')
    : '/',

  // Transpile GLTFLoader uit three/examples
  transpileDependencies: [
    /three[\\/]examples[\\/]jsm[\\/]loaders[\\/]GLTFLoader\.js$/
  ]
});

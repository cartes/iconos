<template>
  <button
    :class="['base-button', variant, { loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    <span :class="{ 'text-hidden': loading }">
        <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  loading: Boolean,
  disabled: Boolean,
});
defineEmits(['click']);
</script>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  gap: 0.5rem;
}

.primary {
  background: var(--grad-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-premium);
  filter: brightness(1.1);
}

.secondary {
  background: var(--slate-100);
  color: var(--slate-900);
}

.secondary:hover:not(:disabled) {
  background: var(--slate-200);
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.spinner {
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

.secondary .spinner {
  border-top-color: var(--primary-600);
  border-color: rgba(0, 0, 0, 0.1);
}

.text-hidden {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

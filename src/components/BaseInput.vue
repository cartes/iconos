<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="label">{{ label }}</label>
    <div class="input-container">
      <slot name="prefix"></slot>
      <input :type="inputType" :value="modelValue" :placeholder="placeholder" :required="required" class="input"
        :class="{ 'has-suffix': isPassword }" @input="$emit('update:modelValue', $event.target.value)"
        :minlength="minlength" />
      <button v-if="isPassword" type="button" class="password-toggle" @click="togglePassword" tabindex="-1"
        :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
        <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="eye-icon">
          <path
            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24">
          </path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-icon">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  required: Boolean,
  error: String,
  minlength: Number
});
defineEmits(['update:modelValue']);

const showPassword = ref(false);

const isPassword = computed(() => props.type === 'password');

const inputType = computed(() => {
  if (isPassword.value) {
    return showPassword.value ? 'text' : 'password';
  }
  return props.type;
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-main);
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.has-suffix {
  padding-right: 2.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--slate-400);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.password-toggle:hover {
  color: var(--slate-700);
  background: var(--slate-100);
}

.eye-icon {
  width: 20px;
  height: 20px;
}

.error-msg {
  font-size: 0.75rem;
  color: var(--error-500);
}
</style>

<template>
    <div class="base-input-wrapper">
        <label v-if="label" class="label">{{ label }}</label>
        <div class="input-container">
            <slot name="prefix"></slot>
            <input :type="type" :value="modelValue" :placeholder="placeholder" :required="required" class="input"
                @input="$emit('update:modelValue', $event.target.value)" />
        </div>
        <span v-if="error" class="error-msg">{{ error }}</span>
    </div>
</template>

<script setup>
defineProps({
    modelValue: [String, Number],
    label: String,
    type: {
        type: String,
        default: 'text',
    },
    placeholder: String,
    required: Boolean,
    error: String,
});
defineEmits(['update:modelValue']);
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

.error-msg {
    font-size: 0.75rem;
    color: var(--error-500);
}
</style>

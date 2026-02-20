<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
                <Transition name="slide-up">
                    <div v-if="show" class="modal-content">
                        <header class="modal-header">
                            <h3>{{ title }}</h3>
                            <button @click="$emit('close')" class="close-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <div class="modal-body">
                            <slot></slot>
                        </div>

                        <footer class="modal-footer" v-if="$slots.footer">
                            <slot name="footer"></slot>
                        </footer>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
defineProps({
    show: Boolean,
    title: String,
});
defineEmits(['close']);
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 1000;
}

.modal-content {
    background: var(--color-surface);
    width: 100%;
    max-width: 480px;
    border-radius: var(--radius-xl);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
}

.modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
}

.close-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: var(--radius-md);
    transition: all 0.2s;
    display: flex;
}

.close-btn:hover {
    background: var(--slate-100);
    color: var(--slate-900);
}

.modal-body {
    padding: 1.5rem;
    overflow-y: auto;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-border);
    background: var(--slate-50);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-bottom-left-radius: var(--radius-xl);
    border-bottom-right-radius: var(--radius-xl);
}

@media (prefers-color-scheme: dark) {
    .modal-footer {
        background: rgba(255, 255, 255, 0.02);
    }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(20px);
}
</style>

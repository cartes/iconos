<template>
    <BaseModal :show="show" title="Cambiar Contraseña" @close="$emit('close')">
        <form @submit.prevent="handleSubmit" class="modal-form">
            <BaseInput label="Contraseña Actual" v-model="form.clave" type="password"
                placeholder="Ingresa tu contraseña actual" required />

            <BaseInput label="Nueva Contraseña" v-model="form.nuevaClave" type="password"
                placeholder="Mínimo 8 caracteres" required />

            <BaseInput label="Confirmar Nueva Contraseña" v-model="form.confirmarClave" type="password"
                placeholder="Repite la nueva contraseña" required />

            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <div class="modal-actions">
                <BaseButton type="button" variant="secondary" @click="$emit('close')">Cancelar</BaseButton>
                <BaseButton type="submit" :loading="saving">Cambiar Contraseña</BaseButton>
            </div>
        </form>
    </BaseModal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { apiRequest } from '@/api/service';
import BaseModal from '@/components/BaseModal.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['close', 'success']);

const form = reactive({
    clave: '',
    nuevaClave: '',
    confirmarClave: ''
});

const saving = ref(false);
const error = ref('');

// Limpiar formulario cuando se abre/cierra
watch(() => props.show, (newVal) => {
    if (!newVal) {
        form.clave = '';
        form.nuevaClave = '';
        form.confirmarClave = '';
        error.value = '';
    }
});

const handleSubmit = async () => {
    error.value = '';

    if (form.nuevaClave.length < 8) {
        error.value = 'La nueva contraseña debe tener al menos 8 caracteres.';
        return;
    }

    if (form.nuevaClave !== form.confirmarClave) {
        error.value = 'Las contraseñas no coinciden.';
        return;
    }

    saving.value = true;

    // Llamada a la API que existe en Laravel AuthController
    const res = await apiRequest('cambiar-clave', {
        method: 'POST',
        data: {
            clave: form.clave,
            nuevaClave: form.nuevaClave
        }
    });

    saving.value = false;

    if (res.success) {
        emit('success', res.mensaje || 'Contraseña actualizada exitosamente');
        emit('close');
    } else {
        error.value = res.error || 'Ocurrió un error al cambiar la contraseña';
    }
};
</script>

<style scoped>
.error-message {
    color: var(--error-600);
    font-size: 0.875rem;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius-md);
    text-align: center;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}
</style>

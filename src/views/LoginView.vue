<template>
    <div class="login-page">
        <div class="glass-card">
            <div class="logo-section">
                <div class="logo-orb">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <h1>{{ needsBootstrap ? 'Configuración Inicial' : 'Bienvenido' }}</h1>
                <p>{{ needsBootstrap ? 'Configura el primer administrador' : 'Gestiona tus activos digitales' }}</p>
            </div>

            <div v-if="error" class="alert error-alert">
                {{ error }}
            </div>

            <form @submit.prevent="handleSubmit" class="login-form">
                <template v-if="needsBootstrap">
                    <BaseInput label="Nombre Completo" v-model="form.nombre" placeholder="Juan Pérez" required />
                </template>

                <BaseInput label="Email" type="email" v-model="form.email" placeholder="email@ejemplo.com" required />

                <BaseInput label="Contraseña" type="password" v-model="form.clave" placeholder="••••••••" required
                    :minlength="8" />

                <template v-if="needsBootstrap">
                    <BaseInput label="Confirmar Contraseña" type="password" v-model="form.claveConfirm"
                        placeholder="••••••••" required
                        :error="claveMismatched ? 'Las contraseñas no coinciden' : ''" />
                </template>

                <BaseButton type="submit" class="submit-btn" :loading="loading">
                    {{ needsBootstrap ? 'Crear Administrador' : 'Iniciar Sesión' }}
                </BaseButton>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { apiRequest } from '@/api/service';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const needsBootstrap = ref(false);
const loading = ref(false);
const error = ref(null);

const form = reactive({
    email: '',
    clave: '',
    nombre: '',
    claveConfirm: ''
});

const claveMismatched = computed(() => {
    return needsBootstrap.value && form.claveConfirm && form.clave !== form.claveConfirm;
});

onMounted(async () => {
    const status = await authStore.checkBootstrap();
    if (status.necesitaBootstrap) {
        needsBootstrap.value = true;
    }
});

const handleSubmit = async () => {
    if (claveMismatched.value) return;

    loading.value = true;
    error.value = null;

    try {
        if (needsBootstrap.value) {
            const res = await apiRequest('primer-admin', {
                method: 'POST',
                data: {
                    email: form.email,
                    nombre: form.nombre,
                    clave: form.clave
                }
            });
            if (res.success) {
                needsBootstrap.value = false;
                error.value = '✓ Admin creado. Inicia sesión.';
            } else {
                error.value = res.error;
            }
        } else {
            const res = await authStore.login(form.email, form.clave);
            if (res.success) {
                if (authStore.user.rol === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/portal');
                }
            } else {
                error.value = res.error;
            }
        }
    } catch (e) {
        error.value = 'Error de conexión';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--grad-dark);
    padding: 1.5rem;
}

.glass-card {
    width: 100%;
    max-width: 440px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-xl);
    padding: 3rem 2.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.logo-section {
    text-align: center;
    margin-bottom: 2.5rem;
}

.logo-orb {
    width: 64px;
    height: 64px;
    background: var(--grad-primary);
    border-radius: 50%;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.logo-orb .icon {
    width: 32px;
    height: 32px;
}

h1 {
    font-size: 1.875rem;
    color: white;
    margin-bottom: 0.5rem;
}

p {
    color: var(--slate-400);
    font-size: 0.9375rem;
}

.login-form {
    display: flex;
    flex-direction: column;
}

.submit-btn {
    margin-top: 1rem;
    width: 100%;
}

.alert {
    padding: 0.875rem 1rem;
    border-radius: var(--radius-md);
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    text-align: center;
}

.error-alert {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>

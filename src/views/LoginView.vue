<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 p-6">
        <div class="w-full max-w-md bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-2xl">
            <div class="text-center mb-10">
                <div class="w-16 h-16 bg-grad-primary rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {{ needsBootstrap ? 'Configuración Inicial' : 'Bienvenido' }}
                </h1>
                <p class="text-slate-600 dark:text-slate-400 text-sm">
                    {{ needsBootstrap ? 'Configura el primer administrador' : 'Gestiona tus activos digitales' }}
                </p>
            </div>

            <div v-if="error" class="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 rounded-lg p-3.5 mb-6 text-sm text-center">
                {{ error }}
            </div>

            <form @submit.prevent="handleSubmit" class="flex flex-col">
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

                <BaseButton type="submit" class="w-full mt-4" :loading="loading">
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
import { centralApiRequest } from '@/api/service';
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
            const res = await centralApiRequest('primer-admin', {
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
                const rol = authStore.user.rol;
                if (rol === 'super-admin') {
                    router.push('/admin/empresas');
                } else if (rol === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/portal');
                }
            } else {
                error.value = res.error;
            }
        }
    } catch {
        error.value = 'Error de conexión';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* All styles transitioned to Tailwind v4 */
</style>

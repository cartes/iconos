<template>
    <header class="topbar">
        <div class="logo-area">
            <div class="logo-orb-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            </div>
            <span class="brand-name">Sistema de Gestión</span>
        </div>

        <div class="user-info">
            <button @click="toggleTheme" class="icon-btn theme-btn" :title="isDark ? 'Modo Claro' : 'Modo Oscuro'">
                <!-- Sun Icon -->
                <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="19.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <!-- Moon Icon -->
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            </button>

            <div class="user-details">
                <span class="user-name">{{ auth.user?.nombre }}</span>
                <span class="user-role">{{ auth.user?.rol === 'admin' ? 'Administrador' : 'Usuario' }}</span>
            </div>

            <button @click="logout" class="logout-btn" title="Cerrar Sesión">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <span class="logout-text">Cerrar Sesión</span>
            </button>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const isDark = ref(false);

const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateTheme();
};

const updateTheme = () => {
    if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

onMounted(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        isDark.value = savedTheme === 'dark';
    } else {
        // Default MUST be Light Theme as per requirements
        isDark.value = false;
        localStorage.setItem('theme', 'light');
    }
    updateTheme();
});

const logout = () => {
    auth.logout();
    router.push('/login');
};

</script>

<style scoped>
.topbar {
    height: 64px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-sm);
}

.logo-area {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo-orb-sm {
    width: 32px;
    height: 32px;
    background: var(--grad-primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.logo-orb-sm svg {
    width: 18px;
    height: 18px;
}

.brand-name {
    font-weight: 700;
    font-size: 1.125rem;
    color: var(--slate-900);
}

@media (prefers-color-scheme: dark) {
    .brand-name {
        color: white;
    }
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-main);
}

.user-role {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--slate-500);
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 0.5rem;
}

.theme-btn:hover {
    background: var(--slate-100);
    color: var(--slate-800);
}

.theme-btn svg {
    width: 18px;
    height: 18px;
}

:global(.dark) .theme-btn:hover {
    background: var(--slate-800);
    color: var(--slate-200);
}

.logout-btn {
    background: rgba(239, 68, 68, 0.1);
    border: none;
    color: var(--error-600);
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    margin-left: 0.5rem;
}

.logout-btn svg {
    width: 18px;
    height: 18px;
}

.logout-text {
    display: inline;
}

.logout-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: var(--error-700);
}

@media (max-width: 640px) {
    .logout-text {
        display: none;
    }

    .logout-btn {
        padding: 0.5rem;
    }
}
</style>

<template>
    <div class="concepts-container app-container page-content pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                IDEAS
            </span>
        </div>

        <div class="page-header">
            <p class="header-subtitle">INSPIRATION</p>
        </div>
        
        <div class="content-scroll">
            <div v-if="state.loading" class="loading-state">
                <div class="spinner"></div>
            </div>
            <div v-else-if="state.concepts.length === 0" class="empty-state">
                <div class="empty-icon-wrapper">
                    <i data-lucide="image" class="empty-icon"></i>
                </div>
                <p class="empty-text">暂无灵感，快去收集吧</p>
            </div>
            <div v-else class="concepts-grid">
                <div v-for="(concept, index) in state.concepts" :key="concept.id" 
                    @click="actions.navigate('concept-detail', { id: concept.id })" 
                    class="concept-card"
                    :class="[index % 2 === 0 ? 'even-item' : 'odd-item']"
                    :style="{ animationDelay: `${index * 50}ms` }">
                    
                    <!-- Cover Image -->
                    <img v-if="helpers.getConceptCover(concept)" :src="helpers.getConceptCover(concept)" class="concept-cover" />
                    <div v-else class="concept-cover-placeholder">
                        <i data-lucide="image"></i>
                    </div>

                    <!-- Source Tag -->
                    <div class="source-tag">
                        {{ helpers.getSourceText(concept.source_type) }}
                    </div>

                    <!-- Bottom Content Overlay -->
                    <div class="concept-overlay">
                        <h4 class="concept-title">{{ concept.title }}</h4>
                        <p class="concept-style">{{ concept.style || 'INSPIRATION' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>

<style scoped lang="scss">
.concepts-container {
    padding-top: 4rem;
}

.massive-bg-wrapper {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    user-select: none;
    overflow: hidden;
    z-index: 0;
}

.massive-text {
    font-size: 28vh;
    font-weight: 900;
    color: rgba($color-black, 0.02);
    letter-spacing: -0.05em;
    white-space: nowrap;
    transform: rotate(-90deg) scale(1.8);
    transform-origin: center;
    
    @media (min-width: 768px) {
        transform: rotate(0) scale(1);
    }
}

.page-header {
    padding: 1rem 1.5rem;
    position: relative;
    z-index: 10;
}

.header-subtitle {
    font-size: 10px;
    font-weight: bold;
    color: rgba($color-black, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
    margin-left: 0.25rem;
}

.content-scroll {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 8rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    scroll-behavior: smooth;
    position: relative;
    z-index: 10;
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5rem 0;
}

.spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid $color-black;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8rem 0;
    opacity: 0.4;
}

.empty-icon-wrapper {
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    border: 1px solid rgba($color-black, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    background: rgba($color-black, 0.05);
}

.empty-icon {
    width: 2.5rem;
    height: 2.5rem;
    color: rgba($color-black, 0.4);
}

.empty-text {
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.concepts-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
    
    @media (min-width: 640px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.5rem;
    }
    
    @media (min-width: 1024px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 2rem;
    }
}

.concept-card {
    position: relative;
    background: $color-black;
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    aspect-ratio: 3/4;

    @media (min-width: 640px) {
        border-radius: 2rem;
    }

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.12);
        
        .concept-cover {
            transform: scale(1.05);
            opacity: 1;
        }
        
        .concept-overlay {
            background: linear-gradient(to top, rgba($color-black, 0.95) 0%, rgba($color-black, 0.6) 50%, transparent 100%);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    /* Create staggered layout effect for mobile only */
    @media (max-width: 639px) {
        &.odd-item {
            margin-top: 2rem;
        }
    }
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.concept-cover {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
    opacity: 0.85;
}

.concept-cover-placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-black;
    color: rgba($color-white, 0.2);

    i {
        width: 3rem;
        height: 3rem;
        opacity: 0.5;
        transition: all 0.5s ease;
    }
    
    .concept-card:hover & i {
        opacity: 1;
        transform: scale(1.1);
        color: rgba($color-white, 0.4);
    }
}

.source-tag {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba($color-white, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: $color-black;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    z-index: 10;
    
    .concept-card:hover & {
        background: $color-white;
        transform: scale(1.05);
    }
}

.concept-overlay {
    position: absolute;
    inset: auto 0 0 0;
    padding: 1.5rem 1.25rem 1.25rem;
    background: linear-gradient(to top, rgba($color-black, 0.9) 0%, rgba($color-black, 0.4) 60%, transparent 100%);
    transition: all 0.4s ease;
    z-index: 10;
}

.concept-title {
    font-weight: 900;
    color: $color-white;
    font-size: 1.125rem;
    line-height: 1.3;
    letter-spacing: -0.025em;
    margin-bottom: 0.35rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);

    .concept-card:hover & {
        transform: translateY(-4px);
    }
}

.concept-style {
    font-size: 10px;
    font-weight: bold;
    color: rgba($color-white, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: 50ms;

    .concept-card:hover & {
        transform: translateY(-4px);
        color: rgba($color-white, 0.9);
    }
}
</style>

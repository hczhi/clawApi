<template>
    <div class="concepts-container pb-safe">
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
    @extend .app-container;
    @extend .page-content;
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
    gap: 1rem;
}

.concept-card {
    position: relative;
    background: $color-black;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: all 0.5s ease;
    animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

    &:active {
        transform: scale(0.95);
    }

    &.even-item {
        aspect-ratio: 4/5;
    }

    &.odd-item {
        aspect-ratio: 3/4;
        margin-top: 1.5rem;
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
    transition: transform 1.5s ease-out, opacity 1.5s ease-out;
    opacity: 0.9;

    .concept-card:hover & {
        transform: scale(1.1);
        opacity: 1;
    }
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
        width: 2.5rem;
        height: 2.5rem;
    }
}

.source-tag {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: rgba($color-white, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: $color-black;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.concept-overlay {
    position: absolute;
    inset: auto 0 0 0;
    padding: 1rem;
    padding-top: 4rem;
    background: linear-gradient(to top, rgba($color-black, 0.95), rgba($color-black, 0.5), transparent);
}

.concept-title {
    font-weight: bold;
    color: $color-white;
    font-size: 14px;
    line-height: 1.25;
    margin-bottom: 0.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: transform 0.3s ease;

    .concept-card:hover & {
        transform: translateY(-0.25rem);
    }
}

.concept-style {
    font-size: 9px;
    font-weight: bold;
    color: rgba($color-white, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: transform 0.3s ease;
    transition-delay: 75ms;

    .concept-card:hover & {
        transform: translateY(-0.25rem);
    }
}
</style>

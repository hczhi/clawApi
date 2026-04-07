<template>
    <div class="concept-detail-container pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                DETAILS
            </span>
        </div>

        <div v-if="state.currentConcept" class="detail-content">
            <!-- Hero Image -->
            <div v-if="state.currentConceptImages.length > 0" class="hero-image-wrapper">
                <img :src="state.currentConceptImages[0]" class="hero-image" />
                <!-- Gradient Overlay -->
                <div class="hero-gradient"></div>
            </div>
            <div v-else class="hero-spacer"></div>

            <div class="content-section" :class="{'has-hero': state.currentConceptImages.length > 0}">
                <!-- Content Card -->
                <div class="info-card">
                    
                    <!-- Tags -->
                    <div class="tags-list">
                        <span class="tag tag-primary">{{ helpers.getSourceText(state.currentConcept.source_type) }}</span>
                        <span class="tag tag-secondary">{{ state.currentConcept.style || 'INSPIRATION' }}</span>
                        <span v-if="state.currentConcept.decoration_area" class="tag tag-secondary">{{ state.currentConcept.decoration_area }}</span>
                    </div>
                    
                    <!-- Title -->
                    <h2 class="concept-title">{{ state.currentConcept.title }}</h2>
                    
                    <!-- Description -->
                    <div v-if="state.currentConcept.description" class="concept-description">
                        <p>{{ state.currentConcept.description }}</p>
                    </div>

                    <!-- Link -->
                    <div v-if="state.currentConcept.reference_link" class="reference-link">
                        <a :href="state.currentConcept.reference_link" target="_blank">
                            <span>查看原链接</span>
                            <i data-lucide="arrow-up-right"></i>
                        </a>
                    </div>
                </div>

                <!-- All Images -->
                <div v-if="state.currentConceptImages.length > 0" class="images-list">
                    <div v-for="(img, idx) in state.currentConceptImages" :key="idx" class="image-item">
                        <img :src="img" />
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button @click="actions.navigate('concept-form', { mode: 'edit', id: state.currentConcept.id })" class="btn-edit">
                        编辑参考
                    </button>
                    <button @click="actions.deleteConcept" class="btn-delete">
                        DEL
                    </button>
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
.concept-detail-container {
    @extend .app-container;
    @extend .page-content;
    padding-bottom: 8rem;
    overflow-y: auto;
    scroll-behavior: smooth;
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

.detail-content {
    position: relative;
    z-index: 10;
}

.hero-image-wrapper {
    width: 100%;
    height: 45vh;
    position: relative;
    overflow: hidden;
    background: rgba($color-black, 0.05);
}

.hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba($color-black, 0.1), transparent, $color-white);
}

.hero-spacer {
    width: 100%;
    height: 8rem;
    padding-top: 4rem;
}

.content-section {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    position: relative;

    &.has-hero {
        margin-top: -6rem;
    }
}

.info-card {
    background: rgba($color-white, 0.9);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 2.5rem;
    padding: 2rem;
    box-shadow: 0 30px 60px rgba(0,0,0,0.08);
    border: 1px solid rgba($color-black, 0.05);
    margin-bottom: 2rem;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.tag {
    font-size: 10px;
    font-weight: 900;
    padding: 0.375rem 1rem;
    border-radius: 9999px;
    letter-spacing: 0.15em;
    text-transform: uppercase;

    &.tag-primary {
        background: $color-black;
        color: $color-white;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    &.tag-secondary {
        background: rgba($color-black, 0.05);
        color: rgba($color-black, 0.6);
    }
}

.concept-title {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    margin-bottom: 1.5rem;
    line-height: 1.15;
}

.concept-description {
    margin-bottom: 2rem;
    
    p {
        font-size: 15px;
        color: rgba($color-black, 0.7);
        line-height: 1.625;
        white-space: pre-wrap;
        font-weight: 500;
    }
}

.reference-link {
    padding-top: 1.5rem;
    border-top: 1px solid rgba($color-black, 0.05);

    a {
        display: inline-flex;
        align-items: center;
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: $color-black;
        transition: color 0.3s ease;

        &:hover {
            color: rgba($color-black, 0.5);
        }

        span {
            border-bottom: 1px solid rgba($color-black, 0.2);
            padding-bottom: 0.125rem;
            transition: border-color 0.3s ease;

            a:hover & {
                border-color: rgba($color-black, 0.5);
            }
        }

        i {
            width: 1rem;
            height: 1rem;
            margin-left: 0.25rem;
            transition: transform 0.3s ease;

            a:hover & {
                transform: translate(0.125rem, -0.125rem);
            }
        }
    }
}

.images-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2.5rem;
}

.image-item {
    position: relative;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 15px 30px rgba(0,0,0,0.05);
    border: 1px solid rgba($color-black, 0.05);
    background: rgba($color-black, 0.05);

    img {
        width: 100%;
        object-fit: cover;
        display: block;
    }
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

.btn-edit {
    flex: 1;
    background: $color-black;
    color: $color-white;
    padding: 1rem 0;
    border-radius: 9999px;
    font-weight: bold;
    font-size: 15px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    border: none;

    &:active {
        transform: scale(0.95);
    }
}

.btn-delete {
    width: 4rem;
    flex-shrink: 0;
    background: $color-white;
    color: #ff3b30;
    border: 1px solid rgba($color-black, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    font-size: 12px;
    font-weight: 900;

    &:active {
        transform: scale(0.95);
    }
}
</style>

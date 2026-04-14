<template>
    <div class="app-container page-content" @scroll="helpers.handleScroll">
        
        <!-- Navbar: Hidden/Minimal -->
        <header class="home-header">
            <div class="home-date">{{ currentDate }}</div>
        </header>

        <!-- Hero Section (Screen 1) -->
        <div class="home-hero">
            
            <!-- Huge Background Text -->
            <div class="home-bg-text">
                <span>HJHome</span>
            </div>

            <!-- Main Floating Image -->
            <div class="home-main-image">
                <img :src="state.currentHeroImage" />
                <div class="overlay"></div>
            </div>

            <!-- Left Navigation Menu -->
            <div class="home-nav-menu">
                <div class="menu-title">Menu</div>
                
                <button @click.stop.prevent="actions.navigate('expenses')" class="menu-item">
                    <span class="indicator"></span>
                    账单
                </button>
                
                <button @click.stop.prevent="actions.navigate('concepts')" class="menu-item">
                    <span class="indicator"></span>
                    灵感
                </button>
                
                <button @click.stop.prevent="actions.navigate('purchase-plans')" class="menu-item">
                    <span class="indicator"></span>
                    清单
                </button>

                <button @click.stop.prevent="actions.navigate('memos')" class="menu-item">
                    <span class="indicator"></span>
                    备忘
                </button>
                
                <button @click.stop.prevent="actions.navigate('myhome')" class="menu-item">
                    <span class="indicator"></span>
                    我的家
                </button>
            </div>

            <!-- Bottom Price / Total Expenses -->
            <div class="home-bottom-stats">
                <div class="amount">
                    <span class="currency">¥</span>
                    {{ helpers.formatAmount(state.totalExpenses) }}
                </div>
                <div class="label">Total Exp.</div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';
import { useAppStore } from '../store.js';

const { state, actions, helpers, computedProps } = useAppStore();
const currentDate = computedProps.currentDate;

onMounted(() => {
    nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
    });
});
</script>

<style scoped lang="scss">
.home-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  mix-blend-mode: difference;
  color: $color-pure-white;
  pointer-events: none;

  .home-date {
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #333; // Mix blend will adjust this
  }
}

.home-hero {
  position: relative;
  min-height: 100svh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.home-bg-text {
  @include absolute-inset;
  @include flex-center;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
  z-index: 0;

  span {
    font-size: 28vh;
    font-weight: 900;
    color: rgba($color-black, 0.02);
    letter-spacing: -0.05em;
    white-space: nowrap;
    transform: rotate(-90deg) scale(1.8);
    transform-origin: center;
    animation: fadeInSlow 2s ease-out forwards;

    @media (min-width: 768px) {
      transform: rotate(0) scale(1);
    }
  }
}

.home-main-image {
  position: relative;
  z-index: 10;
  width: 60%;
  max-width: 24rem;
  aspect-ratio: 3 / 4;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.12);
  transition: transform 1.5s ease-out;
  animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  &:hover {
    transform: scale(1.05) translateY(-8px);
    
    img {
      transform: scale(1.1);
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 10s ease-out;
  }

  .overlay {
    @include absolute-inset;
    border: 1px solid rgba($color-pure-white, 0.2);
    border-radius: 2rem;
    pointer-events: none;
  }
}

.home-nav-menu {
  position: absolute;
  left: 1.5rem;
  top: 10rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 20;
  animation: slideRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  pointer-events: auto;

  .menu-title {
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.1em;
    color: rgba($color-black, 0.3);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .menu-item {
    text-align: left;
    font-size: 1.125rem;
    font-weight: bold;
    letter-spacing: 0.1em;
    color: rgba($color-black, 0.4);
    transition: color 0.3s;
    position: relative;
    z-index: 50;

    &:hover {
      color: $color-black;

      .indicator {
        opacity: 1;
      }
    }

    .indicator {
      position: absolute;
      left: -1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.5rem;
      height: 2px;
      background-color: $color-black;
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
}

.home-bottom-stats {
  position: absolute;
  bottom: 6rem;
  left: 2rem;
  z-index: 20;
  animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  .amount {
    font-size: 2.25rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    display: flex;
    align-items: baseline;
    gap: 0.25rem;

    .currency {
      font-size: 1.25rem;
      font-weight: bold;
      opacity: 0.3;
    }
  }

  .label {
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.2em;
    color: $color-primary;
    text-transform: uppercase;
    margin-top: 0.25rem;
    margin-left: 0.25rem;
  }
}

@keyframes fadeInSlow {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

<template>
    <div class="absolute inset-0 overflow-y-auto scroll-smooth page-content bg-[#FAFAFA] text-[#111111]" @scroll="helpers.handleScroll">
        
        <!-- Navbar: Hidden/Minimal -->
        <header class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 mix-blend-difference text-white pointer-events-none">
            <!-- <button class="w-10 h-10 flex flex-col justify-center gap-1.5 pointer-events-auto hover:gap-2 transition-all group">
                <span class="w-6 h-[1.5px] bg-current transition-all group-hover:w-8"></span>
                <span class="w-4 h-[1.5px] bg-current transition-all group-hover:w-6"></span>
            </button> -->
            <div class="text-[10px] font-bold tracking-[0.2em] uppercase" style="color: #333;">{{ currentDate }}</div>
            <!-- <button class="w-10 h-10 flex justify-end items-center pointer-events-auto hover:scale-110 transition-transform">
                <i data-lucide="bell" class="w-5 h-5"></i>
            </button> -->
        </header>

        <!-- Hero Section (Screen 1) -->
        <div class="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden">
            
            <!-- Huge Background Text -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                <span class="text-[28vh] font-black text-black/[0.02] tracking-tighter whitespace-nowrap rotate-[-90deg] md:rotate-0 origin-center select-none scale-[1.8] md:scale-100 animate-fade-in-slow">
                    HJHome
                </span>
            </div>

            <!-- Main Floating Image -->
            <div class="relative z-10 w-[60%] max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-transform duration-[1.5s] ease-out hover:scale-105 hover:-translate-y-2 group animate-slide-up">
                <img :src="state.currentHeroImage" class="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" />
                <div class="absolute inset-0 border border-white/20 rounded-[2rem] pointer-events-none"></div>
            </div>

            <!-- Left Navigation Menu -->
            <div class="absolute left-6 top-40 -translate-y-1/2 flex flex-col gap-6 z-20 animate-slide-right pointer-events-auto">
                <div class="text-[10px] font-bold tracking-widest text-black/30 uppercase mb-2">Menu</div>
                
                <button @click.stop.prevent="actions.navigate('expenses')" class="text-left text-lg font-bold tracking-widest text-black/40 hover:text-black transition-colors relative z-50 cursor-pointer group">
                    <span class="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-[2px] bg-black opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    账单
                </button>
                
                <button @click.stop.prevent="actions.navigate('concepts')" class="text-left text-lg font-bold tracking-widest text-black/40 hover:text-black transition-colors relative z-50 cursor-pointer group">
                    <span class="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-[2px] bg-black opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    灵感
                </button>
            </div>

            <!-- Right Progress (Like Color Selector) -->
            <!-- <div class="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20 items-end animate-slide-left">
                <div class="text-[10px] font-bold tracking-widest text-black/30 uppercase mb-2 mr-2">Prog</div>
                <div class="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-lg hover:scale-110 transition-transform cursor-default">
                    <span class="text-sm font-black tracking-tighter">{{ state.renovationProgress }}<span class="text-[8px] text-black/50 font-bold">%</span></span>
                </div>
                <div class="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-black text-white hover:bg-white hover:text-black hover:border-black transition-colors cursor-pointer">
                    <i data-lucide="check" class="w-4 h-4"></i>
                </div>
            </div> -->

            <!-- Bottom Price / Total Expenses -->
            <div class="absolute bottom-24 left-8 z-20 animate-fade-in-up">
                <div class="text-4xl font-black tracking-tighter flex items-baseline gap-1">
                    <span class="text-xl font-bold opacity-30">¥</span>
                    {{ helpers.formatAmount(state.totalExpenses) }}
                </div>
                <div class="text-[10px] font-bold tracking-[0.2em] text-[#A1D029] uppercase mt-1 ml-1">Total Exp.</div>
            </div>

            <!-- Swipe Down Indicator -->
            <!-- <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 animate-fade-in-up" style="animation-delay: 0.3s;">
                <span class="text-[9px] font-bold tracking-widest text-black/40 uppercase">Swipe down to recent</span>
                <div class="w-8 h-12 rounded-full bg-black flex items-center justify-center animate-bounce shadow-xl cursor-pointer hover:bg-[#A1D029] transition-colors" @click="scrollToRecent">
                    <i data-lucide="chevron-down" class="w-4 h-4 text-white"></i>
                </div>
            </div> -->
        </div>

        <!-- Recent Section -->
        <div id="recent-section" class="relative bg-white z-30 min-h-[50vh] px-6 py-16 rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
            <div class="max-w-md mx-auto">
                <div class="flex items-end justify-between mb-10 border-b border-black/5 pb-4">
                    <div>
                        <h3 class="text-3xl font-black tracking-tighter uppercase">Recent</h3>
                        <p class="text-[10px] text-black/40 font-bold tracking-widest mt-1 uppercase">Latest Transactions</p>
                    </div>
                    <button @click.stop.prevent="actions.navigate('expenses')" class="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors group cursor-pointer z-50 relative">
                        <i data-lucide="arrow-right" class="w-4 h-4 text-black/40 group-hover:text-white"></i>
                    </button>
                </div>

                <div v-if="state.recentExpenses.length > 0" class="space-y-2">
                    <div v-for="(expense, index) in state.recentExpenses" :key="expense.id" @click="actions.navigate('expense-detail', { id: expense.id })" 
                        class="group flex items-center p-4 rounded-[1.5rem] hover:bg-black/[0.02] transition-colors cursor-pointer animate-slide-up-fade"
                        :style="{ animationDelay: (index * 0.1) + 's' }">
                        
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mr-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" :class="helpers.getCategoryColorClass(expense.category_name)">
                            <i :data-lucide="helpers.getCategoryIcon(expense.category_name)" class="w-5 h-5 opacity-70 group-hover:opacity-100"></i>
                        </div>
                        
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-[15px] truncate group-hover:translate-x-1 transition-transform duration-300">{{ expense.title }}</h4>
                            <div class="flex items-center text-[10px] text-black/40 mt-1.5 tracking-wider uppercase font-bold">
                                <span>{{ helpers.formatDate(expense.payment_date) }}</span>
                                <span class="mx-2 w-1 h-1 rounded-full bg-black/20"></span>
                                <span>{{ expense.category_name || 'Uncategorized' }}</span>
                            </div>
                        </div>
                        
                        <div class="text-right pl-4">
                            <p class="font-black text-[16px] tracking-tight">-{{ helpers.formatAmount(expense.amount) }}</p>
                        </div>
                    </div>
                </div>
                
                <div v-else class="text-center py-12">
                    <div class="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="inbox" class="w-6 h-6 text-black/20"></i>
                    </div>
                    <p class="text-xs font-bold text-black/40 tracking-widest uppercase">No Recent Records</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
import { onMounted, nextTick } from 'vue';
const { state, constants, computedProps, helpers, actions } = useAppStore();
const currentDate = computedProps.currentDate.value;

const scrollToRecent = () => {
    const el = document.getElementById('recent-section');
    if (el) {
        // Need to find the scrolling container, which is `.page-content`
        const container = document.querySelector('.page-content');
        if (container) {
            container.scrollTo({
                top: el.offsetTop,
                behavior: 'smooth'
            });
        }
    }
};

onMounted(() => {
    // Re-initialize lucide icons if needed. The main app likely handles it, 
    // but just in case we need a nextTick for our dynamic icons
    nextTick(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
});
</script>

<style scoped>
/* Custom animations for silky smooth loading */
@keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideRight {
    from { opacity: 0; transform: translateX(-40px) translateY(-50%); }
    to { opacity: 1; transform: translateX(0) translateY(-50%); }
}

@keyframes slideLeft {
    from { opacity: 0; transform: translateX(40px) translateY(-50%); }
    to { opacity: 1; transform: translateX(0) translateY(-50%); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInSlow {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUpFade {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
    animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-slide-right {
    animation: slideRight 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
    opacity: 0;
}

.animate-slide-left {
    animation: slideLeft 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
    opacity: 0;
}

.animate-fade-in-up {
    animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
    opacity: 0;
}

.animate-fade-in-slow {
    animation: fadeInSlow 2s ease-out forwards;
}

.animate-slide-up-fade {
    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
}

/* Hide scrollbar for cleaner look */
::-webkit-scrollbar {
    width: 0px;
    background: transparent;
}
</style>
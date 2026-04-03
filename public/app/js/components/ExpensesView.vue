<template>
    <div class="absolute inset-0 flex flex-col bg-[#FAFAFA] text-[#111111] page-content pt-16">
        <!-- Huge Background Text -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <span class="text-[28vh] font-black text-black/[0.02] tracking-tighter whitespace-nowrap rotate-[-90deg] md:rotate-0 origin-center select-none scale-[1.8] md:scale-100">
                EXPENSES
            </span>
        </div>
        
        <!-- Premium Header Area -->
        <div class="px-6 py-8 relative z-10">
            <p class="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2 ml-1">累计投入</p>
            <div class="flex items-baseline space-x-1">
                <span class="text-4xl md:text-5xl font-black tracking-tighter">¥{{ helpers.formatAmount(state.totalExpenses) }}</span>
            </div>
        </div>
        
        <!-- Elegant List -->
        <div class="flex-1 overflow-y-auto pb-32 px-5 scroll-smooth relative z-10">
            <div v-if="state.loading" class="flex justify-center items-center py-20">
                <div class="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div v-else-if="state.expenses.length === 0" class="flex flex-col items-center justify-center py-32 opacity-40">
                <div class="text-[40px] font-black tracking-tighter text-black/20 mb-4">EMPTY</div>
                <p class="text-[10px] font-bold uppercase tracking-widest">空空如也，开始记录第一笔开销吧</p>
            </div>
            <div v-else class="relative ml-2 mt-4">
                <!-- Continuous Timeline Line -->
                <div class="absolute left-[3px] top-2 bottom-4 w-[2px] bg-gradient-to-b from-black/10 via-black/5 to-transparent rounded-full"></div>
                
                <div class="space-y-8">
                    <div v-for="group in groupedExpenses" :key="group.date" class="relative">
                        <!-- Timeline Node & Date -->
                        <div class="flex items-center mb-4 relative z-10">
                            <div class="absolute left-0 w-2 h-2 rounded-full bg-[#111111] ring-[6px] ring-[#FAFAFA]"></div>
                            <h3 class="pl-8 text-[12px] font-black tracking-widest uppercase text-black/40">{{ group.date }}</h3>
                        </div>
                        
                        <!-- Cards in Group -->
                        <div class="space-y-3 pl-8">
                            <div v-for="expense in group.items" :key="expense.id" @click="actions.navigate('expense-detail', { id: expense.id })" class="group bg-white/80 backdrop-blur-md rounded-[2rem] p-4 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-black/5 hover:bg-white active:scale-95 transition-all duration-300 cursor-pointer relative overflow-hidden">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mr-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" :class="helpers.getCategoryColorClass(expense.category_name)">
                                    <span class="text-[10px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100">{{ expense.category_name ? expense.category_name.substring(0,2) : '未' }}</span>
                                </div>
                                <div class="flex-1 min-w-0 z-10">
                                    <h4 class="font-bold text-[15px] truncate mb-1.5 group-hover:translate-x-1 transition-transform duration-300">{{ expense.title }}</h4>
                                    <div class="flex items-center text-[10px] font-bold text-black/40 uppercase tracking-wider">
                                        <span>{{ expense.category_name || '未分类' }}</span>
                                        <span class="mx-2 w-1 h-1 rounded-full bg-black/20"></span>
                                        <span>{{ helpers.getPaymentMethodText(expense.payment_method) || '未知' }}</span>
                                    </div>
                                </div>
                                <div class="text-right ml-3 flex flex-col items-end z-10">
                                    <p class="font-black text-[16px] tracking-tight">-{{ helpers.formatAmount(expense.amount) }}</p>
                                    <span v-if="expense.status === 'planned'" class="mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] uppercase tracking-wider">计划</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '../store.js';

const { state, constants, computedProps, helpers, actions } = useAppStore();

const groupedExpenses = computed(() => {
    const groups = [];
    let lastDate = null;
    state.expenses.forEach(exp => {
        const dateStr = helpers.formatDate(exp.payment_date);
        if (dateStr !== lastDate) {
            groups.push({ date: dateStr, items: [exp] });
            lastDate = dateStr;
        } else {
            groups[groups.length - 1].items.push(exp);
        }
    });
    return groups;
});
</script>

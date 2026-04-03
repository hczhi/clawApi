<template>
    <div class="absolute inset-0 overflow-y-auto bg-[#FAFAFA] text-[#111111] pb-32 pt-16 page-content">
        <!-- Huge Background Text -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 fixed">
            <span class="text-[28vh] font-black text-black/[0.02] tracking-tighter whitespace-nowrap rotate-[-90deg] md:rotate-0 origin-center select-none scale-[1.8] md:scale-100">
                RECEIPT
            </span>
        </div>

        <div v-if="state.currentExpense" class="p-6 relative z-10">
            <!-- Modern Receipt Card -->
            <div class="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-black/5 mb-6 relative overflow-hidden">
                <div class="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 blur-2xl" :class="helpers.getCategoryBgClass(state.currentExpense.category_name)"></div>
                
                <div class="flex flex-col items-center mb-10 relative z-10">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm" :class="helpers.getCategoryColorClass(state.currentExpense.category_name)">
                        <span class="text-[12px] font-black uppercase tracking-widest">{{ state.currentExpense.category_name ? state.currentExpense.category_name.substring(0,2) : '未' }}</span>
                    </div>
                    <h2 class="text-xl font-bold text-center mb-2">{{ state.currentExpense.title }}</h2>
                    <p class="text-5xl font-black tracking-tighter my-2">-{{ helpers.formatAmount(state.currentExpense.amount) }}</p>
                    <span class="mt-4 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full" 
                            :class="state.currentExpense.status === 'paid' ? 'bg-black/5 text-[#111111]' : 'bg-[#d4af37]/10 text-[#d4af37]'">
                        {{ state.currentExpense.status === 'paid' ? '已结清' : '计划开支' }}
                    </span>
                </div>

                <div class="w-full border-t border-dashed border-black/10 my-6"></div>

                <div class="space-y-5">
                    <div class="flex justify-between items-center">
                        <span class="text-[13px] font-bold text-black/40">项目分类</span>
                        <span class="text-[15px] font-bold">{{ state.currentExpense.category_name || '-' }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[13px] font-bold text-black/40">交易日期</span>
                        <span class="text-[15px] font-bold">{{ helpers.formatDate(state.currentExpense.payment_date) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[13px] font-bold text-black/40">支付方式</span>
                        <span class="text-[15px] font-bold">{{ helpers.getPaymentMethodText(state.currentExpense.payment_method) }}</span>
                    </div>
                    <div v-if="state.currentExpense.payer_names" class="flex justify-between items-center">
                        <span class="text-[13px] font-bold text-black/40">支付人</span>
                        <span class="text-[15px] font-bold">{{ state.currentExpense.payer_names }}</span>
                    </div>
                    <div v-if="state.currentExpense.vendor_name" class="flex justify-between items-center">
                        <span class="text-[13px] font-bold text-black/40">供应商/收款方</span>
                        <span class="text-[15px] font-bold">{{ state.currentExpense.vendor_name }}</span>
                    </div>
                    
                    <div v-if="state.currentExpense.notes" class="pt-4">
                        <span class="block text-[13px] font-bold text-black/40 mb-3">补充说明</span>
                        <p class="text-[14px] leading-relaxed bg-black/5 p-4 rounded-2xl">{{ state.currentExpense.notes }}</p>
                    </div>
                </div>
            </div>

            <div class="flex space-x-4">
                <button @click="actions.navigate('expense-form', { mode: 'edit', id: state.currentExpense.id })" class="flex-1 bg-[#111111] text-white py-4 rounded-full font-bold text-[15px] active:scale-95 transition-all shadow-sm">
                    编辑账单
                </button>
                <button @click="actions.deleteExpense" class="w-16 flex-shrink-0 bg-white text-[#ff3b30] border border-black/5 flex items-center justify-center rounded-full active:scale-95 transition-all shadow-sm font-black text-xs">
                    DEL
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>

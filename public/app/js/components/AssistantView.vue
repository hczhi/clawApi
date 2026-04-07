<template>
    <div class="assistant-container app-container page-content pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                ASSISTANT
            </span>
        </div>
        
        <!-- Chat Area -->
        <div class="chat-area" ref="chatContainer">
            <!-- Connection Status -->
            <div v-if="!connected" class="status-badge">
                <div class="badge-content">
                    <div class="pulse-dot"></div>
                    Connecting...
                </div>
            </div>

            <!-- Messages List -->
            <div v-for="msg in messages" :key="msg.id" class="message-wrapper" :class="msg.role === 'user' ? 'msg-user' : 'msg-ai'">
                <span class="message-sender">
                    {{ msg.role === 'user' ? 'Me' : 'AI' }}
                </span>
                <div class="message-bubble">
                    {{ msg.content }}
                </div>
            </div>
            
            <!-- Typing Indicator -->
            <div v-if="isTyping" class="typing-indicator">
                <span class="message-sender">AI</span>
                <div class="bubble">
                    <div class="dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Input Area -->
        <div class="input-area">
            <div class="input-wrapper">
                <textarea 
                    v-model="inputText" 
                    @keydown.enter.prevent="sendMessage" 
                    placeholder="问点什么..." 
                    class="chat-input" 
                    rows="1"
                    @input="adjustTextareaHeight"
                    ref="textareaRef"
                ></textarea>
            </div>
            <button @click="sendMessage" :disabled="!inputText.trim() || !connected" class="send-btn">
                <i data-lucide="arrow-up"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';

const connected = ref(false);
const inputText = ref('');
const messages = ref([]);
const isTyping = ref(false);
const chatContainer = ref(null);
const textareaRef = ref(null);

const generateId = () => Math.random().toString(36).substring(2, 15);

const adjustTextareaHeight = () => {
    if (!textareaRef.value) return;
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 128) + 'px';
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

const checkHealth = async () => {
    try {
        const response = await axios.get('/api/ai-chat/health');
        if (response.data.connected) {
            connected.value = true;
            if (messages.value.length === 0) {
                messages.value.push({
                    id: generateId(),
                    role: 'ai',
                    content: '你好！我是你的装修助手。有什么我可以帮你的吗？'
                });
            }
        } else {
            connected.value = false;
            setTimeout(checkHealth, 3000); // Retry if connecting
        }
    } catch (e) {
        console.error('Failed to check AI health', e);
        connected.value = false;
        setTimeout(checkHealth, 5000);
    }
};

const sendMessage = async () => {
    const text = inputText.value.trim();
    if (!text || !connected.value || isTyping.value) return;

    // Add user message to UI
    messages.value.push({
        id: generateId(),
        role: 'user',
        content: text
    });
    
    inputText.value = '';
    isTyping.value = true;
    
    // Reset textarea height
    if (textareaRef.value) {
        textareaRef.value.style.height = 'auto';
    }
    
    scrollToBottom();

    try {
        const response = await axios.post('/api/ai-chat', { question: text });
        
        if (response.data.success) {
            const aiData = response.data.aiResponse;
            messages.value.push({
                id: generateId(),
                role: 'ai',
                content: aiData.message || JSON.stringify(aiData)
            });
        } else {
            messages.value.push({
                id: generateId(),
                role: 'ai',
                content: '抱歉，我遇到了一些问题：' + (response.data.error || '未知错误')
            });
        }
    } catch (e) {
        console.error('Failed to send message', e);
        messages.value.push({
            id: generateId(),
            role: 'ai',
            content: '抱歉，网络请求失败，请稍后重试。'
        });
    } finally {
        isTyping.value = false;
        scrollToBottom();
    }
};

onMounted(() => {
    checkHealth();
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
</script>

<style scoped lang="scss">
.assistant-container {
    padding-top: 4rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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

.chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    scroll-behavior: smooth;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.status-badge {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 0;

    .badge-content {
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        background: rgba($color-black, 0.05);
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba($color-black, 0.4);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .pulse-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: rgba($color-black, 0.2);
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
}

.message-wrapper {
    display: flex;
    flex-direction: column;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;

    &.msg-user {
        align-items: flex-end;
    }

    &.msg-ai {
        align-items: flex-start;
    }
}

.message-sender {
    font-size: 10px;
    font-weight: 900;
    color: rgba($color-black, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.25rem;
    padding: 0 0.5rem;
}

.message-bubble {
    max-width: 85%;
    border-radius: 1.5rem;
    padding: 1rem;
    font-size: 0.875rem;
    line-height: 1.625;
    box-shadow: 0 8px 30px rgba(0,0,0,0.03);
    border: 1px solid transparent;
    transition: all 0.3s ease;

    .msg-user & {
        background: $color-black;
        color: $color-white;
        border-top-right-radius: 0.125rem;
    }

    .msg-ai & {
        background: rgba($color-white, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: $color-black;
        border-color: rgba($color-black, 0.05);
        border-top-left-radius: 0.125rem;
    }
}

.typing-indicator {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;

    .bubble {
        background: rgba($color-white, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba($color-black, 0.05);
        border-radius: 1.5rem;
        border-top-left-radius: 0.125rem;
        padding: 1rem;
        box-shadow: 0 8px 30px rgba(0,0,0,0.03);
    }

    .dots {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        height: 1.25rem;
    }

    .dot {
        width: 0.375rem;
        height: 0.375rem;
        background: rgba($color-black, 0.4);
        border-radius: 50%;
        animation: bounce 1s infinite;

        &:nth-child(1) { animation-delay: 0ms; }
        &:nth-child(2) { animation-delay: 150ms; }
        &:nth-child(3) { animation-delay: 300ms; }
    }
}

.input-area {
    position: relative;
    z-index: 10;
    padding: 1rem 1.5rem calc(1rem + env(safe-area-inset-bottom));
    background: rgba($color-white, 0.8);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-top: 1px solid rgba($color-black, 0.05);
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.03);
}

.input-wrapper {
    flex: 1;
    position: relative;
    background: rgba($color-black, 0.03);
    border-radius: 2rem;
    border: 1px solid rgba($color-black, 0.05);
    transition: all 0.3s ease;

    &:focus-within {
        background: $color-white;
        border-color: rgba($color-black, 0.2);
        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }
}

.chat-input {
    width: 100%;
    max-height: 8rem;
    min-height: 44px;
    background: transparent;
    border: none;
    border-radius: 2rem;
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
    outline: none;
    resize: none;
    overflow-y: auto;
    display: block;

    &::placeholder {
        color: rgba($color-black, 0.3);
        font-weight: bold;
        letter-spacing: 0.1em;
    }
}

.send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: $color-black;
    color: $color-white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    border: none;
    transition: all 0.2s ease;

    &:disabled {
        opacity: 0.3;
        transform: scale(1);
    }

    &:not(:disabled):hover {
        transform: scale(1.05);
    }

    &:not(:disabled):active {
        transform: scale(0.95);
    }

    i {
        width: 1.25rem;
        height: 1.25rem;
    }
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}

@keyframes bounce {
    0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
</style>

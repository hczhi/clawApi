<template>
    <div class="schedule-widget-wrapper" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <!-- Floating Button -->
        <button class="schedule-btn" :class="{ 'is-active': isHovered }">
            查看装修日程
        </button>

        <!-- Expandable Calendar Panel -->
        <transition name="scale-fade">
            <div v-if="isHovered" class="schedule-panel-container">
                <div class="schedule-panel">
                    <div class="panel-header">
                        <div class="month-nav">
                            <button class="nav-btn" @click="prevMonth"><i data-lucide="chevron-left"></i></button>
                            <h3 class="current-month">{{ currentMonthLabel }}</h3>
                            <button class="nav-btn" @click="nextMonth"><i data-lucide="chevron-right"></i></button>
                        </div>
                        <button class="btn-icon" @click="actions.navigate('schedule-form', { mode: 'add' })">
                            <i data-lucide="plus"></i>
                        </button>
                    </div>
                    
                    <div class="panel-body hide-scrollbar">
                    <!-- Calendar Grid -->
                    <div class="mini-calendar">
                        <div class="weekdays">
                            <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="weekday">{{ day }}</div>
                        </div>
                        <div class="days-grid">
                            <div v-for="(dayObj, index) in calendarDays" :key="index" 
                                 class="day-cell" 
                                 :class="{ 
                                     'is-other-month': !dayObj.isCurrentMonth,
                                     'is-today': dayObj.isToday,
                                     'is-selected': dayObj.date === selectedDate
                                 }"
                                 @click="selectDate(dayObj.date)">
                                <div class="day-number">{{ dayObj.dayNum }}</div>
                                <div class="day-events" v-if="dayObj.events.length > 0">
                                    <div v-for="(event, eIndex) in dayObj.events.slice(0, 3)" :key="eIndex" 
                                         class="event-dot" 
                                         :style="{ backgroundColor: event.color || '#ff6b52' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Selected Day Events List -->
                    <div class="selected-events">
                        <h4 class="selected-date-label">{{ selectedDateLabel }}</h4>
                        
                        <div v-if="selectedDayEvents.length === 0" class="empty-state">
                            <p>无日程安排</p>
                        </div>
                        <div v-else class="schedule-list">
                            <div v-for="schedule in selectedDayEvents" :key="schedule.id" class="schedule-item" @click="actions.navigate('schedule-detail', { id: schedule.id })">
                                <div class="item-color" :style="{ backgroundColor: schedule.color || '#ff6b52' }"></div>
                                <div class="item-content">
                                    <h5 class="item-title">{{ schedule.title }}</h5>
                                    <p class="item-meta" v-if="schedule.type !== 'custom'">
                                        {{ schedule.type === 'expense' ? '关联账单' : '关联清单' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useAppStore } from '/app/js/store.js';

const { state, actions } = useAppStore();
const dayjs = window.dayjs;

const isHovered = ref(false);
const currentDate = ref(dayjs());
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));

onMounted(() => {
    actions.fetchSchedules();
});

watch(isHovered, (val) => {
    if (val) {
        nextTick(() => {
            if (window.lucide?.createIcons) window.lucide.createIcons();
        });
    }
});

const currentMonthLabel = computed(() => currentDate.value.format('YYYY年 MM月'));

const selectedDateLabel = computed(() => {
    const d = dayjs(selectedDate.value);
    if (d.isSame(dayjs(), 'day')) return '今天';
    return d.format('MM月DD日');
});

const prevMonth = () => {
    currentDate.value = currentDate.value.subtract(1, 'month');
    nextTick(() => { if (window.lucide?.createIcons) window.lucide.createIcons(); });
};

const nextMonth = () => {
    currentDate.value = currentDate.value.add(1, 'month');
    nextTick(() => { if (window.lucide?.createIcons) window.lucide.createIcons(); });
};

const selectDate = (dateStr) => {
    selectedDate.value = dateStr;
};

// Compute days for the calendar grid
const calendarDays = computed(() => {
    const startOfMonth = currentDate.value.startOf('month');
    const endOfMonth = currentDate.value.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');

    const days = [];
    let day = startDate;

    while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
        const dateStr = day.format('YYYY-MM-DD');
        
        // Find events that overlap with this day
        const dayEvents = state.schedules.filter(s => {
            const sStart = dayjs(s.start_date).startOf('day');
            const sEnd = s.end_date ? dayjs(s.end_date).startOf('day') : sStart;
            return (day.isSame(sStart, 'day') || day.isAfter(sStart, 'day')) && 
                   (day.isSame(sEnd, 'day') || day.isBefore(sEnd, 'day'));
        });

        days.push({
            date: dateStr,
            dayNum: day.date(),
            isCurrentMonth: day.month() === currentDate.value.month(),
            isToday: day.isSame(dayjs(), 'day'),
            events: dayEvents
        });
        day = day.add(1, 'day');
    }
    return days;
});

const selectedDayEvents = computed(() => {
    const targetDay = dayjs(selectedDate.value).startOf('day');
    return state.schedules.filter(s => {
        const sStart = dayjs(s.start_date).startOf('day');
        const sEnd = s.end_date ? dayjs(s.end_date).startOf('day') : sStart;
        return (targetDay.isSame(sStart, 'day') || targetDay.isAfter(sStart, 'day')) && 
               (targetDay.isSame(sEnd, 'day') || targetDay.isBefore(sEnd, 'day'));
    });
});
</script>

<style scoped lang="scss">
.schedule-widget-wrapper {
    position: relative;
    z-index: 900;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.schedule-btn {
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    background: transparent;
    border: 1px solid var(--color-brand-coral);
    color: var(--color-brand-coral);
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    white-space: nowrap;

    &:hover, &.is-active {
        background: var(--color-brand-coral);
        color: white;
    }
}

.schedule-panel-container {
    position: absolute;
    bottom: 100%;
    right: 0;
    padding-bottom: 15px; /* Creates the invisible bridge to prevent flickering */
    z-index: 900;
}

.schedule-panel {
    width: 360px;
    background: var(--color-card-white);
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);

    .month-nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .current-month {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--color-text-main);
            min-width: 100px;
            text-align: center;
        }

        .nav-btn {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--color-bg-base);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--color-text-muted);
            transition: all 0.2s;

            &:hover {
                background: var(--color-text-main);
                color: white;
            }

            i {
                width: 14px;
                height: 14px;
            }
        }
    }

    .btn-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-bg-base);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--color-text-main);
        transition: all 0.2s;

        &:hover {
            background: var(--color-brand-coral);
            color: white;
        }

        i {
            width: 16px;
            height: 16px;
        }
    }
}

.panel-body {
    display: flex;
    flex-direction: column;
    max-height: 500px;
    overflow-y: auto;
}

.mini-calendar {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);

    .weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-bottom: 0.5rem;

        .weekday {
            text-align: center;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--color-text-muted);
        }
    }

    .days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.2rem;

        .day-cell {
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s;

            &:hover {
                background: var(--color-bg-base);
            }

            &.is-other-month {
                opacity: 0.3;
            }

            .day-number {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--color-text-main);
                z-index: 2;
            }

            &.is-today .day-number {
                color: var(--color-brand-coral);
                font-weight: 800;
            }

            &.is-selected {
                background: var(--color-text-main);
                
                .day-number {
                    color: white;
                }
            }

            .day-events {
                display: flex;
                gap: 2px;
                position: absolute;
                bottom: 4px;
                z-index: 2;

                .event-dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                }
            }
        }
    }
}

.selected-events {
    padding: 1.5rem;
    background: var(--color-bg-base);
    flex: 1;

    .selected-date-label {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text-muted);
    }
}

.empty-state {
    padding: 1rem 0 2rem;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.85rem;
}

.schedule-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.schedule-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    border-radius: 16px;
    background: var(--color-card-white);
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid rgba(0, 0, 0, 0.02);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
        border-color: rgba(0, 0, 0, 0.05);
    }

    .item-color {
        width: 4px;
        height: 24px;
        border-radius: 2px;
    }

    .item-content {
        flex: 1;

        .item-title {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--color-text-main);
        }

        .item-meta {
            margin: 0.2rem 0 0 0;
            font-size: 0.7rem;
            color: var(--color-text-muted);
        }
    }
}

.scale-fade-enter-active,
.scale-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.scale-fade-enter-from,
.scale-fade-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
}
</style>

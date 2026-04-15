<template>
    <div class="schedules-container">
        <div class="header">
            <h1 class="main-title">日程安排</h1>
            <div class="header-actions">
                <button class="btn-icon" @click="actions.navigate('schedule-form', { mode: 'add' })">
                    <i data-lucide="plus"></i>
                </button>
            </div>
        </div>

        <div class="calendar-wrapper">
            <!-- Calendar Header -->
            <div class="calendar-header">
                <button class="nav-btn" @click="prevMonth"><i data-lucide="chevron-left"></i></button>
                <h2 class="current-month">{{ currentMonthLabel }}</h2>
                <button class="nav-btn" @click="nextMonth"><i data-lucide="chevron-right"></i></button>
            </div>

            <!-- Weekdays -->
            <div class="weekdays">
                <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="weekday">{{ day }}</div>
            </div>

            <!-- Days Grid -->
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
        <div class="events-list-wrapper hide-scrollbar">
            <div class="selected-date-header">
                <h3>{{ selectedDateLabel }}</h3>
            </div>
            
            <div v-if="selectedDayEvents.length === 0" class="empty-state">
                <p>无日程安排</p>
            </div>

            <div v-else class="schedule-list">
                <div v-for="schedule in selectedDayEvents" :key="schedule.id" 
                     class="schedule-item" 
                     @click="actions.navigate('schedule-detail', { id: schedule.id })">
                    <div class="item-color" :style="{ backgroundColor: schedule.color || '#ff6b52' }"></div>
                    <div class="item-content">
                        <h4 class="item-title">{{ schedule.title }}</h4>
                        <div class="item-meta">
                            <span class="time" v-if="schedule.start_date !== schedule.end_date && schedule.end_date">
                                至 {{ dayjs(schedule.end_date).format('MM-DD') }}
                            </span>
                            <span class="badge" v-if="schedule.type !== 'custom'">
                                {{ schedule.type === 'expense' ? '账单' : '清单' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAppStore } from '../store.js';

const { state, actions } = useAppStore();
const dayjs = window.dayjs;

const currentDate = ref(dayjs());
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));

onMounted(() => {
    actions.fetchSchedules();
    nextTick(() => {
        if (window.lucide?.createIcons) window.lucide.createIcons();
    });
});

const currentMonthLabel = computed(() => currentDate.value.format('YYYY年 MM月'));

const selectedDateLabel = computed(() => {
    const d = dayjs(selectedDate.value);
    if (d.isSame(dayjs(), 'day')) return '今天';
    return d.format('MM月DD日 dddd');
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
.schedules-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-base);
}

.header {
    padding: 3rem 1.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--color-bg-base);

    .main-title {
        font-size: 2rem;
        font-weight: 800;
        margin: 0;
        color: var(--color-text-main);
        letter-spacing: -0.02em;
    }

    .btn-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-card-white);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        color: var(--color-text-main);
    }
}

.calendar-wrapper {
    background: var(--color-card-white);
    border-radius: 32px;
    margin: 0 1.5rem 1.5rem;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .current-month {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text-main);
        margin: 0;
    }

    .nav-btn {
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
            background: rgba(0, 0, 0, 0.05);
        }

        i {
            width: 18px;
            height: 18px;
        }
    }
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 0.5rem;

    .weekday {
        text-align: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        padding: 0.5rem 0;
    }
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;

    .day-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: 0.4rem;
        border-radius: 50%;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;

        &:hover {
            background: rgba(0, 0, 0, 0.03);
        }

        &.is-other-month {
            opacity: 0.3;
        }

        .day-number {
            font-size: 0.95rem;
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
            margin-top: 2px;
            z-index: 2;

            .event-dot {
                width: 4px;
                height: 4px;
                border-radius: 50%;
            }
        }
    }
}

.events-list-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 0 1.5rem 2rem;
}

.selected-date-header {
    margin-bottom: 1rem;

    h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text-main);
        margin: 0;
    }
}

.empty-state {
    padding: 2rem 0;
    text-align: center;
    
    p {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        margin: 0;
    }
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
    padding: 1rem;
    border-radius: 20px;
    background: var(--color-card-white);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.04);
    }

    .item-color {
        width: 4px;
        height: 40px;
        border-radius: 2px;
    }

    .item-content {
        flex: 1;

        .item-title {
            margin: 0 0 0.3rem 0;
            font-size: 1rem;
            font-weight: 700;
            color: var(--color-text-main);
        }

        .item-meta {
            display: flex;
            align-items: center;
            gap: 0.8rem;

            .time {
                font-size: 0.75rem;
                color: var(--color-text-muted);
            }

            .badge {
                font-size: 0.65rem;
                padding: 0.1rem 0.4rem;
                background: var(--color-bg-base);
                border-radius: 8px;
                color: var(--color-text-muted);
                font-weight: 600;
            }
        }
    }
}
</style>

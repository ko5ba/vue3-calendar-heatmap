<template>
	<div class="vch__container">
		<svg class="vch__wrapper" :viewBox="viewbox">
			<g class="vch__months__labels__wrapper" :transform="monthsLabelWrapperTransform">
				<text class="vch__month__label" v-for="(month, index) in monthsForLabels" :key="index"
					:x="getMonthLabelPosition(month).x" :y="getMonthLabelPosition(month).y">
					{{ lo.months[month.value] }}
				</text>
			</g>
			<g class="vch__days__labels__wrapper" :transform="daysLabelWrapperTransform">
				<text v-for="(day, idx) in lo.days" :key="idx" class="vch__day__label" :x="0" :y="20 + idx * SQUARE_SIZE">
					{{ day }}
				</text>
			</g>
			<g class="vch__year__wrapper" :transform="yearWrapperTransform" @mouseover="initTippyLazy">
				<g class="vch__month__wrapper" v-for="(week, weekIndex) in heatmap.calendar" :key="weekIndex"
					:transform="getWeekPosition(weekIndex)">
					<template v-for="(day, dayIndex) in week" :key="dayIndex">
						<rect class="vch__day__square" v-if="day.date < now" :rx="5" :ry="5" :transform="getDayPosition(dayIndex)"
							:width="SQUARE_SIZE - SQUARE_BORDER_SIZE" :height="SQUARE_SIZE - SQUARE_BORDER_SIZE"
							:style="{ fill: curRangeColor[day.colorIndex] }" :data-week-index="weekIndex" :data-day-index="dayIndex"
							@click="$emit('dayClick', day)" />
					</template>
				</g>
			</g>
		</svg>
		<div class="vch__legend-modern">
			<span>{{ lo.less }}</span>
			<div class="vch__legend-modern-bar">
				<span v-for="(color, idx) in curRangeColor" :key="idx" class="vch__legend-modern-box"
					:style="{ background: color }" />
			</div>
			<span>{{ lo.more }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, toRef, toRefs, watch, computed } from 'vue';
import { CalendarItem, Heatmap, Locale, Month, TooltipFormatter, Value } from '@/components/Heatmap';

const SQUARE_SIZE = 20;
const SQUARE_BORDER_SIZE = 2.5;

const props = defineProps<{
	endDate: Date;
	max?: number;
	rangeColor?: string[];
	values: Value[];
	locale?: Partial<Locale>;
	vertical?: boolean;
	darkMode?: boolean;
}>();

const defaultLocale: Locale = {
	months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
	days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	less: 'Низкая',
	more: 'Высокая',
	on: 'на',
};

const lo = ref({ ...defaultLocale, ...props.locale });

const curRangeColor = ref<string[]>(
	props.rangeColor ??
	['#ede9fe', '#bcb4fa', '#a389f4', '#8854ff', '#322850']
);

const now = ref(new Date());
const heatmap = ref(new Heatmap(props.endDate, props.values, props.max));

const LEFT_SECTION_WIDTH = Math.ceil(SQUARE_SIZE * 2.5);
const RIGHT_SECTION_WIDTH = SQUARE_SIZE * 3;
const TOP_SECTION_HEIGHT = SQUARE_SIZE + SQUARE_SIZE / 2;
const BOTTOM_SECTION_HEIGHT = SQUARE_SIZE + SQUARE_SIZE / 2;

const monthsForLabels = computed(() => heatmap.value.firstFullWeekOfMonths);

const yearWrapperTransform = `translate(${LEFT_SECTION_WIDTH}, ${TOP_SECTION_HEIGHT})`;
const monthsLabelWrapperTransform = `translate(${LEFT_SECTION_WIDTH}, 0)`;
const daysLabelWrapperTransform = `translate(0, ${TOP_SECTION_HEIGHT})`;

const viewbox = computed(() => {
	const w = LEFT_SECTION_WIDTH + (SQUARE_SIZE * heatmap.value.weekCount) + SQUARE_SIZE * 1.8;
	const h = TOP_SECTION_HEIGHT + (SQUARE_SIZE * 7);
	return `0 0 ${w} ${h}`;
});

function getWeekPosition(index: number) {
	return `translate(${index * SQUARE_SIZE}, 0)`;
}
function getDayPosition(index: number) {
	return `translate(0, ${index * SQUARE_SIZE})`;
}
function getMonthLabelPosition(month: Month) {
	return { x: SQUARE_SIZE * month.index, y: 18 };
}


watch(() => props.locale, (l) => {
	lo.value = l ? { ...defaultLocale, ...l } : defaultLocale;
});
</script>

<style scoped>
.vch__container {
	width: 100%;
	max-width: 1200px;
	background: #fff;
	border-radius: 18px;
	box-shadow: 0 3px 18px #0001;
	padding: 22px 10px 10px 10px;
	overflow-x: auto;
	margin: 0 auto;
}

svg.vch__wrapper {
	font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
	width: 100%;
	min-width: 820px;
	display: block;
	height: auto;
}

.vch__months__labels__wrapper text.vch__month__label {
	font-size: 15px;
	font-weight: 700;
	fill: #241d47;
	letter-spacing: 0.04em;
}

.vch__days__labels__wrapper text.vch__day__label {
	font-size: 13px;
	font-weight: 600;
	fill: #241d47;
	text-anchor: start;
}

.vch__year__wrapper .vch__day__square {
	transition: fill 0.22s, stroke 0.22s, filter 0.22s;
	stroke: transparent;
	rx: 6px;
	cursor: pointer;
}

.vch__year__wrapper .vch__day__square:hover {
	stroke: #8854ff;
	stroke-width: 2.5px;
	filter: drop-shadow(0 0 3px #8854ff55);
	z-index: 1;
}

.vch__legend-modern {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 18px;
	margin-left: 48px;
	font-size: 15px;
	font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
	color: #322850;
}

.vch__legend-modern-bar {
	display: flex;
	gap: 3.5px;
}

.vch__legend-modern-box {
	width: 20px;
	height: 14px;
	border-radius: 3px;
	border: 1px solid #dedede;
	display: inline-block;
}
</style>
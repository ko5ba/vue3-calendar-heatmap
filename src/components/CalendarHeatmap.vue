<template>
	<div class="vch__container">
		<div class="vch__scroll-area">
			<svg class="vch__wrapper" :viewBox="viewbox">
				<!-- Месяцы -->
				<g class="vch__months__labels__wrapper" :transform="monthsLabelWrapperTransform">
					<text class="vch__month__label" v-for="(month, index) in monthsForLabels" :key="index"
						:x="getMonthLabelPosition(month).x" :y="getMonthLabelPosition(month).y">
						{{ lo.months[month.value] }}
					</text>
				</g>
				<!-- Дни недели -->
				<g class="vch__days__labels__wrapper" :transform="daysLabelWrapperTransform">
					<text v-for="(day, idx) in lo.days" :key="idx" class="vch__day__label" :x="0" :y="16 + idx * squareSize">
						{{ day }}
					</text>
				</g>
				<!-- Календарь -->
				<g class="vch__year__wrapper" :transform="yearWrapperTransform">
					<g class="vch__month__wrapper" v-for="(week, weekIndex) in heatmap.calendar" :key="weekIndex"
						:transform="getWeekPosition(weekIndex)">
						<template v-for="(day, dayIndex) in week" :key="dayIndex">
							<rect class="vch__day__square" v-if="day.date < now" :rx="4" :ry="4" :transform="getDayPosition(dayIndex)"
								:width="squareSize - squareBorder" :height="squareSize - squareBorder"
								:style="{ fill: curRangeColor[day.colorIndex] }" :data-week-index="weekIndex" :data-day-index="dayIndex"
								@click="$emit('dayClick', day)" />
						</template>
					</g>
				</g>
			</svg>
		</div>
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
import { ref, computed, watch } from 'vue';
import { CalendarItem, Heatmap, Locale, Month, TooltipFormatter, Value } from '@/components/Heatmap';

const props = defineProps<{
	endDate: Date;
	max?: number;
	rangeColor?: string[];
	values: Value[];
	locale?: Partial<Locale>;
	vertical?: boolean;
	darkMode?: boolean;
}>();

// --- Динамический размер квадрата
const squareSize = ref(20);

function updateSquareSize() {
	if (window.innerWidth < 420) squareSize.value = 10;
	else if (window.innerWidth < 700) squareSize.value = 14;
	else if (window.innerWidth < 900) squareSize.value = 17;
	else squareSize.value = 20;
}
if (typeof window !== 'undefined') {
	updateSquareSize();
	window.addEventListener('resize', updateSquareSize);
}

const squareBorder = computed(() => squareSize.value / 8);

const defaultLocale: Locale = {
	months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
	days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	less: 'Низкая',
	more: 'Высокая',
	on: 'на',
};
const lo = ref({ ...defaultLocale, ...props.locale });
const curRangeColor = ref<string[]>(
	props.rangeColor ?? ['#ede9fe', '#bcb4fa', '#a389f4', '#8854ff', '#322850']
);

const now = ref(new Date());
const heatmap = ref(new Heatmap(props.endDate, props.values, props.max));

const LEFT_SECTION_WIDTH = computed(() => Math.ceil(squareSize.value * 2.2));
const RIGHT_SECTION_WIDTH = computed(() => squareSize.value * 2.5);
const TOP_SECTION_HEIGHT = computed(() => squareSize.value + squareSize.value / 2);

const monthsForLabels = computed(() => heatmap.value.firstFullWeekOfMonths);

const yearWrapperTransform = computed(
	() => `translate(${LEFT_SECTION_WIDTH.value}, ${TOP_SECTION_HEIGHT.value})`
);
const monthsLabelWrapperTransform = computed(
	() => `translate(${LEFT_SECTION_WIDTH.value}, 0)`
);
const daysLabelWrapperTransform = computed(
	() => `translate(0, ${TOP_SECTION_HEIGHT.value})`
);

const viewbox = computed(() => {
	const w =
		LEFT_SECTION_WIDTH.value +
		squareSize.value * heatmap.value.weekCount +
		squareSize.value * 1.3;
	const h = TOP_SECTION_HEIGHT.value + squareSize.value * 7;
	return `0 0 ${w} ${h}`;
});

function getWeekPosition(index: number) {
	return `translate(${index * squareSize.value}, 0)`;
}
function getDayPosition(index: number) {
	return `translate(0, ${index * squareSize.value})`;
}
function getMonthLabelPosition(month: Month) {
	return { x: squareSize.value * month.index, y: 13 };
}

watch(
	() => props.locale,
	(l) => {
		lo.value = l ? { ...defaultLocale, ...l } : defaultLocale;
	}
);
</script>

<style scoped>
.vch__container {
	width: 100%;
	max-width: 1200px;
	margin: 0 auto;
	background: #fff;
	border-radius: 18px;
	box-shadow: 0 3px 18px #0001;
	padding: 14px 5px 8px 5px;
}

.vch__scroll-area {
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	scrollbar-width: thin;
}

/* SVG always wide as content */
svg.vch__wrapper {
	width: max-content;
	min-width: 330px;
	max-width: 100%;
	display: block;
	height: auto;
}

.vch__months__labels__wrapper text.vch__month__label {
	font-size: 1em;
	font-weight: 700;
	fill: #241d47;
	letter-spacing: 0.04em;
	user-select: none;
}

.vch__days__labels__wrapper text.vch__day__label {
	font-size: 0.87em;
	font-weight: 600;
	fill: #241d47;
	text-anchor: start;
	user-select: none;
}

.vch__year__wrapper .vch__day__square {
	transition: fill 0.18s, stroke 0.22s, filter 0.18s;
	stroke: transparent;
	rx: 5px;
	cursor: pointer;
}

.vch__year__wrapper .vch__day__square:hover {
	stroke: #8854ff;
	stroke-width: 2px;
	filter: drop-shadow(0 0 2px #8854ff66);
	z-index: 1;
}

.vch__legend-modern {
	display: flex;
	align-items: center;
	gap: 7px;
	margin-top: 10px;
	margin-left: 24px;
	font-size: 1em;
	font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
	color: #322850;
	flex-wrap: wrap;
}

.vch__legend-modern-bar {
	display: flex;
	gap: 3px;
}

.vch__legend-modern-box {
	width: 18px;
	height: 12px;
	border-radius: 3px;
	border: 1px solid #dedede;
	display: inline-block;
}

/* --- Адаптив --- */
@media (max-width: 900px) {
	.vch__container {
		max-width: 99vw;
		padding: 10px 2px 8px 2px;
	}

	.vch__legend-modern {
		font-size: 0.95em;
		margin-left: 6px;
		margin-top: 8px;
	}
}

@media (max-width: 600px) {
	.vch__container {
		max-width: 100vw;
		padding: 4px 1px 2px 1px;
	}

	.vch__legend-modern {
		font-size: 0.78em;
		margin-left: 2px;
		margin-top: 4px;
	}

	.vch__legend-modern-box {
		width: 10px;
		height: 7px;
	}
}

@media (max-width: 420px) {
	.vch__months__labels__wrapper text.vch__month__label {
		font-size: 0.7em;
	}

	.vch__days__labels__wrapper text.vch__day__label {
		font-size: 0.62em;
	}
}
</style>

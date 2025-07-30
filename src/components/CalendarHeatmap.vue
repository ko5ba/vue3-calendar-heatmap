<template>
	<div class="vch__container">
		<div class="vch__scroll-area">
			<svg class="vch__wrapper" :viewBox="viewbox">
				<!-- Месяцы -->
				<g class="vch__months__labels__wrapper" :transform="monthsLabelWrapperTransform">
					<text class="vch__month__label" v-for="(month, index) in heatmap.firstFullWeekOfMonths" :key="index"
						:x="getMonthLabelPosition(month).x" :y="getMonthLabelPosition(month).y">
						{{ lo.months[month.value] }}
					</text>
				</g>
				<!-- Дни недели -->
				<g class="vch__days__labels__wrapper" :transform="daysLabelWrapperTransform">
					<text v-for="(day, idx) in lo.days" :key="idx" class="vch__day__label" :x="0"
						:y="idx * SQUARE_SIZE + SQUARE_SIZE / 1.5">
						{{ day }}
					</text>
				</g>
				<!-- Календарь -->
				<g class="vch__year__wrapper" :transform="yearWrapperTransform" @mouseover="initTippyLazy">
					<g class="vch__month__wrapper" v-for="(week, weekIndex) in heatmap.calendar" :key="weekIndex"
						:transform="getWeekPosition(weekIndex)">
						<template v-for="(day, dayIndex) in week" :key="dayIndex">
							<rect class="vch__day__square" v-if="day.date < now" :rx="round" :ry="round"
								:transform="getDayPosition(dayIndex)" :width="SQUARE_SIZE - SQUARE_BORDER_SIZE"
								:height="SQUARE_SIZE - SQUARE_BORDER_SIZE" :style="{ fill: curRangeColor[day.colorIndex] }"
								:data-week-index="weekIndex" :data-day-index="dayIndex" @click="$emit('dayClick', day)" />
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

<script lang="ts">
import { defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, ref, toRef, toRefs, watch } from 'vue';
import { CalendarItem, Heatmap, Locale, Month, TooltipFormatter, Value } from '@/components/Heatmap';
import tippy, { createSingleton, CreateSingletonInstance, Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/svg-arrow.css';

export default /*#__PURE__*/defineComponent({
	name: 'CalendarHeatmap',
	props: {
		endDate: { required: true },
		max: { type: Number },
		rangeColor: { type: Array as PropType<string[]> },
		values: { type: Array as PropType<Value[]>, required: true },
		locale: { type: Object as PropType<Partial<Locale>> },
		tooltip: { type: Boolean, default: true },
		tooltipUnit: { type: String, default: Heatmap.DEFAULT_TOOLTIP_UNIT },
		tooltipFormatter: { type: Function as PropType<TooltipFormatter> },
		vertical: { type: Boolean, default: false },
		noDataText: { type: [Boolean, String], default: null },
		round: { type: Number, default: 0 },
		darkMode: Boolean
	},
	emits: ['dayClick'],
	setup(props) {
		const SQUARE_BORDER_SIZE = Heatmap.SQUARE_SIZE / 5,
			SQUARE_SIZE = Heatmap.SQUARE_SIZE + SQUARE_BORDER_SIZE,
			LEFT_SECTION_WIDTH = Math.ceil(Heatmap.SQUARE_SIZE * 2.5),
			RIGHT_SECTION_WIDTH = SQUARE_SIZE * 3,
			TOP_SECTION_HEIGHT = Heatmap.SQUARE_SIZE + (Heatmap.SQUARE_SIZE / 2),
			BOTTOM_SECTION_HEIGHT = Heatmap.SQUARE_SIZE + (Heatmap.SQUARE_SIZE / 2),
			yearWrapperTransform = `translate(${LEFT_SECTION_WIDTH}, ${TOP_SECTION_HEIGHT})`,
			svg = ref<null | SVGElement>(null),
			now = ref(new Date()),
			heatmap = ref(new Heatmap(props.endDate as Date, props.values, props.max)),
			width = ref(0),
			height = ref(0),
			viewbox = ref('0 0 0 0'),
			legendViewbox = ref('0 0 0 0'),
			daysLabelWrapperTransform = ref(''),
			monthsLabelWrapperTransform = ref(''),
			legendWrapperTransform = ref(''),
			lo = ref<Locale>({} as any),
			rangeColor = ref<string[]>(props.rangeColor || (props.darkMode ? Heatmap.DEFAULT_RANGE_COLOR_DARK : Heatmap.DEFAULT_RANGE_COLOR_LIGHT));

		const { values, tooltipUnit, tooltipFormatter, noDataText, max, vertical, locale } = toRefs(props),
			tippyInstances = new Map<HTMLElement, Instance>();

		let tippySingleton: CreateSingletonInstance;

		function initTippy() {
			tippyInstances.clear();
			if (tippySingleton) {
				tippySingleton.setInstances(Array.from(tippyInstances.values()));
			} else {
				tippySingleton = createSingleton(Array.from(tippyInstances.values()), {
					overrides: [],
					moveTransition: 'transform 0.1s ease-out',
					allowHTML: true
				});
			}
		}

		function tooltipOptions(day: CalendarItem) {
			if (props.tooltip) {
				if (day.count !== undefined) {
					if (props.tooltipFormatter) {
						return props.tooltipFormatter(day, props.tooltipUnit!);
					}
					return `<b>${day.count} ${props.tooltipUnit}</b> ${lo.value.on} ${lo.value.months[day.date.getMonth()]} ${day.date.getDate()}, ${day.date.getFullYear()}`;
				} else if (props.noDataText) {
					return `${props.noDataText}`;
				} else if (props.noDataText !== false) {
					return `<b>No ${props.tooltipUnit}</b> ${lo.value.on} ${lo.value.months[day.date.getMonth()]} ${day.date.getDate()}, ${day.date.getFullYear()}`;
				}
			}
			return undefined;
		}

		function getWeekPosition(index: number) {
			if (props.vertical) {
				return `translate(0, ${(SQUARE_SIZE * heatmap.value.weekCount) - ((index + 1) * SQUARE_SIZE)})`;
			}
			return `translate(${index * SQUARE_SIZE}, 0)`;
		}

		function getDayPosition(index: number) {
			if (props.vertical) {
				return `translate(${index * SQUARE_SIZE}, 0)`;
			}
			return `translate(0, ${index * SQUARE_SIZE})`;
		}

		function getMonthLabelPosition(month: Month) {
			if (props.vertical) {
				return { x: 3, y: (SQUARE_SIZE * heatmap.value.weekCount) - (SQUARE_SIZE * (month.index)) - (SQUARE_SIZE / 4) };
			}
			return { x: SQUARE_SIZE * month.index * 0.96, y: SQUARE_SIZE - SQUARE_BORDER_SIZE };
		}

		watch([toRef(props, 'rangeColor'), toRef(props, 'darkMode')], ([rc, dm]) => {
			rangeColor.value = rc || (dm ? Heatmap.DEFAULT_RANGE_COLOR_DARK : Heatmap.DEFAULT_RANGE_COLOR_LIGHT);
		});

		watch(vertical, v => {
			if (v) {
				width.value = LEFT_SECTION_WIDTH + (SQUARE_SIZE * Heatmap.DAYS_IN_WEEK) + RIGHT_SECTION_WIDTH;
				height.value = TOP_SECTION_HEIGHT + (SQUARE_SIZE * heatmap.value.weekCount) + SQUARE_BORDER_SIZE;
				daysLabelWrapperTransform.value = `translate(${LEFT_SECTION_WIDTH}, 0)`;
				monthsLabelWrapperTransform.value = `translate(0, ${TOP_SECTION_HEIGHT})`;
			} else {
				width.value = LEFT_SECTION_WIDTH + (SQUARE_SIZE * heatmap.value.weekCount) + SQUARE_BORDER_SIZE;
				height.value = TOP_SECTION_HEIGHT + (SQUARE_SIZE * Heatmap.DAYS_IN_WEEK);
				daysLabelWrapperTransform.value = `translate(0, ${TOP_SECTION_HEIGHT})`;
				monthsLabelWrapperTransform.value = `translate(${LEFT_SECTION_WIDTH}, 0)`;
			}
		}, { immediate: true });

		watch([width, height], ([w, h]) => (viewbox.value = ` 0 0 ${w} ${h}`), { immediate: true });
		watch([width, height, rangeColor], ([w, h, rc]) => {
			legendWrapperTransform.value = vertical.value
				? `translate(${LEFT_SECTION_WIDTH + (SQUARE_SIZE * Heatmap.DAYS_IN_WEEK)}, ${TOP_SECTION_HEIGHT})`
				: `translate(${w - (SQUARE_SIZE * rc.length) - 30}, ${h - BOTTOM_SECTION_HEIGHT})`;
		}, { immediate: true });

		watch(locale, l => (lo.value = l ? { ...Heatmap.DEFAULT_LOCALE, ...l } : Heatmap.DEFAULT_LOCALE), { immediate: true });
		watch(rangeColor, rc => (legendViewbox.value = `0 0 ${Heatmap.SQUARE_SIZE * (rc.length + 1)} ${Heatmap.SQUARE_SIZE}`), { immediate: true });

		watch(
			[values, tooltipUnit, tooltipFormatter, noDataText, max, rangeColor],
			() => {
				heatmap.value = new Heatmap(props.endDate as Date, props.values, props.max);
				tippyInstances.forEach((item) => item.destroy());
				nextTick(initTippy);
			}
		);

		onMounted(initTippy);
		onBeforeUnmount(() => {
			tippySingleton?.destroy();
			tippyInstances.forEach((item) => item.destroy());
		});

		function initTippyLazy(e: MouseEvent) {
			if (tippySingleton
				&& e.target
				&& (e.target as HTMLElement).classList.contains('vch__day__square')
				&& (e.target as HTMLElement).dataset.weekIndex !== undefined
				&& (e.target as HTMLElement).dataset.dayIndex !== undefined
			) {
				const weekIndex = Number((e.target as HTMLElement).dataset.weekIndex),
					dayIndex = Number((e.target as HTMLElement).dataset.dayIndex);

				if (!isNaN(weekIndex) && !isNaN(dayIndex)) {
					const tooltip = tooltipOptions(heatmap.value.calendar[weekIndex][dayIndex]);
					if (tooltip) {
						const instance = tippyInstances.get(e.target as HTMLElement);
						if (instance) {
							instance.setContent(tooltip);
						} else if (!instance) {
							tippyInstances.set(e.target as HTMLElement, tippy(e.target as HTMLElement, { content: tooltip } as any));
							tippySingleton.setInstances(Array.from(tippyInstances.values()));
						}
					}
				}
			}
		}

		return {
			SQUARE_BORDER_SIZE, SQUARE_SIZE, LEFT_SECTION_WIDTH, RIGHT_SECTION_WIDTH, TOP_SECTION_HEIGHT, BOTTOM_SECTION_HEIGHT,
			svg, heatmap, now, width, height, viewbox, daysLabelWrapperTransform, monthsLabelWrapperTransform, yearWrapperTransform, legendWrapperTransform,
			lo, legendViewbox, curRangeColor: rangeColor,
			getWeekPosition, getDayPosition, getMonthLabelPosition, initTippyLazy, round: props.round
		};
	}
});
</script>

<style scoped>
.vch__container {
	width: 100%;
	max-width: 800px;
	margin: 40px auto 0 auto;
	background: #fff;
	border-radius: 18px;
	box-shadow: 0 3px 18px #0001;
	padding: 16px 5px 0 5px;
	box-sizing: border-box;
}

.vch__scroll-area {
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	scrollbar-width: thin;
}

svg.vch__wrapper {
	width: 700px;
	min-width: 700px;
	max-width: 700px;
	display: block;
	height: auto;
}

/* Легенда — в одну строку, всегда под SVG, не в скролле! */
.vch__legend-modern {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	margin-top: 10px;
	margin-bottom: 0;
	font-size: 1em;
	color: #322850;
	flex-wrap: nowrap;
	white-space: nowrap;
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

@media (max-width: 800px) {
	.vch__container {
		max-width: 100vw;
		width: 100vw;
		border-radius: 0;
		padding: 6px 1px 0 1px;
	}

	svg.vch__wrapper {
		width: 700px;
		min-width: 700px;
		max-width: 700px;
	}
}

@media (max-width: 420px) {
	.vch__legend-modern {
		font-size: 0.7em;
		gap: 3px;
	}

	.vch__legend-modern-box {
		width: 10px;
		height: 7px;
	}
}
</style>

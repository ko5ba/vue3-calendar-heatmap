var ee = Object.defineProperty;
var te = (e, t, a) => t in e ? ee(e, t, { enumerable: !0, configurable: !0, writable: !0, value: a }) : e[t] = a;
var i = (e, t, a) => (te(e, typeof t != "symbol" ? t + "" : t, a), a);
import { defineComponent as ae, ref as h, toRefs as ne, watch as y, toRef as Y, nextTick as re, onMounted as se, onBeforeUnmount as oe, openBlock as _, createElementBlock as d, createElementVNode as m, Fragment as S, renderList as O, toDisplayString as L, normalizeStyle as Q, createCommentVNode as ie } from "vue";
import le, { createSingleton as ue } from "tippy.js";
const D = class {
  constructor(t, a, s) {
    i(this, "startDate");
    i(this, "endDate");
    i(this, "max");
    i(this, "_values");
    i(this, "_firstFullWeekOfMonths");
    i(this, "_activities");
    i(this, "_calendar");
    this.endDate = this.parseDate(t), this.max = s || Math.ceil(Math.max(...a.map((l) => l.count)) / 5 * 4), this.startDate = this.shiftDate(t, -D.DAYS_IN_ONE_YEAR), this._values = a;
  }
  set values(t) {
    this.max = Math.ceil(Math.max(...t.map((a) => a.count)) / 5 * 4), this._values = t, this._firstFullWeekOfMonths = void 0, this._calendar = void 0, this._activities = void 0;
  }
  get values() {
    return this._values;
  }
  get activities() {
    if (!this._activities) {
      this._activities = /* @__PURE__ */ new Map();
      for (let t = 0, a = this.values.length; t < a; t++)
        this._activities.set(this.keyDayParser(this.values[t].date), {
          count: this.values[t].count,
          colorIndex: this.getColorIndex(this.values[t].count)
        });
    }
    return this._activities;
  }
  get weekCount() {
    return this.getDaysCount() / D.DAYS_IN_WEEK;
  }
  get calendar() {
    if (!this._calendar) {
      let t = this.shiftDate(this.startDate, -this.getCountEmptyDaysAtStart());
      t = new Date(t.getFullYear(), t.getMonth(), t.getDate()), this._calendar = new Array(this.weekCount);
      for (let a = 0, s = this._calendar.length; a < s; a++) {
        this._calendar[a] = new Array(D.DAYS_IN_WEEK);
        for (let l = 0; l < D.DAYS_IN_WEEK; l++) {
          const o = this.activities.get(this.keyDayParser(t));
          this._calendar[a][l] = {
            date: new Date(t.valueOf()),
            count: o ? o.count : void 0,
            colorIndex: o ? o.colorIndex : 0
          }, t.setDate(t.getDate() + 1);
        }
      }
    }
    return this._calendar;
  }
  get firstFullWeekOfMonths() {
    if (!this._firstFullWeekOfMonths) {
      const t = this.calendar;
      this._firstFullWeekOfMonths = [];
      for (let a = 1, s = t.length; a < s; a++) {
        const l = t[a - 1][0].date, o = t[a][0].date;
        (l.getFullYear() < o.getFullYear() || l.getMonth() < o.getMonth()) && this._firstFullWeekOfMonths.push({ value: o.getMonth(), index: a });
      }
    }
    return this._firstFullWeekOfMonths;
  }
  getColorIndex(t) {
    return t == null ? 0 : t <= 0 ? 1 : t >= this.max ? 5 : Math.ceil(t * 100 / this.max * 0.03) + 1;
  }
  getCountEmptyDaysAtStart() {
    return this.startDate.getDay();
  }
  getCountEmptyDaysAtEnd() {
    return D.DAYS_IN_WEEK - 1 - this.endDate.getDay();
  }
  getDaysCount() {
    return D.DAYS_IN_ONE_YEAR + 1 + this.getCountEmptyDaysAtStart() + this.getCountEmptyDaysAtEnd();
  }
  shiftDate(t, a) {
    const s = new Date(t);
    return s.setDate(s.getDate() + a), s;
  }
  parseDate(t) {
    return t instanceof Date ? t : new Date(t);
  }
  keyDayParser(t) {
    const a = this.parseDate(t);
    return String(a.getFullYear()) + String(a.getMonth()).padStart(2, "0") + String(a.getDate()).padStart(2, "0");
  }
};
let r = D;
i(r, "DEFAULT_RANGE_COLOR_LIGHT", ["#ebedf0", "#dae2ef", "#c0ddf9", "#73b3f3", "#3886e1", "#17459e"]), i(r, "DEFAULT_RANGE_COLOR_DARK", ["#1f1f22", "#1e334a", "#1d466c", "#1d5689", "#1d69ac", "#1B95D1"]), // other color candidates
// static readonly DEFAULT_RANGE_COLOR_LIGHT = [ '#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39' ];
// static readonly DEFAULT_RANGE_COLOR_DARK  = [ '#161b22', '#0e4429', '#006d32', '#26a641', '#39d353' ];
// static readonly DEFAULT_RANGE_COLOR_DARK    = [ '#011526', '#012E40', '#025959', '#02735E', '#038C65' ];
// static readonly DEFAULT_RANGE_COLOR_DARK    = [ '#161b22', '#015958', '#008F8C', '#0CABA8', '#0FC2C0' ];
// static readonly DEFAULT_RANGE_COLOR_DARK    = [ '#012030', '#13678A', '#45C4B0', '#9AEBA3', '#DAFDBA' ];
i(r, "DEFAULT_LOCALE", {
  months: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  less: "Низкая",
  more: "Высокая",
  on: "на"
}), i(r, "DEFAULT_TOOLTIP_UNIT", "contributions"), i(r, "DAYS_IN_ONE_YEAR", 365), i(r, "DAYS_IN_WEEK", 7), i(r, "SQUARE_SIZE", 10);
const _e = /* @__PURE__ */ ae({
  name: "CalendarHeatmap",
  props: {
    endDate: { required: !0 },
    max: { type: Number },
    rangeColor: { type: Array },
    values: { type: Array, required: !0 },
    locale: { type: Object },
    tooltip: { type: Boolean, default: !0 },
    tooltipUnit: { type: String, default: r.DEFAULT_TOOLTIP_UNIT },
    tooltipFormatter: { type: Function },
    vertical: { type: Boolean, default: !1 },
    noDataText: { type: [Boolean, String], default: null },
    round: { type: Number, default: 0 },
    darkMode: Boolean
  },
  emits: ["dayClick"],
  setup(e) {
    const t = r.SQUARE_SIZE / 5, a = r.SQUARE_SIZE + t, s = Math.ceil(r.SQUARE_SIZE * 2.5), l = a * 3, o = r.SQUARE_SIZE + r.SQUARE_SIZE / 2, u = r.SQUARE_SIZE + r.SQUARE_SIZE / 2, c = `translate(${s}, ${o})`, I = h(null), T = h(/* @__PURE__ */ new Date()), f = h(new r(e.endDate, e.values, e.max)), p = h(0), R = h(0), M = h("0 0 0 0"), F = h("0 0 0 0"), w = h(""), N = h(""), b = h(""), A = h({}), C = h(e.rangeColor || (e.darkMode ? r.DEFAULT_RANGE_COLOR_DARK : r.DEFAULT_RANGE_COLOR_LIGHT)), { values: B, tooltipUnit: P, tooltipFormatter: G, noDataText: K, max: H, vertical: W, locale: q } = ne(e), E = /* @__PURE__ */ new Map();
    let v;
    function x() {
      E.clear(), v ? v.setInstances(Array.from(E.values())) : v = ue(Array.from(E.values()), {
        overrides: [],
        moveTransition: "transform 0.1s ease-out",
        allowHTML: !0
      });
    }
    function z(n) {
      if (e.tooltip) {
        if (n.count !== void 0)
          return e.tooltipFormatter ? e.tooltipFormatter(n, e.tooltipUnit) : `<b>${n.count} ${e.tooltipUnit}</b> ${A.value.on} ${A.value.months[n.date.getMonth()]} ${n.date.getDate()}, ${n.date.getFullYear()}`;
        if (e.noDataText)
          return `${e.noDataText}`;
        if (e.noDataText !== !1)
          return `<b>No ${e.tooltipUnit}</b> ${A.value.on} ${A.value.months[n.date.getMonth()]} ${n.date.getDate()}, ${n.date.getFullYear()}`;
      }
    }
    function V(n) {
      return e.vertical ? `translate(0, ${a * f.value.weekCount - (n + 1) * a})` : `translate(${n * a}, 0)`;
    }
    function j(n) {
      return e.vertical ? `translate(${n * a}, 0)` : `translate(0, ${n * a})`;
    }
    function J(n) {
      return e.vertical ? { x: 3, y: a * f.value.weekCount - a * n.index - a / 4 } : { x: a * n.index * 0.96, y: a - t };
    }
    y([Y(e, "rangeColor"), Y(e, "darkMode")], ([n, g]) => {
      C.value = n || (g ? r.DEFAULT_RANGE_COLOR_DARK : r.DEFAULT_RANGE_COLOR_LIGHT);
    }), y(W, (n) => {
      n ? (p.value = s + a * r.DAYS_IN_WEEK + l, R.value = o + a * f.value.weekCount + t, w.value = `translate(${s}, 0)`, N.value = `translate(0, ${o})`) : (p.value = s + a * f.value.weekCount + t, R.value = o + a * r.DAYS_IN_WEEK, w.value = `translate(0, ${o})`, N.value = `translate(${s}, 0)`);
    }, { immediate: !0 }), y([p, R], ([n, g]) => M.value = ` 0 0 ${n} ${g}`, { immediate: !0 }), y([p, R, C], ([n, g, k]) => {
      b.value = W.value ? `translate(${s + a * r.DAYS_IN_WEEK}, ${o})` : `translate(${n - a * k.length - 30}, ${g - u})`;
    }, { immediate: !0 }), y(q, (n) => A.value = n ? { ...r.DEFAULT_LOCALE, ...n } : r.DEFAULT_LOCALE, { immediate: !0 }), y(C, (n) => F.value = `0 0 ${r.SQUARE_SIZE * (n.length + 1)} ${r.SQUARE_SIZE}`, { immediate: !0 }), y(
      [B, P, G, K, H, C],
      () => {
        f.value = new r(e.endDate, e.values, e.max), E.forEach((n) => n.destroy()), re(x);
      }
    ), se(x), oe(() => {
      v == null || v.destroy(), E.forEach((n) => n.destroy());
    });
    function X(n) {
      if (v && n.target && n.target.classList.contains("vch__day__square") && n.target.dataset.weekIndex !== void 0 && n.target.dataset.dayIndex !== void 0) {
        const g = Number(n.target.dataset.weekIndex), k = Number(n.target.dataset.dayIndex);
        if (!isNaN(g) && !isNaN(k)) {
          const U = z(f.value.calendar[g][k]);
          if (U) {
            const $ = E.get(n.target);
            $ ? $.setContent(U) : $ || (E.set(n.target, le(n.target, { content: U })), v.setInstances(Array.from(E.values())));
          }
        }
      }
    }
    return {
      SQUARE_BORDER_SIZE: t,
      SQUARE_SIZE: a,
      LEFT_SECTION_WIDTH: s,
      RIGHT_SECTION_WIDTH: l,
      TOP_SECTION_HEIGHT: o,
      BOTTOM_SECTION_HEIGHT: u,
      svg: I,
      heatmap: f,
      now: T,
      width: p,
      height: R,
      viewbox: M,
      daysLabelWrapperTransform: w,
      monthsLabelWrapperTransform: N,
      yearWrapperTransform: c,
      legendWrapperTransform: b,
      lo: A,
      legendViewbox: F,
      curRangeColor: C,
      getWeekPosition: V,
      getDayPosition: j,
      getMonthLabelPosition: J,
      initTippyLazy: X,
      round: e.round
    };
  }
});
const de = (e, t) => {
  const a = e.__vccOpts || e;
  for (const [s, l] of t)
    a[s] = l;
  return a;
}, ce = { class: "vch__container" }, he = { class: "vch__scroll-area" }, fe = ["viewBox"], Ee = ["transform"], ve = ["x", "y"], ge = ["transform"], me = ["y"], De = ["transform"], ye = ["transform"], Ae = ["rx", "ry", "transform", "width", "height", "data-week-index", "data-day-index", "onClick"], Se = { class: "vch__legend-modern" }, Ie = { class: "vch__legend-modern-bar" };
function Te(e, t, a, s, l, o) {
  return _(), d("div", ce, [
    m("div", he, [
      (_(), d("svg", {
        class: "vch__wrapper",
        viewBox: e.viewbox
      }, [
        m("g", {
          class: "vch__months__labels__wrapper",
          transform: e.monthsLabelWrapperTransform
        }, [
          (_(!0), d(S, null, O(e.heatmap.firstFullWeekOfMonths, (u, c) => (_(), d("text", {
            class: "vch__month__label",
            key: c,
            x: e.getMonthLabelPosition(u).x,
            y: e.getMonthLabelPosition(u).y
          }, L(e.lo.months[u.value]), 9, ve))), 128))
        ], 8, Ee),
        m("g", {
          class: "vch__days__labels__wrapper",
          transform: e.daysLabelWrapperTransform
        }, [
          (_(!0), d(S, null, O(e.lo.days, (u, c) => (_(), d("text", {
            key: c,
            class: "vch__day__label",
            x: 0,
            y: c * e.SQUARE_SIZE + e.SQUARE_SIZE / 1.5
          }, L(u), 9, me))), 128))
        ], 8, ge),
        m("g", {
          class: "vch__year__wrapper",
          transform: e.yearWrapperTransform,
          onMouseover: t[0] || (t[0] = (...u) => e.initTippyLazy && e.initTippyLazy(...u))
        }, [
          (_(!0), d(S, null, O(e.heatmap.calendar, (u, c) => (_(), d("g", {
            class: "vch__month__wrapper",
            key: c,
            transform: e.getWeekPosition(c)
          }, [
            (_(!0), d(S, null, O(u, (I, T) => (_(), d(S, { key: T }, [
              I.date < e.now ? (_(), d("rect", {
                key: 0,
                class: "vch__day__square",
                rx: e.round,
                ry: e.round,
                transform: e.getDayPosition(T),
                width: e.SQUARE_SIZE - e.SQUARE_BORDER_SIZE,
                height: e.SQUARE_SIZE - e.SQUARE_BORDER_SIZE,
                style: Q({ fill: e.curRangeColor[I.colorIndex] }),
                "data-week-index": c,
                "data-day-index": T,
                onClick: (f) => e.$emit("dayClick", I)
              }, null, 12, Ae)) : ie("", !0)
            ], 64))), 128))
          ], 8, ye))), 128))
        ], 40, De)
      ], 8, fe))
    ]),
    m("div", Se, [
      m("span", null, L(e.lo.less), 1),
      m("div", Ie, [
        (_(!0), d(S, null, O(e.curRangeColor, (u, c) => (_(), d("span", {
          key: c,
          class: "vch__legend-modern-box",
          style: Q({ background: u })
        }, null, 4))), 128))
      ]),
      m("span", null, L(e.lo.more), 1)
    ])
  ]);
}
const Z = /* @__PURE__ */ de(_e, [["render", Te], ["__scopeId", "data-v-7dc98d8e"]]);
function pe(e) {
  e.component(Z.name, Z);
}
const ke = { install: pe };
export {
  Z as CalendarHeatmap,
  r as Heatmap,
  ke as default
};
//# sourceMappingURL=vue3-calendar-heatmap.es.js.map

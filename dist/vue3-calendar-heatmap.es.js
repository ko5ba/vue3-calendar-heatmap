var B = Object.defineProperty;
var P = (o, e, t) => e in o ? B(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var a = (o, e, t) => (P(o, typeof e != "symbol" ? e + "" : e, t), t);
import { defineComponent as K, ref as m, computed as d, watch as U, openBlock as r, createElementBlock as l, createElementVNode as v, unref as g, Fragment as D, renderList as p, toDisplayString as E, normalizeStyle as W, createCommentVNode as q } from "vue";
const f = class {
  constructor(e, t, s) {
    a(this, "startDate");
    a(this, "endDate");
    a(this, "max");
    a(this, "_values");
    a(this, "_firstFullWeekOfMonths");
    a(this, "_activities");
    a(this, "_calendar");
    this.endDate = this.parseDate(e), this.max = s || Math.ceil(Math.max(...t.map((n) => n.count)) / 5 * 4), this.startDate = this.shiftDate(e, -f.DAYS_IN_ONE_YEAR), this._values = t;
  }
  set values(e) {
    this.max = Math.ceil(Math.max(...e.map((t) => t.count)) / 5 * 4), this._values = e, this._firstFullWeekOfMonths = void 0, this._calendar = void 0, this._activities = void 0;
  }
  get values() {
    return this._values;
  }
  get activities() {
    if (!this._activities) {
      this._activities = /* @__PURE__ */ new Map();
      for (let e = 0, t = this.values.length; e < t; e++)
        this._activities.set(this.keyDayParser(this.values[e].date), {
          count: this.values[e].count,
          colorIndex: this.getColorIndex(this.values[e].count)
        });
    }
    return this._activities;
  }
  get weekCount() {
    return this.getDaysCount() / f.DAYS_IN_WEEK;
  }
  get calendar() {
    if (!this._calendar) {
      let e = this.shiftDate(this.startDate, -this.getCountEmptyDaysAtStart());
      e = new Date(e.getFullYear(), e.getMonth(), e.getDate()), this._calendar = new Array(this.weekCount);
      for (let t = 0, s = this._calendar.length; t < s; t++) {
        this._calendar[t] = new Array(f.DAYS_IN_WEEK);
        for (let n = 0; n < f.DAYS_IN_WEEK; n++) {
          const i = this.activities.get(this.keyDayParser(e));
          this._calendar[t][n] = {
            date: new Date(e.valueOf()),
            count: i ? i.count : void 0,
            colorIndex: i ? i.colorIndex : 0
          }, e.setDate(e.getDate() + 1);
        }
      }
    }
    return this._calendar;
  }
  get firstFullWeekOfMonths() {
    if (!this._firstFullWeekOfMonths) {
      const e = this.calendar;
      this._firstFullWeekOfMonths = [];
      for (let t = 1, s = e.length; t < s; t++) {
        const n = e[t - 1][0].date, i = e[t][0].date;
        (n.getFullYear() < i.getFullYear() || n.getMonth() < i.getMonth()) && this._firstFullWeekOfMonths.push({ value: i.getMonth(), index: t });
      }
    }
    return this._firstFullWeekOfMonths;
  }
  getColorIndex(e) {
    return e == null ? 0 : e <= 0 ? 1 : e >= this.max ? 5 : Math.ceil(e * 100 / this.max * 0.03) + 1;
  }
  getCountEmptyDaysAtStart() {
    return this.startDate.getDay();
  }
  getCountEmptyDaysAtEnd() {
    return f.DAYS_IN_WEEK - 1 - this.endDate.getDay();
  }
  getDaysCount() {
    return f.DAYS_IN_ONE_YEAR + 1 + this.getCountEmptyDaysAtStart() + this.getCountEmptyDaysAtEnd();
  }
  shiftDate(e, t) {
    const s = new Date(e);
    return s.setDate(s.getDate() + t), s;
  }
  parseDate(e) {
    return e instanceof Date ? e : new Date(e);
  }
  keyDayParser(e) {
    const t = this.parseDate(e);
    return String(t.getFullYear()) + String(t.getMonth()).padStart(2, "0") + String(t.getDate()).padStart(2, "0");
  }
};
let _ = f;
a(_, "DEFAULT_RANGE_COLOR_LIGHT", ["#ebedf0", "#dae2ef", "#c0ddf9", "#73b3f3", "#3886e1", "#17459e"]), a(_, "DEFAULT_RANGE_COLOR_DARK", ["#1f1f22", "#1e334a", "#1d466c", "#1d5689", "#1d69ac", "#1B95D1"]), // other color candidates
// static readonly DEFAULT_RANGE_COLOR_LIGHT = [ '#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39' ];
// static readonly DEFAULT_RANGE_COLOR_DARK  = [ '#161b22', '#0e4429', '#006d32', '#26a641', '#39d353' ];
// static readonly DEFAULT_RANGE_COLOR_DARK    = [ '#011526', '#012E40', '#025959', '#02735E', '#038C65' ];
// static readonly DEFAULT_RANGE_COLOR_DARK    = [ '#161b22', '#015958', '#008F8C', '#0CABA8', '#0FC2C0' ];
// static readonly DEFAULT_RANGE_COLOR_DARK    = [ '#012030', '#13678A', '#45C4B0', '#9AEBA3', '#DAFDBA' ];
a(_, "DEFAULT_LOCALE", {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  on: "on",
  less: "Less",
  more: "More"
}), a(_, "DEFAULT_TOOLTIP_UNIT", "contributions"), a(_, "DAYS_IN_ONE_YEAR", 365), a(_, "DAYS_IN_WEEK", 7), a(_, "SQUARE_SIZE", 10);
const z = { class: "vch__container" }, G = { class: "vch__scroll-area" }, J = ["viewBox"], V = ["transform"], j = ["x", "y"], Q = ["transform"], Z = ["y"], X = ["transform"], H = ["transform"], ee = ["transform", "width", "height", "data-week-index", "data-day-index", "onClick"], te = { class: "vch__legend-modern" }, ae = { class: "vch__legend-modern-bar" }, se = /* @__PURE__ */ K({
  __name: "CalendarHeatmap",
  props: {
    endDate: null,
    max: null,
    rangeColor: null,
    values: null,
    locale: null,
    vertical: { type: Boolean },
    darkMode: { type: Boolean }
  },
  setup(o) {
    const e = o, t = m(20);
    function s() {
      window.innerWidth < 420 ? t.value = 10 : window.innerWidth < 700 ? t.value = 14 : window.innerWidth < 900 ? t.value = 17 : t.value = 20;
    }
    typeof window < "u" && (s(), window.addEventListener("resize", s));
    const n = d(() => t.value / 8), i = {
      months: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
      days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      less: "Низкая",
      more: "Высокая",
      on: "на"
    }, y = m({ ...i, ...e.locale }), S = m(
      e.rangeColor ?? ["#ede9fe", "#bcb4fa", "#a389f4", "#8854ff", "#322850"]
    ), b = m(/* @__PURE__ */ new Date()), w = m(new _(e.endDate, e.values, e.max)), x = d(() => Math.ceil(t.value * 2.2));
    d(() => t.value * 2.5);
    const k = d(() => t.value + t.value / 2), I = d(() => w.value.firstFullWeekOfMonths), L = d(
      () => `translate(${x.value}, ${k.value})`
    ), N = d(
      () => `translate(${x.value}, 0)`
    ), T = d(
      () => `translate(0, ${k.value})`
    ), Y = d(() => {
      const u = x.value + t.value * w.value.weekCount + t.value * 1.3, O = k.value + t.value * 7;
      return `0 0 ${u} ${O}`;
    });
    function R(u) {
      return `translate(${u * t.value}, 0)`;
    }
    function $(u) {
      return `translate(0, ${u * t.value})`;
    }
    function M(u) {
      return { x: t.value * u.index, y: 13 };
    }
    return U(
      () => e.locale,
      (u) => {
        y.value = u ? { ...i, ...u } : i;
      }
    ), (u, O) => (r(), l("div", z, [
      v("div", G, [
        (r(), l("svg", {
          class: "vch__wrapper",
          viewBox: g(Y)
        }, [
          v("g", {
            class: "vch__months__labels__wrapper",
            transform: g(N)
          }, [
            (r(!0), l(D, null, p(g(I), (h, c) => (r(), l("text", {
              class: "vch__month__label",
              key: c,
              x: M(h).x,
              y: M(h).y
            }, E(y.value.months[h.value]), 9, j))), 128))
          ], 8, V),
          v("g", {
            class: "vch__days__labels__wrapper",
            transform: g(T)
          }, [
            (r(!0), l(D, null, p(y.value.days, (h, c) => (r(), l("text", {
              key: c,
              class: "vch__day__label",
              x: 0,
              y: 16 + c * t.value
            }, E(h), 9, Z))), 128))
          ], 8, Q),
          v("g", {
            class: "vch__year__wrapper",
            transform: g(L)
          }, [
            (r(!0), l(D, null, p(w.value.calendar, (h, c) => (r(), l("g", {
              class: "vch__month__wrapper",
              key: c,
              transform: R(c)
            }, [
              (r(!0), l(D, null, p(h, (A, C) => (r(), l(D, { key: C }, [
                A.date < b.value ? (r(), l("rect", {
                  key: 0,
                  class: "vch__day__square",
                  rx: 4,
                  ry: 4,
                  transform: $(C),
                  width: t.value - g(n),
                  height: t.value - g(n),
                  style: W({ fill: S.value[A.colorIndex] }),
                  "data-week-index": c,
                  "data-day-index": C,
                  onClick: (le) => u.$emit("dayClick", A)
                }, null, 12, ee)) : q("", !0)
              ], 64))), 128))
            ], 8, H))), 128))
          ], 8, X)
        ], 8, J))
      ]),
      v("div", te, [
        v("span", null, E(y.value.less), 1),
        v("div", ae, [
          (r(!0), l(D, null, p(S.value, (h, c) => (r(), l("span", {
            key: c,
            class: "vch__legend-modern-box",
            style: W({ background: h })
          }, null, 4))), 128))
        ]),
        v("span", null, E(y.value.more), 1)
      ])
    ]));
  }
});
const ne = (o, e) => {
  const t = o.__vccOpts || o;
  for (const [s, n] of e)
    t[s] = n;
  return t;
}, F = /* @__PURE__ */ ne(se, [["__scopeId", "data-v-e91ba278"]]);
function re(o) {
  o.component(F.name, F);
}
const ue = { install: re };
export {
  F as CalendarHeatmap,
  _ as Heatmap,
  ue as default
};
//# sourceMappingURL=vue3-calendar-heatmap.es.js.map

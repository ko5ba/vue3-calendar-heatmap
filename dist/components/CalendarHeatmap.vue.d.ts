import type { PropType as __PropType } from 'vue';
import { Locale, Value } from '../components/Heatmap';
declare const _sfc_main: import("vue").DefineComponent<{
    endDate: {
        type: __PropType<Date>;
        required: true;
    };
    max: {
        type: __PropType<number | undefined>;
        required: false;
    };
    rangeColor: {
        type: __PropType<string[] | undefined>;
        required: false;
    };
    values: {
        type: __PropType<Value[]>;
        required: true;
    };
    locale: {
        type: __PropType<Partial<Locale> | undefined>;
        required: false;
    };
    vertical: {
        type: __PropType<boolean | undefined>;
        required: false;
    };
    darkMode: {
        type: __PropType<boolean | undefined>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    endDate: {
        type: __PropType<Date>;
        required: true;
    };
    max: {
        type: __PropType<number | undefined>;
        required: false;
    };
    rangeColor: {
        type: __PropType<string[] | undefined>;
        required: false;
    };
    values: {
        type: __PropType<Value[]>;
        required: true;
    };
    locale: {
        type: __PropType<Partial<Locale> | undefined>;
        required: false;
    };
    vertical: {
        type: __PropType<boolean | undefined>;
        required: false;
    };
    darkMode: {
        type: __PropType<boolean | undefined>;
        required: false;
    };
}>>, {}>;
export default _sfc_main;

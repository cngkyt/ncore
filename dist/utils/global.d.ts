export const ENTRIES: {
    <T>(o: {
        [s: string]: T;
    } | ArrayLike<T>): [string, T][];
    (o: {}): [string, any][];
};
export const KEYS: {
    (o: object): string[];
    (o: {}): string[];
};
export const VALUES: {
    <T>(o: {
        [s: string]: T;
    } | ArrayLike<T>): T[];
    (o: {}): any[];
};
export function FIRST(object: any): any;
export function LAST(object: any): any;
export function PRICE(_price: any, suffix?: string): any;
export function TIME(input?: any, format?: string): string | number;
export function ß(selector: any): {
    elements: any[];
    each: (callback: any) => /*elided*/ any;
    on: (event: any, callback: any, bubble: any) => /*elided*/ any;
    off: (event: any, callback: any, bubble: any) => /*elided*/ any;
    contains: (node: any) => boolean;
    class: {
        add: (className: any) => /*elided*/ any;
        remove: (className: any) => /*elided*/ any;
        toggle: (className: any) => /*elided*/ any;
        has: (className: any) => any;
    };
    attr: {
        get: (name: any) => any;
        set: (name: any, value: any) => /*elided*/ any;
        has: (name: any) => any;
    };
    css: {
        get: (prop: any) => string;
        set: (prop: any, value: any) => /*elided*/ any;
    };
    html: (content: any) => any;
    append: (content: any) => /*elided*/ any;
    remove: () => /*elided*/ any;
    data: {
        get: (key: any) => any;
        set: (key: any, value: any) => /*elided*/ any;
    };
    text: (content: any) => any;
    show: () => /*elided*/ any;
    hide: () => /*elided*/ any;
    first: () => /*elided*/ any;
    last: () => /*elided*/ any;
    eq: (index: any) => /*elided*/ any;
    find: (selector: any) => /*elided*/ any;
    closest: (selector: any) => /*elided*/ any;
    parent: () => /*elided*/ any;
    length: () => number;
    index: () => number;
    val: (value: any) => any;
    checked: (value: any) => any;
};
export function RANGE(n: any): number[];
export function RANDOM_NUMBER(n: any): string;
export function RANDOM_ALPHA(n: any): string;
export function RANDOM(n: any): string;

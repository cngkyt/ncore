import CNF from '../conf.js';

let TYPES = {
    PRIMITIVE: 'primitive',
    OBJECT: 'object',
    ARRAY: 'array',
    DATE: 'date',
    REGEXP: 'regexp',
    MAP: 'map',
    SET: 'set',
    UNDEFINED: 'undefined',
    FUNCTION: 'function',
    SYMBOL: 'symbol',
    BIGINT: 'bigint',
    NULL: 'null',
    NAN: 'nan',
    INFINITY: 'infinity',
    NEG_INFINITY: 'neg_infinity'
};

let LOCAL = {
    SET: (key, sec, value) => {
        if (value === undefined) {
            value = sec;;
        } else {
            key += "_" + sec;
        }
        let put = {
            type: null,
            data: null
        };
        if (value === null) {
            put.type = TYPES.NULL;
            put.data = null;
        } else if (value === undefined) {
            put.type = TYPES.UNDEFINED;
            put.data = 'undefined';
        } else if (typeof value === 'bigint') {
            put.type = TYPES.BIGINT;
            put.data = value.toString();
        } else if (typeof value === 'symbol') {
            put.type = TYPES.SYMBOL;
            put.data = value.toString();
        } else if (typeof value === 'function') {
            put.type = TYPES.FUNCTION;
            put.data = value.toString();
        } else if (typeof value === 'number') {
            if (Number.isNaN(value)) {
                put.type = TYPES.NAN;
                put.data = 'NaN';
            } else if (value === Infinity) {
                put.type = TYPES.INFINITY;
                put.data = 'Infinity';
            } else if (value === -Infinity) {
                put.type = TYPES.NEG_INFINITY;
                put.data = '-Infinity';
            } else {
                put.type = TYPES.PRIMITIVE;
                put.data = value;
            }
        } else if (value instanceof Date) {
            put.type = TYPES.DATE;
            put.data = value.toISOString();
        } else if (value instanceof RegExp) {
            put.type = TYPES.REGEXP;
            put.data = {
                source: value.source,
                flags: value.flags
            };
        } else if (value instanceof Map) {
            put.type = TYPES.MAP;
            put.data = Array.from(value.entries());
        } else if (value instanceof Set) {
            put.type = TYPES.SET;
            put.data = Array.from(value.values());
        } else if (Array.isArray(value)) {
            put.type = TYPES.ARRAY;
            put.data = value;
        } else if (typeof value === 'object') {
            put.type = TYPES.OBJECT;
            put.data = value;
        } else {
            // String, boolean, number gibi primitive tipler
            put.type = TYPES.PRIMITIVE;
            put.data = value;
        }

        // JSON.stringify için özel durumlar
        if ([TYPES.OBJECT, TYPES.ARRAY, TYPES.MAP, TYPES.SET, TYPES.REGEXP].includes(put.type)) {
            try {
                localStorage.setItem(key, JSON.stringify(put));
            } catch (error) {
                console.error('Veri kaydedilemedi:', error);
                return false;
            }
        } else {
            localStorage.setItem(key, JSON.stringify(put));
        }

        return true;
    },

    GET: (key, sec) => {
        if (sec) {
            key += "_" + sec;
        }
        let stored = localStorage.getItem(key);

        if (!stored) {
            return null;
        }

        let parsed;
        try {
            parsed = JSON.parse(stored);
        } catch (error) {
            return null;
        }

        if (!parsed || !parsed.type) {
            return null;
        }

        switch (parsed.type) {
            case TYPES.NULL:
                return null;

            case TYPES.UNDEFINED:
                return undefined;

            case TYPES.BIGINT:
                return BigInt(parsed.data);

            case TYPES.SYMBOL:
                const match = parsed.data.match(/Symbol\((.*)\)/);
                return match ? Symbol(match[1] || undefined) : Symbol();

            case TYPES.FUNCTION:
                return new Function('return ' + parsed.data);

            case TYPES.NAN:
                return NaN;

            case TYPES.INFINITY:
                return Infinity;

            case TYPES.NEG_INFINITY:
                return -Infinity;

            case TYPES.DATE:
                return new Date(parsed.data);

            case TYPES.REGEXP:
                return new RegExp(parsed.data.source, parsed.data.flags);

            case TYPES.MAP:
                return new Map(parsed.data);

            case TYPES.SET:
                return new Set(parsed.data);

            case TYPES.ARRAY:
            case TYPES.OBJECT:
                return parsed.data;

            case TYPES.PRIMITIVE:
                return parsed.data;

            default:
                return parsed.data;
        }
    },
    REMOVE: (key, sec) => {
        if (sec) {
            key += "_" + sec;
        }
        localStorage.removeItem(key);
    },
    CLEAR: () => {
        localStorage.clear();
    },
    HAS: (key, sec) => {
        if (sec) {
            key += "_" + sec;
        }
        return localStorage.getItem(key) !== null;
    },
    KEYS: () => {
        return Object.keys(localStorage);
    },
    SIZE: () => {
        return localStorage.length;
    },
    GET_STORAGE_INFO: () => {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            used: total,
            estimated: 5 * 1024 * 1024,
            usage: (total / (5 * 1024 * 1024)) * 100,
            count: localStorage.length
        };
    }
};

export default LOCAL;


if (globalThis.NCORE) {
    if (!globalThis.NCORE.LOCAL) {
        globalThis.NCORE.LOCAL = LOCAL;
    }
}
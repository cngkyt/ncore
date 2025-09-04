import { goto } from "$app/navigation";

export function MS() {
    return Date.now();
}
export function S() {
    return Math.floor(Date.now() / 1000);
}

export function TICK(ms = 0) {
    return new Promise(resolve => setTimeout(() => {
        resolve();
    }, ms));
}

export function GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export function ARRAY_EQUAL(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i]) && Array.isArray(b[i])) {
            if (!ARRAY_EQUAL(a[i], b[i])) return false;
        } else if (typeof a[i] === 'object' && typeof b[i] === 'object') {
            if (!OBJECT_EQUAL(a[i], b[i])) return false;
        } else if (a[i] !== b[i]) return false;
    }
    return true;
}

export function OBJECT_EQUAL(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (let key of Object.keys(a)) {
        if (Array.isArray(a[key]) && Array.isArray(b[key])) {
            if (!ARRAY_EQUAL(a[key], b[key])) return false;
        } else if (typeof a[key] === 'object' && typeof b[key] === 'object') {
            if (!OBJECT_EQUAL(a[key], b[key])) return false;
        } else if (a[key] !== b[key]) return false;
    }
    return true;
}

export function IS_FUNCTION(func) {
    return typeof func === 'function';
};
export function IS_ARRAY(arg) {
    return Array.isArray(arg);
};
export function IS_OBJECT(arg) {
    return typeof arg === 'object';
};
export function IS_PRIMITIVE(arg) {
    return typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'symbol' || typeof arg === 'undefined' || typeof arg === 'bigint';
};

export function IS_NULL(arg) {
    return arg === null;
};

export function IS_EMPTY(arg) {
    if (IS_NULL(arg)) {
        return true;
    }
    if (IS_PRIMITIVE(arg)) {
        return arg === "" || arg === undefined || arg === null;
    }
    if (IS_ARRAY(arg)) {
        return arg.length === 0;
    }
    if (IS_OBJECT(arg)) {
        return Object.keys(arg).length === 0;
    }
    return false;
};

let loops = {};
setInterval(() => {
    Object.entries(loops).forEach(([guid, item]) => {
        if (!item.running) {
            if ((item.fail === false && item.last + (item.time_temp || item.time) < Date.now()) || (item.time_fail && item.fail === true && item.last + item.time_fail < Date.now())) {
                item.time_temp = 0;
                item.running = true;
                item.func().then((result) => {
                    if (typeof result === "number") {
                        if (result > 0) {
                            item.time_temp = result;
                        }
                    } else if (result === false) {
                        if (item.time_fail) {
                            item.fail = true;
                            if (item.max_fail) {
                                item.fail_count++;
                                if (item.fail_count > item.max_fail) {
                                    item.fail = false;
                                    item.time_fail = 0;
                                }
                            }
                        }
                    } else {
                        item.fail = false;
                        if (item.max_fail) {
                            item.fail_count = 0;
                        }
                    }
                }).finally(() => {
                    item.last = Date.now();
                    item.running = false;
                });
            }
        }
    });
}, 25);

export function GOTO(url, force) {
    if (force) {
        document.body.innerHTML = "";
        window.location.replace(url);
    } else {
        goto(url);
    }
}

export function FORCE(url) {
    document.body.innerHTML = "";
    window.location.replace(url);
}

export function LOOP(guid, func, time, time_fail, max_fail) {
    if (IS_FUNCTION(guid)) {
        max_fail = time_fail;
        time_fail = time;
        time = func;
        func = guid;
        guid = GUID();
    }
    if (!func || typeof func !== 'function' || func.constructor.name !== "AsyncFunction") {
        console.error("LOOP: func is not a function or async function");
        return;
    }
    if (!time) {
        time = 1000;
    }
    if (!time_fail) {
        time_fail = false;
    }
    if (!max_fail) {
        max_fail = false;
    }
    loops[guid] = {
        guid: guid,
        func: func,
        time: time,
        time_temp: 0,
        time_fail: time_fail,
        max_fail: max_fail,
        fail_count: 0,
        last: 0,
        running: false,
        fail: false
    };
    return guid;
};

export function UNLOOP(guid) {
    delete loops[guid];
}

export function SPRINTF(format, ...args) {
    let i = 0;
    return format.replace(/%([sdif])/g, (_, type) => {
        let val = args[i++];
        switch (type) {
            case 's': return String(val);
            case 'd': return parseInt(val);
            case 'i': return parseInt(val);
            case 'f': return parseFloat(val);
            default: return val;
        }
    });
}

export function PRINTF(format, ...args) {
    console.log(SPRINTF(format, ...args));
}
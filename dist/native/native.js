import { GUID, IS_FUNCTION } from "../utils/common.js";

const TIMEOUT = 120000;

export let NATIVE = {};
NATIVE.CONNECTED = false;
NATIVE.VISIBLE = true;
NATIVE.INTERFACE = false;
NATIVE.MOBILE = false;
NATIVE.DESKTOP = false;
NATIVE.TV = false;

NATIVE.ANDROID = false;
NATIVE.ANDROIDTV = false;
NATIVE.IOS = false;
NATIVE.WINDOWS = false;
NATIVE.TIZEN = false;
NATIVE.WEBOS = false;

if (typeof __ANDROID_INTERFACE__ !== "undefined") {
    NATIVE.CONNECTED = true;
    NATIVE.INTERFACE = __ANDROID_INTERFACE__;
    NATIVE.ANDROID = __ANDROID_INTERFACE__;
    NATIVE.MOBILE = __ANDROID_INTERFACE__;
} else if (typeof __ANDROIDTV_INTERFACE__ !== "undefined") {
    NATIVE.CONNECTED = true;
    NATIVE.INTERFACE = __ANDROIDTV_INTERFACE__;
    NATIVE.ANDROIDTV = __ANDROIDTV_INTERFACE__;
    NATIVE.TV = __ANDROIDTV_INTERFACE__;
} else if (typeof __IOS_INTERFACE__ !== "undefined") {
    NATIVE.CONNECTED = true;
    NATIVE.INTERFACE = __IOS_INTERFACE__;
    NATIVE.IOS = __IOS_INTERFACE__;
    NATIVE.MOBILE = __IOS_INTERFACE__;
} else if (typeof __WINDOWS_INTERFACE__ !== "undefined") {
    NATIVE.CONNECTED = true;
    NATIVE.INTERFACE = __WINDOWS_INTERFACE__;
    NATIVE.WINDOWS = __WINDOWS_INTERFACE__;
    NATIVE.DESKTOP = __WINDOWS_INTERFACE__;
} else if (typeof __TIZEN_INTERFACE__ !== "undefined") {
    NATIVE.CONNECTED = true;
    NATIVE.INTERFACE = __TIZEN_INTERFACE__;
    NATIVE.TIZEN = __TIZEN_INTERFACE__;
    NATIVE.TV = __TIZEN_INTERFACE__;
} else if (typeof __WEBOS_INTERFACE__ !== "undefined") {
    NATIVE.CONNECTED = true;
    NATIVE.INTERFACE = __WEBOS_INTERFACE__;
    NATIVE.WEBOS = __WEBOS_INTERFACE__;
    NATIVE.TV = __WEBOS_INTERFACE__;
}

let __NATIVE_CALLBACKS__ = {};

globalThis.NATIVE_MESSAGE = function (message) {
    console.log(message);
}

globalThis.NATIVE_CONSOLE = function (message) {
    console.log(message);
}

globalThis.NATIVE_POSITIVE = function (guid, encoded_array) {
    try {
        if (__NATIVE_CALLBACKS__[guid] === undefined) {
            return;
        }
        if (__NATIVE_CALLBACKS__[guid].timeout !== null) {
            clearTimeout(__NATIVE_CALLBACKS__[guid].timeout);
            __NATIVE_CALLBACKS__[guid].timeout = null;
        }
        let answer;
        if (encoded_array === undefined) {
            answer = __NATIVE_CALLBACKS__[guid].positive();
        } else {
            answer = __NATIVE_CALLBACKS__[guid].positive.apply(null, JSON.parse(atob(encoded_array)));
        }
        __NATIVE_CALLBACKS__[guid].answer(answer);
        __NATIVE_CALLBACKS__[guid].finally();
        delete __NATIVE_CALLBACKS__[guid];
    } catch (error) {
        console.error(error);
    }
}
globalThis.NATIVE_NEGATIVE = function (guid, encoded_array) {
    try {
        if (__NATIVE_CALLBACKS__[guid] === undefined) {
            return;
        }
        if (__NATIVE_CALLBACKS__[guid].timeout !== null) {
            clearTimeout(__NATIVE_CALLBACKS__[guid].timeout);
            __NATIVE_CALLBACKS__[guid].timeout = null;
        }
        let answer;
        if (encoded_array === undefined) {
            answer = __NATIVE_CALLBACKS__[guid].negative();
        } else {
            answer = __NATIVE_CALLBACKS__[guid].negative.apply(null, JSON.parse(atob(encoded_array)));
        }
        __NATIVE_CALLBACKS__[guid].answer(answer);
        __NATIVE_CALLBACKS__[guid].finally();
        delete __NATIVE_CALLBACKS__[guid];
    } catch (error) {
        console.error(error);
    }
}
globalThis.NATIVE_ERROR = function (guid, encoded_array) {
    try {
        if (__NATIVE_CALLBACKS__[guid] === undefined) {
            return;
        }
        if (__NATIVE_CALLBACKS__[guid].timeout !== null) {
            clearTimeout(__NATIVE_CALLBACKS__[guid].timeout);
            __NATIVE_CALLBACKS__[guid].timeout = null;
        }
        let answer;
        if (encoded_array === undefined) {
            answer = __NATIVE_CALLBACKS__[guid].error();
        } else {
            answer = __NATIVE_CALLBACKS__[guid].error.apply(null, JSON.parse(atob(encoded_array)));
        }
        __NATIVE_CALLBACKS__[guid].answer(answer);
        __NATIVE_CALLBACKS__[guid].finally();
        delete __NATIVE_CALLBACKS__[guid];
    } catch (error) {
        console.error(error);
    }
}
globalThis.NATIVE_PROGRESS = function (guid, encoded_array) {
    try {
        if (__NATIVE_CALLBACKS__[guid] === undefined) {
            return;
        }
        if (__NATIVE_CALLBACKS__[guid].timeout !== null) {
            clearTimeout(__NATIVE_CALLBACKS__[guid].timeout);
            __NATIVE_CALLBACKS__[guid].timeout = null;
        }
        if (encoded_array === undefined) {
            __NATIVE_CALLBACKS__[guid].progress();
            return;
        }
        __NATIVE_CALLBACKS__[guid].progress.apply(null, JSON.parse(atob(encoded_array)));
    } catch (error) {
        console.error(error);
    }
}

globalThis.NATIVE_PING = function () {
    NATIVE.INTERFACE.__PONG__();
}

globalThis.NATIVE_VISIBLE = function (state) {
    NATIVE.VISIBLE = state;
}

let NTV_EMPTY = function () {
    return {
        positive: () => { return true; },
        negative: () => { return false; },
        error: () => { return false; },
        progress: () => { },
        finally: () => { },
        POSITIVE: function () {
            return this;
        },
        NEGATIVE: function (func) {
            this.negative = func;
            return this;
        },
        ERROR: function (func) {
            this.error = func;
            return this;
        },
        PROGRESS: function (func) {
            this.progress = func;
            return this;
        },
        FINALLY: function (func) {
            this.finally = func;
            return this;
        },
        SEND: async function () {
            this.error();
            this.finally();
            return new Promise((resolve, reject) => {
                resolve(null);
            });
        }
    };
}

export function NTV(method, ...args) {
    if (!NATIVE.INTERFACE) {
        console.error("NATIVE.INTERFACE is not defined");
        return NTV_EMPTY();
    }
    let data = {};
    data.method = method;
    data.guid = GUID();
    data.arguments = args;

    __NATIVE_CALLBACKS__[data.guid] = {
        guid: data.guid,
        answer: () => { },
        positive: () => { return true; },
        negative: () => { return false; },
        error: () => { return false; },
        progress: () => { },
        finally: () => { },
        promise: null,
        timeout: setTimeout(() => {
            __NATIVE_CALLBACKS__[data.guid].answer(null);
        }, TIMEOUT),
    };
    __NATIVE_CALLBACKS__[data.guid].promise = new Promise((resolve, reject) => {
        __NATIVE_CALLBACKS__[data.guid].answer = resolve;
    });

    return {
        POSITIVE: function (func) {
            if (IS_FUNCTION(func)) {
                __NATIVE_CALLBACKS__[data.guid].positive = func;
            }
            return this;
        },
        NEGATIVE: function (func) {
            if (IS_FUNCTION(func)) {
                __NATIVE_CALLBACKS__[data.guid].negative = func;
            }
            return this;
        },
        ERROR: function (func) {
            if (IS_FUNCTION(func)) {
                __NATIVE_CALLBACKS__[data.guid].error = func;
            }
            return this;
        },
        PROGRESS: function (func) {
            if (IS_FUNCTION(func)) {
                __NATIVE_CALLBACKS__[data.guid].progress = func;
            }
            return this;
        },
        FINALLY: function (func) {
            if (IS_FUNCTION(func)) {
                __NATIVE_CALLBACKS__[data.guid].finally = func;
            }
            return this;
        },
        SEND: async function (timeout) {
            let sent = JSON.stringify(data);
            if (NATIVE.INTERFACE) {
                NATIVE.INTERFACE.__RESOLVE__(btoa(sent));
                if (timeout !== undefined) {
                    setTimeout(() => {
                        __NATIVE_CALLBACKS__[data.guid].answer(null);
                        delete __NATIVE_CALLBACKS__[data.guid];
                    }, timeout);
                }
                return __NATIVE_CALLBACKS__[data.guid].promise;
            }
            return null;
        },
    }
}

export function NTV_MOBILE(method, ...args) {
    if (!NATIVE.MOBILE) {
        console.error("NATIVE.MOBILE is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_TV(method, ...args) {
    if (!NATIVE.TV) {
        console.error("NATIVE.TV is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_DESKTOP(method, ...args) {
    if (!NATIVE.DESKTOP) {
        console.error("NATIVE.DESKTOP is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_ANDROID(method, ...args) {
    if (!NATIVE.ANDROID) {
        console.error("NATIVE.ANDROID is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_ANDROIDTV(method, ...args) {
    if (!NATIVE.ANDROIDTV) {
        console.error("NATIVE.ANDROIDTV is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_IOS(method, ...args) {
    if (!NATIVE.IOS) {
        console.error("NATIVE.IOS is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_WINDOWS(method, ...args) {
    if (!NATIVE.WINDOWS) {
        console.error("NATIVE.WINDOWS is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_TIZEN(method, ...args) {
    if (!NATIVE.TIZEN) {
        console.error("NATIVE.TIZEN is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}
export function NTV_WEBOS(method, ...args) {
    if (!NATIVE.WEBOS) {
        console.error("NATIVE.WEBOS is not defined");
        return NTV_EMPTY();
    }
    return NTV(method, ...args);
}






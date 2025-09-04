import CNF from '$lib/conf.js';

function setCookie(key, value, days = 365) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function getCookie(key) {
    const nameEQ = encodeURIComponent(key) + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}
function removeCookie(key) {
    document.cookie = `${encodeURIComponent(key)}=; Max-Age=0; path=/`;
}

let COOKIE = {
    SET: (key, sec, value) => {
        if (value === undefined) {
            value = sec;
        } else {
            key += "_" + sec;
        }
        try {
            setCookie(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Cookie kaydedilemedi:', e);
            return false;
        }
    },

    GET: (key, sec) => {
        if (sec) {
            key += "_" + sec;
        }
        let val = getCookie(key);
        if (!val) {
            return null;
        }
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    },

    REMOVE: (key, sec) => {
        if (sec) {
            key += "_" + sec;
        }
        removeCookie(key);
    },

    CLEAR: () => {
        document.cookie.split(";").forEach(c => {
            let eqPos = c.indexOf("=");
            let name = eqPos > -1 ? c.substr(0, eqPos) : c;
            removeCookie(name.trim());
        });
    },

    HAS: (key, sec) => {
        if (sec) {
            key += "_" + sec;
        }
        return getCookie(key) !== null;
    },

    KEYS: () => {
        return document.cookie.split(";").map(c => decodeURIComponent(c.split("=")[0].trim()));
    },

    SIZE: () => {
        return document.cookie.split(";").length;
    },

    GET_STORAGE_INFO: () => {
        let total = document.cookie.length;
        return {
            used: total,
            estimated: 4096, // browser başına cookie limitleri değişebilir
            usage: (total / 4096) * 100,
            count: document.cookie.split(";").length
        };
    }
};

export default COOKIE;

if (globalThis.NCORE) {
    if (!globalThis.NCORE.COOKIE) {
        globalThis.NCORE.COOKIE = COOKIE;
    }
}

export const ENTRIES = Object.entries;
export const KEYS = Object.keys;
export const VALUES = Object.values;
export const FIRST = function (object) {
    if (!object) {
        return null;
    }
    if (typeof object !== "object") {
        return null;
    }
    if (Object.keys(object).length === 0) {
        return null;
    }
    return Object.values(object)[0];
};
export const LAST = function (object) {
    if (!object) {
        return null;
    }
    if (typeof object !== "object") {
        return null;
    }
    if (Object.keys(object).length === 0) {
        return null;
    }
    return Object.values(object)[Object.keys(object).length - 1];
};

export const PRICE = function (_price, suffix = "") {
    const parts = _price.toString().split(".");
    let integerPart = parts[0];
    let decimalPart = parts[1] ? parts[1].slice(0, 2) : "";

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    let result = decimalPart ? `${integerPart},${decimalPart.padEnd(2, "0")}` : integerPart;

    return suffix ? result + " " + suffix : result;
};

export const TIME = function (input = undefined, format = "d.m.y H:i") {
    if (typeof input === "undefined") {
        return Math.floor(Date.now() / 1000);
    }

    if (typeof input === "number") {
        const date = new Date(input * 1000);

        const map = {
            d: String(date.getDate()).padStart(2, "0"),
            m: String(date.getMonth() + 1).padStart(2, "0"),
            Y: date.getFullYear(),
            y: String(date.getFullYear()).slice(-2),
            H: String(date.getHours()).padStart(2, "0"),
            i: String(date.getMinutes()).padStart(2, "0"),
            s: String(date.getSeconds()).padStart(2, "0"),
        };

        return format.replace(/d|m|Y|y|H|i|s/g, match => map[match]);
    }

    if (typeof input === "string") {
        const date = new Date(input);
        if (isNaN(date.getTime())) return null;
        return Math.floor(date.getTime() / 1000);
    }

    return Math.floor(Date.now() / 1000);
};


export const ß = function (selector) {
    const elements = selector instanceof Node ? [selector] : document.querySelectorAll(selector);

    const instance = {
        elements: Array.from(elements),

        each: function (callback) {
            this.elements.forEach(callback);
            return this;
        },

        on: function (event, callback, bubble) {
            this.elements.forEach(el => el.addEventListener(event, callback, bubble));
            return this;
        },

        off: function (event, callback, bubble) {
            this.elements.forEach(el => el.removeEventListener(event, callback, bubble));
            return this;
        },

        contains: function (node) {
            return this.elements.some(el => el.contains(node));
        },

        class: {
            add: function (className) {
                instance.elements.forEach(el => el.classList.add(className));
                return instance;
            },

            remove: function (className) {
                instance.elements.forEach(el => el.classList.remove(className));
                return instance;
            },

            toggle: function (className) {
                instance.elements.forEach(el => el.classList.toggle(className));
                return instance;
            },

            has: function (className) {
                return instance.elements[0] ? instance.elements[0].classList.contains(className) : false;
            }
        },

        attr: {
            get: function (name) {
                return instance.elements[0] ? instance.elements[0].getAttribute(name) : null;
            },

            set: function (name, value) {
                instance.elements.forEach(el => el.setAttribute(name, value));
                return instance;
            },

            has: function (name) {
                return instance.elements[0] ? instance.elements[0].hasAttribute(name) : false;
            }
        },

        css: {
            get: function (prop) {
                return getComputedStyle(instance.elements[0])[prop];
            },
            set: function (prop, value) {
                instance.elements.forEach(el => el.style[prop] = value);
                return instance;
            }
        },

        html: function (content) {
            if (content === undefined) {
                return instance.elements[0] ? instance.elements[0].innerHTML : '';
            }
            this.each(el => el.innerHTML = content);
            return this;
        },

        append: function (content) {
            this.elements.forEach(el => {
                if (typeof content === 'string') {
                    el.insertAdjacentHTML('beforeend', content);
                } else {
                    el.appendChild(content);
                }
            });
            return this;
        },

        remove: function () {
            this.elements.forEach(el => el.remove());
            return this;
        },

        data: {
            get: function (key) {
                return instance.elements[0]?.dataset[key];
            },
            set: function (key, value) {
                instance.elements.forEach(el => el.dataset[key] = value);
                return instance;
            }
        },

        text: function (content) {
            if (content === undefined) {
                return instance.elements[0] ? instance.elements[0].textContent : '';
            }
            this.each(el => el.textContent = content);
            return this;
        },

        show: function () {
            this.elements.forEach(el => el.style.display = '');
            return this;
        },

        hide: function () {
            this.elements.forEach(el => el.style.display = 'none');
            return this;
        },

        first: function () {
            return ß([this.elements[0]].filter(Boolean));
        },

        last: function () {
            return ß([this.elements[this.elements.length - 1]].filter(Boolean));
        },

        eq: function (index) {
            return ß([this.elements[index]].filter(Boolean));
        },

        find: function (selector) {
            const found = [];
            this.elements.forEach(el => {
                found.push(...el.querySelectorAll(selector));
            });
            return ß(found);
        },

        closest: function (selector) {
            return ß([this.elements[0]?.closest(selector)].filter(Boolean));
        },

        parent: function () {
            return ß(this.elements.map(el => el.parentElement).filter(Boolean));
        },

        length: function () {
            return this.elements.length;
        },

        index: function () {
            const parent = this.elements[0]?.parentElement;
            return parent ? Array.from(parent.children).indexOf(this.elements[0]) : -1;
        },

        val: function (value) {
            if (value === undefined) {
                return this.elements[0]?.value || '';
            }
            this.elements.forEach(el => el.value = value);
            return this;
        },

        checked: function (value) {
            if (value === undefined) {
                return this.elements[0]?.checked || false;
            }
            this.elements.forEach(el => el.checked = value);
            return this;
        }
    };

    return instance;
};

export const RANGE = function (n) {
    return Array(n).fill(0).map((_, i) => i + 1);
}

export const RANDOM_NUMBER = function (n) {
    let result = "";
    for (let i = 0; i < n; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

export const RANDOM_ALPHA = function (n) {
    let alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < n; i++) {
        result += alpha[Math.floor(Math.random() * alpha.length)];
    }
    return result;
}

export const RANDOM = function (n) {
    return RANDOM_ALPHA(n);
}
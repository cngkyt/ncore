
const DEBUG = false;

let LOG = () => { }
let WARN = () => { }

if (DEBUG) {
    LOG = console.log;
    WARN = console.warn;
}

const KEY_NAME_MAP = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'Enter': 'enter',
    'Escape': 'esc',
    'Backspace': 'esc'
};
const KEY_CODE_MAP = {
    37: 'left',
    39: 'right',
    38: 'up',
    40: 'down',
    13: 'enter',
    27: 'esc',
    8: 'esc'
};

function NavNode(config) {
    this.id = config.id;
    this.parent = config.parent;
    this.direction = config.direction;

    this.direct = config.direct;

    this.focus_callback = config.focus_callback || null;
    this.blur_callback = config.blur_callback || null;

    this.element = null;
    this.handlers = {};

    this.auto = config.auto || null;
    this.remember = config.remember || null;
    this.trap = config.trap || null;
    this.loop = config.loop || null;

    this.focused = null;
    this.children = [];

    const handlers = [
        'on_focus', 'par_focus',
        'on_blur', 'par_blur',
        'on_enter', 'par_enter',
        'on_enter_after', 'par_enter_after',
        'on_esc', 'par_esc',
        'on_esc_after', 'par_esc_after',
        'on_left', 'par_left',
        'on_right', 'par_right',
        'on_up', 'par_up',
        'on_down', 'par_down',
        'on_navigate', 'par_navigate',
        'on_register',
        'on_unregister'
    ];

    handlers.forEach(name => {
        this.handlers[name] = config[name] || null;
    });

    //PARENT STUFF
    //////////////////////////////////////////

    this.update_timeout = null;
    this.update = function () {
        LOG('Updating children of:', this.id);
        this.children.sort((a, b) => {
            let node_a = getnode(a);
            let node_b = getnode(b);
            const rect_a = node_a.element.getBoundingClientRect();
            const rect_b = node_b.element.getBoundingClientRect();

            if (this.direction === "vertical") {
                return rect_a.top - rect_b.top;
            } else {
                return rect_a.left - rect_b.left;
            }
        });
    };

    this.add = function (node) {
        LOG('Adding:', node.id, "To:", this.id);
        if (this.focused === null) {
            this.focused = this.children.length > 0 ? this.children[0] : null;
        }
        this.children.push(node.id);

        if (this.update_timeout) {
            clearTimeout(this.update_timeout);
        }
        this.update_timeout = setTimeout(() => {
            this.update();
        }, 100);
    };

    this.remove = function (node) {
        LOG('Removing:', node.id, "From:", this.id);
        this.children.splice(this.children.indexOf(node.id), 1);
        if (this.focused === node.id) {
            this.focused = this.children[0] || null;
        }

        if (this.update_timeout) {
            clearTimeout(this.update_timeout);
        }
        this.update_timeout = setTimeout(() => {
            this.update();
        }, 100);
    };

    this.getchild = function (id) {
        if (id == null) {
            id = this.children[0];
        }
        let child_node = getnode(id);
        if (!child_node) {
            return null;
        }

        return child_node;
    };

    this.getfocused = function () {
        if (this.focused == null && this.children.length > 0) {
            this.focused = this.children[0];
        }
        let child_node = getnode(this.focused);
        if (!child_node) {
            return null;
        }

        return child_node;
    };

    this.getremembered = function () {
        if (this.children.length == 0) {
            return null;
        }
        let return_node = null;
        if (this.remember) {
            return_node = this.getfocused();
        }
        if (!return_node) {
            return_node = this.getchild();
        }
        return return_node;
    };

    this.getnext = function () {
        if(!this.children.length){
            return null;
        }
        if (this.focused == null && this.children.length > 0) {
            this.focused = this.children[0];
        }

        const id = this.focused;

        let index = this.children.indexOf(id);
        if (index == -1) {
            index = 0;
        }
        let next_index = index + 1;
        if(next_index >= this.children.length){
            if(this.loop){
                next_index = 0;
            }else{
                return null;
            }
        }

        const next_id = this.children[next_index];
        if (!next_id) {
            return null;
        }
        const child_node = getnode(next_id);
        if (!child_node) {
            return null;
        }


        return child_node;
    };

    this.getprev = function () {
        if(!this.children.length){
            return null;
        }
        if (this.focused == null && this.children.length > 0) {
            this.focused = this.children[0];
        }

        const id = this.focused;

        let index = this.children.indexOf(id);
        if (index == -1) {
            index = 0;
        }
        let prev_index = index - 1;
        if(prev_index < 0){
            if(this.loop){
                prev_index = this.children.length - 1;
            }else{
                return null;
            }
        }
        const prev_id = this.children[prev_index];
        if (!prev_id) {
            return null;
        }
        const child_node = getnode(prev_id);
        if (!child_node) {
            return null;
        }


        return child_node;
    };

    //////////////////////////////////////////

    //CHILD STUFF
    //////////////////////////////////////////

    this.getparent = function () {
        let parent_node = getnode(this.parent);
        if (!parent_node) {
            return null;
        }

        return parent_node;
    };

    this.focus = function (silent = false) {
        let parent = this.getparent();

        if (parent) {
            if (!silent) {
                if (NAV.current !== parent.id) {
                    LOG('Focus Previous Set:', NAV.current);
                    NAV.previous.push(NAV.current);
                    if (NAV.previous.length > 10) {
                        NAV.previous.shift();
                    }
                }
                LOG('Focus Parent Set:', parent.id);
                NAV.current = parent.id;
            }
            parent.focused = this.id;
        }

        if (!silent) {
            NAV.focused = this.id;
            if (this.focus_callback) {
                this.focus_callback();
            }
        }
        if (this.auto || this.trap) {
            let remembered = this.getremembered();
            if (remembered) {
                LOG('Focus Auto Focusing:', remembered.id);
                remembered.focus(silent);
                return;
            }
        }

        LOG('Focus Focused:', this.id);
    };

    this.blur = function () {
        if (this.blur_callback) {
            this.blur_callback();
        }
    };
}

globalThis.NAV = {
    current: null,
    previous: [],
    focused: null,
    disabled: false,
    nodes: {},

    register: function (config) {
        const node = new NavNode(config);
        this.nodes[node.id] = node;
        return node;
    },

    bind: async function (id, element) {
        let node = this.nodes[id];
        if (!node) return;
        node.element = element;
        if (node.parent) {
            let parent = this.nodes[node.parent];
            if (parent) {
                parent.add(node);
            }

            if (parent && parent.id == "root" && !parent.focused) {
                if (parent) {
                    LOG('Init:', node.id, 'Focusing:', parent.id);
                    parent.focus();
                }
            }
        }
        if (node.direct) {
            let focused = getfocused();
            LOG('Binding Direct:', node);
            if (focused) {
                let focused_parent = getparent(focused);
                if (focused_parent && await trigger_event_par(focused_parent, 'blur') === false) return;
                if (await trigger_event_on(focused, 'blur') === false) return;
            }
            let remembered = node.getremembered();
            if (!remembered) {
                LOG('Remembered Not Found:', node.id);
                return;
            }

            if (await trigger_event_par(node, 'focus') === false) return;
            if (await trigger_event_on(node, 'focus') === false) return;
            if (await trigger_event_on(remembered, 'focus') === false) return;

            if (focused) {
                focused.blur();
            }
            LOG('Remembered Focusing:', remembered.id);
            remembered.focus();
        }
    },

    unregister: function (id) {
        let node = this.nodes[id];
        if (!node) return;

        if (node.parent) {
            let parent = this.nodes[node.parent];
            if (parent) {
                parent.remove(node);
            }
        }
        if (node.update_timeout) {
            clearTimeout(node.update_timeout);
        }

        delete this.nodes[id];

        let prev_node = getprev(node);
        if (prev_node) {
            prev_node.focus();
        }
    },

    init: function (id) {
        let node = this.nodes[id];
        if (!node) return;

        this.current = node.id;
        let child = node.getremembered();
        if (child) {
            LOG('Init:', node.id, 'Focusing:', child.id);
            child.focus();
        }
        // for (let [key, node] of Object.entries(NAV.nodes)) {
        //     console.log(node);
        // }
    },

    select: async function (id, silent = false) {
        let node = this.nodes[id];
        if (!node) return;
        let parent = node.getparent();

        if (!silent) {
            let focused = this.nodes[this.focused];
            if (focused) {
                let focused_parent = getparent(focused);
                if (focused_parent && await trigger_event_par(focused_parent, 'blur') === false) return;
                if (await trigger_event_on(focused, 'blur') === false) return;
            }
            if (parent && await trigger_event_par(parent, 'focus') === false) return;
            if (await trigger_event_on(node, 'focus') === false) return;
            if (focused) {
                focused.blur();
            }
        }
        let parent_focused = node;
        if (!silent) {
            while (parent) {
                LOG('Focus Parent Set Selection:', parent.id);
                parent.focused = parent_focused.id;
                parent_focused = parent;
                parent = parent.getparent();
            }
        }


        node.focus(silent);
    },

    move: async function (id, by, silent = false) {
        let parent = this.nodes[id];
        if (!parent) return;
        if (!silent) {
            let focused = this.nodes[this.focused];
            if (focused) {
                if (await trigger_event_par(parent, 'blur') === false) return;
                if (await trigger_event_on(focused, 'blur') === false) return;
                focused.blur();
            }
        }

        const index = parent.children.indexOf(parent.focused);
        if (index == -1) {
            return;
        }
        let next_index = index + by;
        if (next_index < 0) {
            if(index == 0 && parent.loop){
                next_index = parent.children.length - 1;
            }else{
                next_index = 0;
            }
        }
        if (next_index >= parent.children.length) {
            if(index == parent.children.length - 1 && parent.loop){
                next_index = 0;
            }else{
                next_index = parent.children.length - 1;
            }
        }
        const next_id = parent.children[next_index];
        const next_node = this.nodes[next_id];
        if (!next_node) {
            return;
        }
        if (!silent) {
            if (await trigger_event_par(parent, 'focus') === false) return;
            if (await trigger_event_on(next_node, 'focus') === false) return;
        }
        next_node.focus(silent);
    },

    set: async function (id, to, silent = false) {
        let parent = this.nodes[id];
        if (!parent) return;
        if (!silent) {
            let focused = this.nodes[this.focused];
            if (focused) {
                if (await trigger_event_par(parent, 'blur') === false) return;
                if (await trigger_event_on(focused, 'blur') === false) return;
                focused.blur();
            }
        }

        let next_id = null;
        if(typeof to == "string"){
            next_id = to;
        }else{
            if (to < 0) {
                to = 0;
            }
            if (to >= parent.children.length) {
                to = parent.children.length - 1;
            }
            next_id = parent.children[to];
        }
        const next_node = this.nodes[next_id];
        if (!next_node) {
            return;
        }
        if (!silent) {
            if (await trigger_event_par(parent, 'focus') === false) return;
            if (await trigger_event_on(next_node, 'focus') === false) return;
        }
        next_node.focus(silent);
    },

    disable: function () {
        this.disabled = true;
    },

    enable: function () {
        this.disabled = false;
    },

    interceptor: null
};

function getnode(id) {
    return NAV.nodes[id];
}
function getcurrent() {
    return getnode(NAV.current);
}
function getfocused() {
    return getnode(NAV.focused);
}

function getparent(node) {
    if (typeof node == 'string') {
        node = getnode(node);
    }
    if (!node) return null;
    if (!node.parent) return null;
    return getnode(node.parent);
}

function getprev(node) {
    let return_node = null;
    if (NAV.previous.length) {
        for (let i = NAV.previous.length - 1; i >= 0; i--) {
            return_node = getnode(NAV.previous[i]);
            if (return_node) {
                break;
            }
        }
    }
    if (!return_node) {
        return_node = node.getparent();
        if (!return_node) {
            return_node = getnode("root");
            if (!return_node) {
                return null;
            }
        }
    }
    return return_node;
}

async function trigger_event_on(node, action, direction = null) {
    if (!node) return true;

    WARN('Triggering:', node.id, "on_" + action, direction);

    try {
        if (action === 'navigate') {
            if (node.handlers.on_navigate) {
                const result = await node.handlers.on_navigate(NAV, node, action, direction);
                if (result === false) return false;
            }
        } else {
            const handler_name = direction ? `on_${direction}` : `on_${action}`;
            if (node.handlers[handler_name]) {
                const result = await node.handlers[handler_name](NAV, node, action, direction);
                if (result === false) return false;
            }
        }

    } catch (e) {
        console.error('Event handler error:', e);
        return false;
    }

    return true;
}

async function trigger_event_par(node, action, direction = null) {
    if (!node) return true;

    WARN('Triggering:', node.id, "par_" + action, direction);

    try {
        if (action === 'navigate') {
            if (node.handlers.on_navigate) {
                const result = await node.handlers.par_navigate(NAV, node, action, direction);
                if (result === false) return false;
            }
        } else {
            const handler_name = direction ? `par_${direction}` : `par_${action}`;
            if (node.handlers[handler_name]) {
                const result = await node.handlers[handler_name](NAV, node, action, direction);
                if (result === false) return false;
            }
        }

    } catch (e) {
        console.error('Event handler error:', e);
        return false;
    }

    return true;
}


async function navigate(direction, parent) {
    if (typeof parent === 'string') {
        parent = getnode(parent);
    }
    if (!parent) return;

    if (await trigger_event_par(parent, 'navigate', direction) === false) return;
    if (await trigger_event_par(parent, direction) === false) return;

    LOG('Navigating:', parent.id, direction);

    let node = null;

    if (parent.direction === "vertical") {
        if (direction === "down") {
            node = parent.getnext();
        } else if (direction === "up") {
            node = parent.getprev();
        }
    } else if (parent.direction === "horizontal") {
        if (direction === "right") {
            node = parent.getnext();
        } else if (direction === "left") {
            node = parent.getprev();
        }
    }

    if (!node) {
        if (!parent.auto) {
            LOG('Navigating:', parent.id, direction, 'No navigate node found');
            return;
        }
        let grandparent = parent.getparent();
        if (!grandparent) {
            LOG('Navigating:', parent.id, direction, 'No parent node found');
            return;
        };
        LOG('Navigating:', parent.id, direction, 'Parent node found:', grandparent.id);
        return navigate(direction, grandparent);
    };

    if (await trigger_event_on(node, 'navigate', direction) === false) return;
    if (await trigger_event_on(node, direction) === false) return;

    if (await trigger_event_par(parent, "focus") === false) return;
    if (await trigger_event_on(node, "focus") === false) return;

    let focused_node = getfocused();
    if (focused_node) {
        let focused_node_parent = focused_node.getparent();
        if (focused_node_parent && await trigger_event_par(focused_node_parent, "blur") === false) return;
        if (await trigger_event_on(focused_node, "blur") === false) return;
        focused_node.blur();
    }

    LOG('Navigated:', parent.id, direction);
    node.focus();
}

async function enter() {
    let current_node = getcurrent();
    if (!current_node) return;

    let focused_node = getnode(current_node.focused);
    if (!focused_node) return;

    if (await trigger_event_par(current_node, 'enter') === false) return;
    if (await trigger_event_on(focused_node, 'enter') === false) return;

    let remembered_node = focused_node.getremembered();
    if (!remembered_node) return;

    if (await trigger_event_par(current_node, 'blur') === false) return;
    if (await trigger_event_on(focused_node, 'blur') === false) return;

    if (await trigger_event_par(focused_node, 'focus') === false) return;
    if (await trigger_event_on(remembered_node, 'focus') === false) return;

    focused_node.blur();
    remembered_node.focus();

    if (await trigger_event_par(current_node, 'enter_after') === false) return;
    if (await trigger_event_on(focused_node, 'enter_after') === false) return;
}

async function esc() {
    let current_node = getcurrent();
    if (!current_node) return;

    let old_node = getnode(current_node.focused);
    if (!old_node) return;

    if (await trigger_event_par(current_node, 'esc') === false) return;
    if (await trigger_event_on(old_node, 'esc') === false) return;

    let parent_node = current_node.getparent();
    if (!parent_node) return;

    let new_node = parent_node.getremembered();
    if (!new_node) return;

    if (await trigger_event_par(current_node, 'blur') === false) return;
    if (await trigger_event_on(old_node, 'blur') === false) return;
    if (await trigger_event_par(parent_node, 'focus') === false) return;
    if (await trigger_event_on(new_node, 'focus') === false) return;

    old_node.blur();
    new_node.focus();

    if (await trigger_event_par(current_node, 'esc_after') === false) return;
    if (await trigger_event_on(old_node, 'esc_after') === false) return;
}


let keyboard_is_open = false;
let listener_is_busy = false;

async function keyboard_handler(action) {
    const actions = {
        'left': () => navigate('left', NAV.current),
        'right': () => navigate('right', NAV.current),
        'up': () => navigate('up', NAV.current),
        'down': () => navigate('down', NAV.current),
        'enter': enter,
        'esc': esc
    };
    await actions[action]?.();
    listener_is_busy = false;
}

if (!globalThis.NAV_LISTENERS) {

    window.addEventListener('keydown', function (event) {
        if (keyboard_is_open) return false;
        const action = KEY_NAME_MAP[event.key] || KEY_CODE_MAP[event.keyCode];
        if (!action) return false;

        if (NAV.interceptor && NAV.interceptor(action) === false) return false;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
    }, true);

    window.addEventListener('keyup', function (event) {
        if (NAV.disabled) return false;
        if (keyboard_is_open) return false;
        const action = KEY_NAME_MAP[event.key] || KEY_CODE_MAP[event.keyCode];
        if (!action) return false;
        LOG('Key pressed:', event.key, 'KeyCode:', event.keyCode, 'Action:', action);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (listener_is_busy) return false;
        listener_is_busy = true;

        keyboard_handler(action);

        return false;
    }, true);

    window.addEventListener("keyboardVisibility", (e) => {
        if (e.detail === true) {
            LOG("Keyboard Opened");
            keyboard_is_open = true;
        } else {
            LOG("Keyboard Closed");
            keyboard_is_open = false;
        }
    });

    globalThis.NAV_LISTENERS = true;
}

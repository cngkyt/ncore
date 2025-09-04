<script>
    import { onMount, onDestroy } from "svelte";

    export let id = "";
    export let parent = "root";
    export let direction = "vertical";

    if (direction != "vertical" && direction != "horizontal") {
        direction = "vertical";
    }

    export let auto = false;
    export let remember = false;
    export let init = false;
    export let direct = false;
    // export let direct = false;
    export let trap = false;
    export let loop = false;

    export let onmount = null;
    export let ondestroy = null;

    //ILGILI NAVDA HER OLAYDA TETİKLENİR
    export let onFocus = null;
    export let parFocus = null;
    export let onBlur = null;
    export let parBlur = null;
    export let onEnter = null;
    export let onEnterAfter = null;
    export let parEnter = null;
    export let parEnterAfter = null;
    export let onEsc = null;
    export let onEscAfter = null;
    export let parEsc = null;
    export let parEscAfter = null;
    export let onLeft = null;
    export let parLeft = null;
    export let onRight = null;
    export let parRight = null;
    export let onUp = null;
    export let parUp = null;
    export let onDown = null;
    export let parDown = null;
    export let onNavigate = null;
    export let parNavigate = null;
    export let onRegister = null;
    export let onUnregister = null;

    export let scrollCenter = true;

    id = id || Math.random().toString(36).substring(2, 12);

    export let element;
    let node;

    export let focused = false;

    let focus_callback = () => {
        focused = true;
        element.classList.add("navfocus");

        element.scrollIntoView({
            behavior: "instant",
            block: scrollCenter ? "center" : "nearest",
            inline: scrollCenter ? "center" : "nearest",
        });
    };
    let blur_callback = () => {
        focused = false;
        if(element){
            element.classList.remove("navfocus");
        }
    };

    node = NAV.register({
        id,
        parent,
        direction,
        direct,

        focus_callback,
        blur_callback,

        auto,
        remember,
        trap,
        loop,
        init,

        on_focus: onFocus,
        par_focus: parFocus,
        on_blur: onBlur,
        par_blur: parBlur,
        on_enter: onEnter,
        on_enter_after: onEnterAfter,
        par_enter: parEnter,
        par_enter_after: parEnterAfter,
        on_esc: onEsc,
        on_esc_after: onEscAfter,
        par_esc: parEsc,
        par_esc_after: parEscAfter,
        on_left: onLeft,
        par_left: parLeft,
        on_right: onRight,
        par_right: parRight,
        on_up: onUp,
        par_up: parUp,
        on_down: onDown,
        par_down: parDown,
        on_navigate: onNavigate,
        par_navigate: parNavigate,
        on_register: onRegister,
        on_unregister: onUnregister,
    });

    onMount(() => {
        if (element) {
            element.tabIndex = -1;
            NAV.bind(node.id, element);
            if (onmount) {
                onmount(NAV, node);
            }
        }
    });

    onDestroy(() => {
        if (node) {
            if (ondestroy) {
                ondestroy(NAV, node);
            }
            NAV.unregister(node.id);
        }
    });
</script>

<div navid={id} bind:this={element} {...$$restProps}>
    <slot {focused}/>
</div>

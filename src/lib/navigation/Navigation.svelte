<script>
    import { onMount} from "svelte";
    import "$src/nav/Navigation.js";

    export let id = "root";
    export let parent = "";
    export let direction = "vertical";

    if (direction != "vertical" && direction != "horizontal") {
        direction = "vertical";
    }

    export let remember = true;

    let container;

    let node = NAV.register({
        id,
        parent,
        direction,
        remember,
        auto: true,
    });

    onMount(() => {
        NAV.bind(id, container);
        setTimeout(() => {
            NAV.init(id);
        }, 0);

        return () => {
            if (node) {
                NAV.unregister(id);
            }
        };
    });
</script>

<div navid={id} bind:this={container} class="navigation-container h-full w-full">
    <slot />
</div>

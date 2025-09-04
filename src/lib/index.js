
if (import.meta.env.DEBUG) {
    console.warn("NCORE DEBUG MODE");
    if (!globalThis.NCORE) {
        globalThis.NCORE = {};
    }
}


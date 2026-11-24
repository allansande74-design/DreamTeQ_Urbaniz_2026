if ("serviceWorker" in globalThis.navigator) {
  globalThis.addEventListener("load", () => {
    globalThis.navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

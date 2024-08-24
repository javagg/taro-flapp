import './poly'

declare global {
    interface Window {
        _flutter: any;
        flutterCanvasKit: any;
        flutterCanvasKitLoaded: Promise<any>,
    }
}

export interface FlutterConfiguration {
    assetBase?: string;
    canvasKitBaseUrl?: string;
    renderer?: "auto" | "html" | "canvaskit" | "skwasm";
    hostElement?: HTMLElement;
    fontFallbackBaseUrl?: string;
    entrypointUrl: string;
}

export interface ServiceWorkerSettings {
    serviceWorkerVersion: string;
    serviceWorkerUrl?: string;
    timeoutMillis?: number;
}

export interface AppRunner {
    runApp: () => void;
}

export interface EngineInitializer {
    initializeEngine: () => Promise<AppRunner>;
}

export type OnEntrypointLoadedCallback =
    (initializer: EngineInitializer) => void;
export class FlutterEntrypointLoader {
    _didCreateEngineInitializerResolve: any
    _onEntrypointLoaded?: OnEntrypointLoadedCallback

    async load(
        config: FlutterConfiguration,
        onEntrypointLoaded?: OnEntrypointLoadedCallback
    ) {
        this._onEntrypointLoaded = onEntrypointLoaded;
        console.log("Load main.dart.js")
        await import("@/flapp/main.dart");
    }
    didCreateEngineInitializer(engineInitializer) {
        if (typeof this._didCreateEngineInitializerResolve === "function") {
            this._didCreateEngineInitializerResolve(engineInitializer);
            // Remove the resolver after the first time, so Flutter Web can hot restart.
            this._didCreateEngineInitializerResolve = null;
            // Make the engine revert to "auto" initialization on hot restart.
            delete window._flutter.loader.didCreateEngineInitializer;
        }
        if (typeof this._onEntrypointLoaded === "function") {
            this._onEntrypointLoaded(engineInitializer);
        }
    }
}

export class FlutterLoader {
    didCreateEngineInitializer?: OnEntrypointLoadedCallback

    async load(options: {
        serviceWorkerSettings?: ServiceWorkerSettings,
        onEntrypointLoaded?: OnEntrypointLoadedCallback,
        config: FlutterConfiguration
    }) {
        let { config, serviceWorkerSettings, onEntrypointLoaded } = options;     
        const loader = new FlutterEntrypointLoader();
        this.didCreateEngineInitializer = loader.didCreateEngineInitializer.bind(loader);
        return loader.load(config, onEntrypointLoaded);
    }
}

export class FlutterHostView {
    static shared = new FlutterHostView();
}

globalThis.FlutterHostView = FlutterHostView;
declare global {
    interface Window {
        _flutter: any;
        flutterCanvasKit: any;
        flutterCanvasKitLoaded: Promise<any>,
    }
}

interface FlutterConfiguration {
    assetBase?: string;
    canvasKitBaseUrl?: string;
    renderer?: "auto" | "html" | "canvaskit" | "skwasm";
    hostElement?: HTMLElement;
    fontFallbackBaseUrl?: string;
    entrypointUrl: string;
}

interface ServiceWorkerSettings {
    serviceWorkerVersion: string;
    serviceWorkerUrl?: string;
    timeoutMillis?: number;
}

interface AppRunner {
    runApp: () => void;
}

interface EngineInitializer {
    initializeEngine: () => Promise<AppRunner>;
}

type OnEntrypointLoadedCallback =
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
        if (process.env.TARO_ENV === 'weapp') {
            await import('imports-loader?additionalCode=var%20self=window;!@/flapp/main.dart');
        } else {
            await import("@/flapp/main.dart");
        }
        // await import("@/flapp/main.dart");
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

class FlutterLoader {
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

export async function flutter(config: FlutterConfiguration) {
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
        onEntrypointLoaded: async (init) => {
            const runner = await init.initializeEngine(config)
            runner.runApp();
        }
    });
}

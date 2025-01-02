export type EffectFunction<Args extends any[], Result> = (...args: Args) => Promise<Result>;
export type EffectEvent =
    'onBefore'
    | 'onSuccess'
    | 'onError'
    | 'onFinally';

export type Effect<Args extends any[], Result> = {
    (...args: Args): Promise<Result>;
    onSuccess: (callback: (result: Result, ...args: Args) => void) => void;
    onError: (callback: (error: unknown, ...args: Args) => void) => void;
    onFinally: (callback: (...args: Args) => void) => void;
    onBefore: (callback: (...args: Args) => void) => void;
};

export type Listener<State> = (state: State) => void;
export type Payload<Result, Args> = {
    result?: Result;
    error?: unknown;
    args: Args;
};
export type Handler<State, Args, Result> = (state: State, payload: Payload<Result, Args>) => State;

export function effect<Args extends any[], Result> (fn: EffectFunction<Args, Result>): Effect<Args, Result> {
    let beforeListeners: ((...args: Args) => void)[]                  = [];
    let successListeners: ((result: Result, ...args: Args) => void)[] = [];
    let errorListeners: ((error: unknown, ...args: Args) => void)[]   = [];
    let finallyListeners: ((...args: Args) => void)[]                 = [];

    const wrappedEffect: Effect<Args, Result> = async (...args: Args) => {
        beforeListeners.forEach(listener => listener(...args));
        try {
            const result = await fn(...args);
            successListeners.forEach(listener => listener(result, ...args));
            return result;
        } catch (error) {
            errorListeners.forEach(listener => listener(error, ...args));
            throw error;
        } finally {
            finallyListeners.forEach(listener => listener(...args));
        }
    };

    wrappedEffect.onBefore = (callback: (...args: Args) => void) => {
        beforeListeners.push(callback);
    };

    wrappedEffect.onSuccess = (callback: (result: Result, ...args: Args) => void) => {
        successListeners.push(callback);
    };

    wrappedEffect.onError = (callback: (error: unknown, ...args: Args) => void) => {
        errorListeners.push(callback);
    };

    wrappedEffect.onFinally = (callback: (...args: Args) => void) => {
        finallyListeners.push(callback);
    };

    return wrappedEffect;
}

export type Store<State> = {
    get: () => State;
    set: (newState: State) => void;
    on: <Args extends any[], Result>(
        effect: Effect<Args, Result>,
        event: EffectEvent,
        handler: Handler<State, Args, Result>,
    ) => Store<State>;
    subscribe: (listener: Listener<State>) => () => void;
};

export function store<State> (initialState: State): Store<State> {
    let state                        = initialState;
    let listeners: Listener<State>[] = [];

    const get = () => state;
    const set = (newState: State) => {
        state = newState;
        listeners.forEach(listener => listener(state));
    };

    const on = <Args extends any[], Result> (
        effect: Effect<Args, Result>,
        event: EffectEvent,
        handler: Handler<State, Args, Result>,
    ): Store<State> => {
        const callback = (payload: Payload<Result, Args>) => storeApi.set(handler(state, payload));

        if (event === 'onBefore') {
            effect.onBefore((...args) => callback({ args }));
        } else if (event === 'onSuccess') {
            effect.onSuccess((result, ...args) => callback({
                result,
                args,
            }));
        } else if (event === 'onError') {
            effect.onError((error, ...args) => callback({ error, args }));
        } else if (event === 'onFinally') {
            effect.onFinally((...args) => callback({ args }));
        }

        return storeApi;
    };

    const subscribe = (listener: Listener<State>) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    };

    const storeApi = {
        get,
        set,
        on,
        subscribe,
    };

    return storeApi;
}

export function combine<States extends any[], Result> (
    stores: { [K in keyof States]: Store<States[K]> },
    callback: (...stores: { [K in keyof States]: Store<States[K]> }) => Result,
): Store<Result> {
    let combinedState: Result = callback(...stores);

    stores.forEach((store) => {
        store.subscribe(() => {
            combinedState = callback(...stores);
            listeners.forEach(listener => listener(combinedState));
        });
    });

    const listeners: Listener<Result>[] = [];

    const get = () => combinedState;

    const subscribe = (listener: Listener<Result>) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    };

    const storeApi: Store<Result> = {
        get,
        set: () => {
            throw new Error('Cannot call \'set\' on combined store');
        },
        on : () => {
            throw new Error('Cannot call \'on\' on combined store');
        },
        subscribe,
    };

    return storeApi;
}
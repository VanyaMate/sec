export type EffectFunction<Args extends any[], Result> = (...args: Args) => Promise<Result>;

export type Effect<Args extends any[], Result> = {
    (...args: Args): Promise<Result>;
    onSuccess: (callback: (result: Result, ...args: Args) => void) => void;
    onError: (callback: (error: any, ...args: Args) => void) => void;
    onFinally: (callback: (...args: Args) => void) => void;
    onBefore: (callback: (...args: Args) => void) => void;
};

export type Listener<State> = (state: State) => void;

export function effect<Args extends any[], Result> (fn: EffectFunction<Args, Result>): Effect<Args, Result> {
    let beforeListeners: ((...args: Args) => void)[]                  = [];
    let successListeners: ((result: Result, ...args: Args) => void)[] = [];
    let errorListeners: ((error: any, ...args: Args) => void)[]       = [];
    let finallyListeners: ((...args: Args) => void)[]                 = [];

    const wrappedEffect: any = async (...args: Args) => {
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

    wrappedEffect.onError = (callback: (error: any, ...args: Args) => void) => {
        errorListeners.push(callback);
    };

    wrappedEffect.onFinally = (callback: (...args: Args) => void) => {
        finallyListeners.push(callback);
    };

    return wrappedEffect as Effect<Args, Result>;
}

export type Store<State> = {
    get: () => State;
    set: (newState: State) => void;
    on: <Args extends any[], Result>(
        effect: Effect<Args, Result>,
        event: 'onBefore' | 'onSuccess' | 'onError' | 'onFinally',
        handler: (state: State, payload: {
            result?: Result;
            error?: any;
            meta: Args
        }) => State,
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
        event: 'onBefore' | 'onSuccess' | 'onError' | 'onFinally',
        handler: (state: State, payload: {
            result?: Result;
            error?: any;
            meta: Args
        }) => State,
    ): Store<State> => {
        const callback = (payload: {
            result?: Result;
            error?: any;
            meta: Args
        }) => set(handler(state, payload));

        if (event === 'onBefore') {
            effect.onBefore((...args) => callback({ meta: args }));
        } else if (event === 'onSuccess') {
            effect.onSuccess((result, ...args) => callback({
                result,
                meta: args,
            }));
        } else if (event === 'onError') {
            effect.onError((error, ...args) => callback({ error, meta: args }));
        } else if (event === 'onFinally') {
            effect.onFinally((...args) => callback({ meta: args }));
        }

        return storeApi;
    };

    const subscribe = (listener: Listener<State>) => {
        listeners.push(listener);
        return () => listeners = listeners.filter((l) => l !== listener);
    };

    const storeApi = {
        get,
        set,
        on,
        subscribe,
    };

    return storeApi;
}

export function combine<States extends any[]> (...stores: { [K in keyof States]: Store<States[K]> }): Store<States> {
    let combinedState                         = stores.map(store => store.get()) as States;
    let combinedListeners: Listener<States>[] = [];

    stores.forEach((store, index) => {
        store.subscribe((state) => {
            combinedState[index] = state;
            combinedListeners.forEach(listener => listener(combinedState));
        });
    });

    return {
        get      : () => combinedState,
        set      : (newState) => {
            newState.forEach((state, index) => stores[index].set(state));
        },
        on       : () => {
            throw new Error('Cannot call \'on\' on combined store');
        },
        subscribe: (listener) => {
            combinedListeners.push(listener);
            return () => combinedListeners = combinedListeners.filter((l) => l !== listener);
        },
    };
}
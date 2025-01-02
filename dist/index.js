export function effect(fn) {
    let beforeListeners = [];
    let successListeners = [];
    let errorListeners = [];
    let finallyListeners = [];
    const wrappedEffect = async (...args) => {
        beforeListeners.forEach(listener => listener(...args));
        try {
            const result = await fn(...args);
            successListeners.forEach(listener => listener(result, ...args));
            return result;
        }
        catch (error) {
            errorListeners.forEach(listener => listener(error, ...args));
            throw error;
        }
        finally {
            finallyListeners.forEach(listener => listener(...args));
        }
    };
    wrappedEffect.onBefore = (callback) => {
        beforeListeners.push(callback);
    };
    wrappedEffect.onSuccess = (callback) => {
        successListeners.push(callback);
    };
    wrappedEffect.onError = (callback) => {
        errorListeners.push(callback);
    };
    wrappedEffect.onFinally = (callback) => {
        finallyListeners.push(callback);
    };
    return wrappedEffect;
}
export function store(initialState) {
    let state = initialState;
    let listeners = [];
    const get = () => state;
    const set = (newState) => {
        state = newState;
        listeners.forEach(listener => listener(state));
    };
    const on = (effect, event, handler) => {
        const callback = (payload) => storeApi.set(handler(state, payload));
        if (event === 'onBefore') {
            effect.onBefore((...args) => callback({ args }));
        }
        else if (event === 'onSuccess') {
            effect.onSuccess((result, ...args) => callback({
                result,
                args,
            }));
        }
        else if (event === 'onError') {
            effect.onError((error, ...args) => callback({ error, args }));
        }
        else if (event === 'onFinally') {
            effect.onFinally((...args) => callback({ args }));
        }
        return storeApi;
    };
    const subscribe = (listener) => {
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
export function combine(stores, callback) {
    let combinedState = callback(...stores);
    stores.forEach((store) => {
        store.subscribe(() => {
            combinedState = callback(...stores);
            listeners.forEach(listener => listener(combinedState));
        });
    });
    const listeners = [];
    const get = () => combinedState;
    const subscribe = (listener) => {
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
        set: () => {
            throw new Error('Cannot call \'set\' on combined store');
        },
        on: () => {
            throw new Error('Cannot call \'on\' on combined store');
        },
        subscribe,
    };
    return storeApi;
}

import { batched, endBatch, isLastBatchItem, startBatch } from '../batch/batch';
import { EffectAction, Effect } from '../effect';
import { Marker } from '../marker';


export type StoreOnBeforeHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>
}) => State;
export type StoreOnSuccessHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>
    result: Awaited<ReturnType<Action>>;
}) => State;
export type StoreOnErrorHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>
    error: unknown;
}) => State;
export type StoreOnFinallyHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>
}) => State;

export type StoreHandlerMap<State, Action extends EffectAction> = {
    onBefore: StoreOnBeforeHandler<State, Action>;
    onSuccess: StoreOnSuccessHandler<State, Action>;
    onError: StoreOnErrorHandler<State, Action>;
    onFinally: StoreOnFinallyHandler<State, Action>;
};

export type StoreEffectSubscribe<State> =
    <
        Action extends EffectAction,
        Event extends keyof StoreHandlerMap<State, Action>
    > (
        effect: Effect<Action>,
        event: Event,
        handler: StoreHandlerMap<State, Action>[Event],
    ) => Store<State>;

export type StoreListener<State> = (state: State) => void;
export type StoreMarkerSubscribe<State> = (marker: Marker<State>, value?: State) => Store<State>;

export type Store<State> = {
    on: StoreEffectSubscribe<State>;
    enableOn: StoreMarkerSubscribe<State>;
    disableOn: StoreMarkerSubscribe<State>;
    get: () => State;
    set: (data: State) => void;
    subscribe: (listener: StoreListener<State>) => () => void;
}

export type StoreOptions = {
    enabled?: boolean;
    instantListenerExecution?: boolean;
}

export const enableCheck = function (enabled: boolean, callback: () => void) {
    if (enabled) {
        callback();
    }
};

export const store = function <State extends any> (state: State, options: StoreOptions = { enabled: true, instantListenerExecution: false }): Store<State> {
    const listeners: Set<StoreListener<State>> = new Set();
    let previousState: unknown = undefined;
    let { enabled = true, instantListenerExecution = false } = options;


    const storeApi: Store<State> = {
        on: <
            Action extends EffectAction,
            Event extends keyof StoreHandlerMap<State, Action>
        > (effect: Effect<Action>, event: Event, handler: StoreHandlerMap<State, Action>[Event]) => {
            if (event === 'onBefore') {
                effect.onBefore((...args) =>
                    enableCheck(
                        enabled,
                        () => storeApi.set(
                            (handler as StoreOnBeforeHandler<State, Action>)(state, { args }),
                        ),
                    ),
                );
            } else if (event === 'onSuccess') {
                effect.onSuccess((result, ...args) =>
                    enableCheck(
                        enabled,
                        () => storeApi.set(
                            (handler as StoreOnSuccessHandler<State, Action>)(state, {
                                result, args,
                            }),
                        ),
                    ),
                );
            } else if (event === 'onError') {
                effect.onError((error, ...args) =>
                    enableCheck(
                        enabled,
                        () => storeApi.set(
                            (handler as StoreOnErrorHandler<State, Action>)(state, {
                                error, args,
                            }),
                        ),
                    ),
                );
            } else {
                effect.onFinally((...args) =>
                    enableCheck(
                        enabled,
                        () => storeApi.set(
                            (handler as StoreOnFinallyHandler<State, Action>)(state, { args }),
                        ),
                    ),
                );
            }

            return storeApi;
        },
        get (): State {
            return state;
        },
        set (value: State) {
            state = value;
            batched(() => {
                if (previousState != state) {
                    previousState = state;
                    listeners.forEach((listener) => listener(state));
                }
            }, this);
        },
        subscribe (listener: StoreListener<State>) {
            listeners.add(listener);
            if (instantListenerExecution) listener(state);
            return () => listeners.delete(listener);
        },
        enableOn (marker: Marker<State>, state?: State) {
            marker.subscribe(() => {
                enabled = true;
                if (state !== undefined) {
                    startBatch();
                    queueMicrotask(() => {
                        endBatch();
                        storeApi.set(state);
                    });
                }
            });
            return storeApi;
        },
        disableOn (marker: Marker<State>, state?: State) {
            marker.subscribe(() => {
                enabled = false;
                if (state !== undefined) {
                    startBatch();
                    queueMicrotask(() => {
                        endBatch();
                        storeApi.set(state);
                    });
                }
            });
            return storeApi;
        },
    };

    return storeApi;
};
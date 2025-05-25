import { EffectAction, Effect, effect } from '../effect';
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
export type StoreMarkerSubscribe<State> = (marker: Marker<State>) => Store<State>;

export type Store<State> = {
    on: StoreEffectSubscribe<State>;
    enableOn: StoreMarkerSubscribe<State>;
    disableOn: StoreMarkerSubscribe<State>;
    get: () => State;
    set: (data: State) => void;
    subscribe: (listener: StoreListener<State>) => () => void;
}

export const enableCheck = function (enabled: boolean, callback: () => void) {
    if (enabled) {
        callback();
    }
};

export const store = function <State extends any> (initialData: State, enabled: boolean = true): Store<State> {
    const listeners: Array<StoreListener<State>> = [];

    const storeApi: Store<State> = {
        on: <
            Action extends EffectAction,
            Event extends keyof StoreHandlerMap<State, Action>
        > (effect: Effect<Action>, event: Event, handler: StoreHandlerMap<State, Action>[Event]) => {
            if (event === 'onBefore') {
                effect.onBefore((...args) =>
                    enableCheck(
                        enabled,
                        () => initialData = (handler as StoreOnBeforeHandler<State, Action>)(initialData, { args }),
                    ),
                );
            } else if (event === 'onSuccess') {
                effect.onSuccess((result, ...args) =>
                    enableCheck(
                        enabled,
                        () => initialData = (handler as StoreOnSuccessHandler<State, Action>)(initialData, {
                            result, args,
                        }),
                    ),
                );
            } else if (event === 'onError') {
                effect.onError((error, ...args) =>
                    enableCheck(
                        enabled,
                        () => initialData = (handler as StoreOnErrorHandler<State, Action>)(initialData, {
                            error, args,
                        }),
                    ),
                );
            } else {
                effect.onFinally((...args) =>
                    enableCheck(
                        enabled,
                        () => initialData = (handler as StoreOnFinallyHandler<State, Action>)(initialData, { args }),
                    ),
                );
            }

            return storeApi;
        },
        get (): State {
            return initialData;
        },
        set (value: State) {
            initialData = value;
        },
        subscribe (listener: StoreListener<State>) {
            listeners.push(listener);
            return () => {
                const index = listeners.indexOf(listener);
                if (~index) {
                    listeners.splice(index, 1);
                }
            };
        },
        enableOn (marker: Marker<State>) {
            marker.subscribe(() => enabled = false);
            return storeApi;
        },
        disableOn (marker: Marker<State>) {
            marker.subscribe(() => () => enabled = true);
            return storeApi;
        },
    };

    return storeApi;
};
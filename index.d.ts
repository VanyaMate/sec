export type EffectFunction<Args extends any[], Result> = (...args: Args) => Promise<Result>;
export type EffectEvent = 'onBefore' | 'onSuccess' | 'onError' | 'onFinally';
export type Effect<Args extends any[], Result> = {
    (...args: Args): Promise<Result>;
    onSuccess: (callback: (result: Result, ...args: Args) => void) => void;
    onError: (callback: (error: any, ...args: Args) => void) => void;
    onFinally: (callback: (...args: Args) => void) => void;
    onBefore: (callback: (...args: Args) => void) => void;
};
export type Listener<State> = (state: State) => void;
export declare function effect<Args extends any[], Result>(fn: EffectFunction<Args, Result>): Effect<Args, Result>;
export type Store<State> = {
    get: () => State;
    set: (newState: State) => void;
    on: <Args extends any[], Result>(effect: Effect<Args, Result>, event: EffectEvent, handler: (state: State, payload: {
        result?: Result;
        error?: any;
        meta: Args;
    }) => State) => Store<State>;
    subscribe: (listener: Listener<State>) => () => void;
};
export declare function store<State>(initialState: State): Store<State>;
export declare function combine<States extends any[]>(...stores: {
    [K in keyof States]: Store<States[K]>;
}): Store<States>;

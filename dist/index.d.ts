export type EffectFunction<Args extends any[], Result> = (...args: Args) => Promise<Result>;
export type EffectEvent = 'onBefore' | 'onSuccess' | 'onError' | 'onFinally';
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
export declare function effect<Args extends any[], Result>(fn: EffectFunction<Args, Result>): Effect<Args, Result>;
export type Store<State> = {
    get: () => State;
    set: (newState: State) => void;
    on: <Args extends any[], Result>(effect: Effect<Args, Result>, event: EffectEvent, handler: Handler<State, Args, Result>) => Store<State>;
    subscribe: (listener: Listener<State>) => () => void;
};
export declare function store<State>(initialState: State): Store<State>;
export declare function combine<States extends any[], Result>(stores: {
    [K in keyof States]: Store<States[K]>;
}, callback: (...stores: {
    [K in keyof States]: Store<States[K]>;
}) => Result): Store<Result>;

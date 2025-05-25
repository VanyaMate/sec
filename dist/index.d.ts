export declare const combine: <State, States extends Array<any>>(stores: { [Index in keyof States]: Store<States[Index]>; }, callback: (...stores: { [K in keyof States]: Store<States[K]>; }) => State, enabled?: boolean) => Store<State>;

export declare type Effect<AsyncAction extends EffectAction> = {
    (...args: Parameters<AsyncAction>): Promise<Awaited<ReturnType<AsyncAction>>>;
    onSuccess: (callback: EffectSuccessCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
    onError: (callback: EffectErrorCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
    onBefore: (callback: EffectBeforeCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
    onFinally: (callback: EffectFinallyCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
};

export declare const effect: <Action extends EffectAction>(action: Action) => Effect<Action>;

export declare type EffectAction = (...args: Array<any>) => Promise<any>;

export declare type EffectBeforeCallback<AsyncAction extends EffectAction> = (...args: Parameters<AsyncAction>) => void;

export declare type EffectCallbackList<Type> = {
    beforeAll: Array<Type>;
    afterAll: Array<Type>;
    other: Array<Type>;
};

export declare type EffectErrorCallback<AsyncAction extends EffectAction> = (error: unknown, ...args: Parameters<AsyncAction>) => void;

export declare type EffectFinallyCallback<AsyncAction extends EffectAction> = (...args: Parameters<AsyncAction>) => void;

export declare type EffectSubscribePosition = 'beforeAll' | 'afterAll' | undefined;

export declare type EffectSuccessCallback<AsyncAction extends EffectAction> = (result: Awaited<ReturnType<AsyncAction>>, ...args: Parameters<AsyncAction>) => void;

export declare const enableCheck: (enabled: boolean, callback: () => void) => void;

export declare type Marker<State> = {
    on: <Action extends EffectAction>(event: keyof StoreHandlerMap<State, Action>, effect: Effect<Action>, position?: EffectSubscribePosition) => Marker<State>;
    subscribe: (listener: MarkerListener) => void;
};

export declare const marker: <State>(position?: EffectSubscribePosition) => Marker<State>;

export declare type MarkerListener = () => void;

export declare const pending: (effects: Array<Effect<any>>) => Store<boolean>;

export declare type Store<State> = {
    on: StoreEffectSubscribe<State>;
    enableOn: StoreMarkerSubscribe<State>;
    disableOn: StoreMarkerSubscribe<State>;
    get: () => State;
    set: (data: State) => void;
    subscribe: (listener: StoreListener<State>) => () => void;
};

export declare const store: <State extends any>(initialData: State, enabled?: boolean) => Store<State>;

export declare type StoreEffectSubscribe<State> = <Action extends EffectAction, Event extends keyof StoreHandlerMap<State, Action>>(effect: Effect<Action>, event: Event, handler: StoreHandlerMap<State, Action>[Event]) => Store<State>;

export declare type StoreHandlerMap<State, Action extends EffectAction> = {
    onBefore: StoreOnBeforeHandler<State, Action>;
    onSuccess: StoreOnSuccessHandler<State, Action>;
    onError: StoreOnErrorHandler<State, Action>;
    onFinally: StoreOnFinallyHandler<State, Action>;
};

export declare type StoreListener<State> = (state: State) => void;

export declare type StoreMarkerSubscribe<State> = (marker: Marker<State>) => Store<State>;

export declare type StoreOnBeforeHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>;
}) => State;

export declare type StoreOnErrorHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>;
    error: unknown;
}) => State;

export declare type StoreOnFinallyHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>;
}) => State;

export declare type StoreOnSuccessHandler<State, Action extends EffectAction> = (state: State, data: {
    args: Parameters<Action>;
    result: Awaited<ReturnType<Action>>;
}) => State;

export declare const to: <State>(state: State) => () => State;

export { }

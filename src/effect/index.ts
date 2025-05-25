export type EffectAction = (...args: Array<any>) => Promise<any>;
export type EffectSuccessCallback<AsyncAction extends EffectAction> = (result: Awaited<ReturnType<AsyncAction>>, ...args: Parameters<AsyncAction>) => void;
export type EffectErrorCallback<AsyncAction extends EffectAction> = (error: unknown, ...args: Parameters<AsyncAction>) => void;
export type EffectBeforeCallback<AsyncAction extends EffectAction> = (...args: Parameters<AsyncAction>) => void;
export type EffectFinallyCallback<AsyncAction extends EffectAction> = (...args: Parameters<AsyncAction>) => void;

export type EffectSubscribePosition =
    'beforeAll'
    | 'afterAll'
    | undefined;

export type Effect<AsyncAction extends EffectAction> = {
    (...args: Parameters<AsyncAction>): Promise<Awaited<ReturnType<AsyncAction>>>;
    onSuccess: (callback: EffectSuccessCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
    onError: (callback: EffectErrorCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
    onBefore: (callback: EffectBeforeCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
    onFinally: (callback: EffectFinallyCallback<AsyncAction>, position?: EffectSubscribePosition) => void;
}

export type EffectCallbackList<Type> = {
    beforeAll: Array<Type>;
    afterAll: Array<Type>;
    other: Array<Type>;
}

const getCallbacksList = function <Type> (): EffectCallbackList<Type> {
    return {
        afterAll : [],
        beforeAll: [],
        other    : [],
    };
};

export const effect = function <Action extends EffectAction> (action: Action): Effect<Action> {
    const beforeCallbacks: EffectCallbackList<EffectBeforeCallback<Action>>   = getCallbacksList<EffectBeforeCallback<Action>>();
    const successCallbacks: EffectCallbackList<EffectSuccessCallback<Action>> = getCallbacksList<EffectSuccessCallback<Action>>();
    const errorCallbacks: EffectCallbackList<EffectErrorCallback<Action>>     = getCallbacksList<EffectErrorCallback<Action>>();
    const finallyCallbacks: EffectCallbackList<EffectFinallyCallback<Action>> = getCallbacksList<EffectFinallyCallback<Action>>();

    const effectApi: Effect<Action> = async function (...args) {
        beforeCallbacks.beforeAll.forEach((callback) => callback(...args));
        beforeCallbacks.other.forEach((callback) => callback(...args));
        beforeCallbacks.afterAll.forEach((callback) => callback(...args));

        return action(...args)
            .then((result: Awaited<ReturnType<Action>>) => {
                successCallbacks.beforeAll.forEach((callback) => callback(result, ...args));
                successCallbacks.other.forEach((callback) => callback(result, ...args));
                successCallbacks.afterAll.forEach((callback) => callback(result, ...args));
                return result;
            })
            .catch((error: unknown) => {
                errorCallbacks.beforeAll.forEach((callback) => callback(error, ...args));
                errorCallbacks.other.forEach((callback) => callback(error, ...args));
                errorCallbacks.afterAll.forEach((callback) => callback(error, ...args));
                throw error;
            })
            .finally(() => {
                finallyCallbacks.beforeAll.forEach((callback) => callback(...args));
                finallyCallbacks.other.forEach((callback) => callback(...args));
                finallyCallbacks.afterAll.forEach((callback) => callback(...args));
            });
    } as Effect<Action>;

    effectApi.onBefore  = (callback: EffectBeforeCallback<Action>, position?: EffectSubscribePosition) => {
        switch (position) {
            case 'beforeAll':
                beforeCallbacks.beforeAll.push(callback);
                break;
            case 'afterAll':
                beforeCallbacks.afterAll.push(callback);
                break;
            default:
                beforeCallbacks.other.push(callback);
        }
    };
    effectApi.onSuccess = (callback: EffectSuccessCallback<Action>, position?: EffectSubscribePosition) => {
        switch (position) {
            case 'beforeAll':
                successCallbacks.beforeAll.push(callback);
                break;
            case 'afterAll':
                successCallbacks.afterAll.push(callback);
                break;
            default:
                successCallbacks.other.push(callback);
        }
    };
    effectApi.onError   = (callback: EffectErrorCallback<Action>, position?: EffectSubscribePosition) => {
        switch (position) {
            case 'beforeAll':
                errorCallbacks.beforeAll.push(callback);
                break;
            case 'afterAll':
                errorCallbacks.afterAll.push(callback);
                break;
            default:
                errorCallbacks.other.push(callback);
        }
    };
    effectApi.onFinally = (callback: EffectFinallyCallback<Action>, position?: EffectSubscribePosition) => {
        switch (position) {
            case 'beforeAll':
                finallyCallbacks.beforeAll.push(callback);
                break;
            case 'afterAll':
                finallyCallbacks.afterAll.push(callback);
                break;
            default:
                finallyCallbacks.other.push(callback);
        }
    };

    return effectApi;
};
import { EffectAction, Effect, EffectSubscribePosition } from '../effect';
import { StoreHandlerMap } from '../store';


export type MarkerListener = () => void;

export type Marker<State> = {
    on: <Action extends EffectAction>(event: keyof StoreHandlerMap<State, Action>, effect: Effect<Action>, position?: EffectSubscribePosition) => Marker<State>;
    subscribe: (listener: MarkerListener) => void;
}

export const marker = function <State> (position?: EffectSubscribePosition): Marker<State> {
    const listeners: Array<MarkerListener> = [];

    const markerApi: Marker<State> = {
        on       : (event, effect) => {
            if (event === 'onBefore') {
                effect.onBefore(() => listeners.forEach((listener) => listener()), position);
            } else if (event === 'onSuccess') {
                effect.onSuccess(() => listeners.forEach((listener) => listener()), position);
            } else if (event === 'onError') {
                effect.onError(() => listeners.forEach((listener) => listener()), position);
            } else {
                effect.onFinally(() => listeners.forEach((listener) => listener()), position);
            }
            return markerApi;
        },
        subscribe: (listener: MarkerListener) => {
            listeners.push(listener);
        },
    };

    return markerApi;
};

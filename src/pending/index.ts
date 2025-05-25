import { store } from '../store';
import { to } from '../to';
import { Effect } from '../effect';


export const pending = function (effects: Array<Effect<any>>) {
    const _store = store<boolean>(false);
    effects.forEach((effect) => {
        _store.on(effect, 'onBefore', to(true));
        _store.on(effect, 'onFinally', to(false));
    });
    return _store;
};
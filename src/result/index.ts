import { StoreHandlerMap } from '../store';
import { EffectAction } from '../effect';


export const result = function <State extends Awaited<ReturnType<Action>>, Action extends EffectAction> (): StoreHandlerMap<State, Action>['onSuccess'] {
    return (_, { result }) => result;
};
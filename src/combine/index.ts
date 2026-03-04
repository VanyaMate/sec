import {
    enableCheck,
    Store, StoreListener,
    StoreOptions,
} from '../store';
import { Marker } from '../marker';
import { batch } from '../batch/batch';


export const combine = function <State, States extends Array<any>> (
    stores: { [Index in keyof States]: Store<States[Index]> },
    callback: (stores: { [K in keyof States]: Store<States[K]> }) => State,
    options: StoreOptions = { enabled: true, instantListenerExecution: false },
): Store<State> {
    let combinedState: State, previousState: State;
    combinedState = previousState = callback(stores);
    const listeners: Set<StoreListener<State>>      = new Set();
    let { enabled = true, instantListenerExecution  = false } = options;

    stores.forEach((store) => {
        store.subscribe(() => {
            enableCheck(enabled, () => {
                batch(storeApi, () => {
                    combinedState = callback(stores);
                    if (combinedState !== previousState) {
                        previousState = combinedState;
                        listeners.forEach((listener) => listener(combinedState)); 
                    }
                });
            });
        });
    });

    const storeApi: Store<State> = {
        on: () => {
            throw new Error(`Cannot call 'on' on combined store`);
        },
        get (): State {
            return combinedState;
        },
        set () {
            throw new Error(`Cannot call 'set' on combined store`);
        },
        subscribe (listener: StoreListener<State>) {
            listeners.add(listener);
            if (instantListenerExecution) listener(combinedState);
            return () => listeners.delete(listener);
        },
        enableOn (marker: Marker<State>) {
            marker.subscribe(() => enabled = true);
            return storeApi;
        },
        disableOn (marker: Marker<State>) {
            marker.subscribe(() => enabled = false);
            return storeApi;
        },
    };

    return storeApi;
};
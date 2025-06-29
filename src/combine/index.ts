import {
    enableCheck,
    Store, StoreListener,
} from '../store';
import { Marker } from '../marker';


export const combine = function <State, States extends Array<any>> (
    stores: { [Index in keyof States]: Store<States[Index]> },
    callback: (stores: { [K in keyof States]: Store<States[K]> }) => State,
    enabled: boolean = true,
): Store<State> {
    console.log('Combine', stores, callback, enabled);


    let combinedState: State                     = callback(stores);
    const listeners: Array<StoreListener<State>> = [];

    stores.forEach((store) => {
        store.subscribe(() => {
            enableCheck(enabled, () => {
                combinedState = callback(stores);
                listeners.forEach((listener) => listener(combinedState));
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
            listeners.push(listener);
            return () => {
                const index = listeners.indexOf(listener);
                if (~index) {
                    listeners.splice(index, 1);
                }
            };
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
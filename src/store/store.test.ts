import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Effect, effect } from '../effect';
import { store } from './index';
import { marker } from '../marker';

// Сгенерировано AI

describe('store()', () => {
    type State = { count: number };
    const initialState: State = { count: 0 };

    let incrementEffect: Effect<(x: number) => Promise<number>> = effect(async (x: number) => x);

    beforeEach(() => {
        incrementEffect = effect(async (x: number) => x);
    });

    it('returns initial state with get()', () => {
        const s = store(initialState);
        expect(s.get()).toEqual({ count: 0 });
    });

    it('updates state with set()', () => {
        const s = store(initialState);
        s.set({ count: 10 });
        expect(s.get()).toEqual({ count: 10 });
    });

    it('calls onBefore handler and updates state', async () => {
        const s = store(initialState);

        s.on(incrementEffect, 'onBefore', (state, { args }) => ({
            count: state.count + args[0],
        }));

        await incrementEffect(5);

        expect(s.get()).toEqual({ count: 5 });
    });

    it('calls onSuccess handler and updates state', async () => {
        const s = store(initialState);

        s.on(incrementEffect, 'onSuccess', (state, { result }) => ({
            count: state.count + result,
        }));

        await incrementEffect(7);

        expect(s.get()).toEqual({ count: 7 });
    });

    it('calls onError handler and updates state', async () => {
        const failingEffect = effect(async () => {
            throw new Error('fail');
        });

        const s = store(initialState);

        s.on(failingEffect, 'onError', (state, { error }) => {
            if (error instanceof Error && error.message === 'fail') {
                return { count: state.count + 1 };
            }
            return state;
        });

        try {
            await failingEffect();
        } catch (_) {
        }

        expect(s.get()).toEqual({ count: 1 });
    });

    it('calls onFinally handler and updates state', async () => {
        const s = store(initialState);

        s.on(incrementEffect, 'onFinally', (state, { args }) => ({
            count: state.count + args[0],
        }));

        await incrementEffect(3);

        expect(s.get()).toEqual({ count: 3 });
    });

    it('notifies subscribers on state change', () => {
        const s        = store(initialState);
        const listener = vi.fn();
        s.subscribe(listener);

        s.set({ count: 123 });
        expect(listener).toHaveBeenCalledWith({ count: 123 });
    });

    it('unsubscribes listener', () => {
        const s           = store(initialState);
        const listener    = vi.fn();
        const unsubscribe = s.subscribe(listener);

        unsubscribe();
        s.set({ count: 1 });

        expect(listener).not.toHaveBeenCalled();
    });

    it('disables and enables effect via marker', async () => {
        const s = store(initialState);
        const m = marker<State>();

        // Handler зависит от enabled-флага
        s.on(incrementEffect, 'onSuccess', (state, { result }) => ({
            count: result,
        }));

        s.disableOn(m); // subscribe → enabled = false

        // marker активируется от вызова effect через onBefore
        m.on('onBefore', incrementEffect);

        await incrementEffect(100); // не должен изменить состояние
        expect(s.get()).toEqual({ count: 0 });

        s.enableOn(m); // subscribe → enabled = true

        await incrementEffect(200); // теперь должен примениться
        expect(s.get()).toEqual({ count: 200 });
    });
});

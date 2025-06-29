import { describe, it, expect, vi, beforeEach } from 'vitest';
import { effect } from '../effect';
import { marker } from './index';


// Сгенерировано AI

describe('marker()', () => {
    let testEffect: ReturnType<typeof effect<(x: number) => Promise<number>>>;

    beforeEach(() => {
        testEffect = effect(async (x: number) => x);
    });

    it('calls listeners on onBefore', async () => {
        const m = marker();

        const listener = vi.fn();
        m.subscribe(listener);

        m.on('onBefore', testEffect);

        await testEffect(1);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('calls listeners on onSuccess', async () => {
        const m = marker();

        const listener = vi.fn();
        m.subscribe(listener);

        m.on('onSuccess', testEffect);

        await testEffect(5);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('calls listeners on onError', async () => {
        const failingEffect = effect(async () => {
            throw new Error('oops');
        });

        const m        = marker();
        const listener = vi.fn();
        m.subscribe(listener);
        m.on('onError', failingEffect);

        try {
            await failingEffect();
        } catch (_) {
        }

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('calls listeners on onFinally', async () => {
        const m        = marker();
        const listener = vi.fn();
        m.subscribe(listener);
        m.on('onFinally', testEffect);

        await testEffect(10);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('supports multiple listeners', async () => {
        const m         = marker();
        const listener1 = vi.fn();
        const listener2 = vi.fn();

        m.subscribe(listener1);
        m.subscribe(listener2);

        m.on('onBefore', testEffect);

        await testEffect(2);

        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('does not call listeners if not subscribed to the event', async () => {
        const m        = marker();
        const listener = vi.fn();
        m.subscribe(listener);

        // подписка только на onSuccess, не onBefore
        m.on('onSuccess', testEffect);

        await testEffect(123); // onBefore вызовется, но marker не слушает

        expect(listener).toHaveBeenCalledTimes(1); // только onSuccess
    });

    it('triggers listeners in order of subscription', async () => {
        const m = marker();

        const calls: string[] = [];
        m.subscribe(() => calls.push('first'));
        m.subscribe(() => calls.push('second'));

        m.on('onBefore', testEffect);

        await testEffect(1);

        expect(calls).toEqual([ 'first', 'second' ]);
    });
});

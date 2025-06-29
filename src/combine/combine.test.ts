import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Store, store } from '../store';
import { combine } from './index';
import { marker } from '../marker';
import { effect } from '../effect';

// Частично сгенерировано AI

describe('combine()', () => {
    let s1: Store<number>;
    let s2: Store<string>;

    beforeEach(() => {
        s1 = store(1);
        s2 = store('a');
    });

    it('computes initial combined value', () => {
        const combined = combine([ s1, s2 ], ([ _s1, _s2 ]) => `${ _s1.get() }-${ _s2.get() }`);
        expect(combined.get()).toBe('1-a');
    });

    it('recomputes when source store changes', () => {
        const combined = combine([ s1, s2 ], ([ _s1, _s2 ]) => `${ _s1.get() }-${ _s2.get() }`);
        s1.set(2);
        expect(combined.get()).toBe('2-a');
        s2.set('b');
        expect(combined.get()).toBe('2-b');
    });

    it('notifies listeners on change', () => {
        const combined = combine([ s1, s2 ], ([ _s1, _s2 ]) => `${ _s1.get() }-${ _s2.get() }`);
        const spy      = vi.fn();
        combined.subscribe(spy);
        s1.set(5);
        s2.set('z');
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith('5-a');
        expect(spy).toHaveBeenCalledWith('5-z');
    });

    it('can unsubscribe from changes', () => {
        const combined    = combine([ s1, s2 ], ([ _s1, _s2 ]) => `${ _s1.get() }-${ _s2.get() }`);
        const spy         = vi.fn();
        const unsubscribe = combined.subscribe(spy);
        s1.set(10);
        unsubscribe();
        s1.set(11);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('respects "enabled" flag (false)', () => {
        const combined = combine([ s1, s2 ], ([ _s1, _s2 ]) => `${ _s1.get() }-${ _s2.get() }`, false);
        const spy      = vi.fn();
        combined.subscribe(spy);
        s1.set(999);
        expect(spy).not.toHaveBeenCalled();
        expect(combined.get()).toBe('1-a'); // unchanged
    });

    it('can enable and disable via markers', async () => {
        const enableMarker  = marker();
        const disableMarker = marker();
        const enableEffect  = effect(async () => 0);
        const disableEffect = effect(async () => 0);
        const combined      = combine([ s1, s2 ], ([ _s1, _s2 ]) => `${ _s1.get() }-${ _s2.get() }`, true);

        enableMarker.on('onBefore', enableEffect);
        disableMarker.on('onBefore', disableEffect);

        combined.enableOn(enableMarker);
        combined.disableOn(disableMarker);

        const spy = vi.fn();
        combined.subscribe(spy);

        await enableEffect();
        s1.set(123);
        expect(spy).toHaveBeenCalledTimes(1);
        await disableEffect();
        s1.set(321);
        expect(spy).toHaveBeenCalledTimes(1);
        await enableEffect();
        s1.set(123);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('throws on .on or .set', () => {
        const combined = combine([ s1, s2 ], ([ _s1, _s2 ]) => `${ _s1.get() }-${ _s2.get() }`);
        expect(() => combined.on(null as any, null as any, null as any)).toThrow();
        expect(() => combined.set('bad' as any)).toThrow();
    });
});

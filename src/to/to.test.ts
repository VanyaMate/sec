import { describe, expect, test } from 'vitest';
import { to } from './index';


describe('to', () => {
    test('valid', () => {
        const arr: Array<number> = [];
        const obj                = {};

        expect(to(1)()).equal(1);
        expect(to(arr)()).equal(arr);
        expect(to(obj)()).equal(obj);
    });

    test('invalid', () => {
        const arr: Array<number> = [];
        const obj                = {};

        expect(to(1)()).not.equal(2);
        expect(to(arr)()).not.equal(obj);
        expect(to(obj)()).not.equal(arr);
    });
});
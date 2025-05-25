import { describe, expect, test } from 'vitest';
import { effect } from '../effect';
import { pending } from './index';


describe('pending', () => {
    test('valid', async () => {
        const getPostsAction = async function () {
            return new Promise<void>((resolve) => setTimeout(resolve, 200));
        };

        const getPostsEffect = effect(getPostsAction);

        const postsPending = pending([ getPostsEffect ]);

        expect(postsPending.get()).equal(false);

        getPostsEffect();
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(postsPending.get()).equal(true);
        await new Promise(resolve => setTimeout(resolve, 150));
        expect(postsPending.get()).equal(false);
    });
});
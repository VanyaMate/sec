# SEC (Store, Effect, Combine)

Tiny state manager

```typescript
import { store, effect, combine } from './index';


const sum = async (a, b) => a + b;

// Create effect
const sumEffect = effect(sum);

// Create stores
const allSums = store(0).on(sumEffect, 'onSuccess', (state, { result }) => state + result);
const lastSum = store(0).on(sumEffect, 'onSuccess', (_, { result }) => result);

// Create combine
const bothSum = combine([ allSums, lastSum ], (...args) => args.reduce((acc, item) => acc + item.get(), 0));
```
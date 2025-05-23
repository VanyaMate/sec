# SEC (Store, Effect, Combine)

Tiny state manager

*will be slightly revised in the future*


```
npm i @vanyamate/sec
```
with
```
npm i @vanyamate/sec-react
npm i @vanyamate/sec-solidjs
```
or
```
// Only for Vue (without "combine")
npm i @vanyamate/sec-vue
```


## Example:

```typescript
// src/actions/user-posts
const getUserPosts = function (userId: string): Promise<Array<Post>> {
  return fetch(`${__API__}/v1/user-posts/${userId}`).then((response) => response.json());
}

const get
```

```typescript
// src/models/user-posts
import { effect, store } from '@vanyamate/sec';

const getUserPostsEffect = effect(getUserPosts);

const $userPostsIsPending = store(false)
  .on(getUserPostsEffect, 'onBefore', () => true)
  .on(getUserPostsEffect, 'onFinally', () => false);

const $userPosts = store<Array<Post>>([])
  .on(getUserPostsEffect, 'onSuccess', (_, { result }) => result);
```

```typescript
// src/models/notifications
import { store } from '@vanyamate/sec';

enum NotificationType {
  ERR,
  WARN,
  SUC,
}

const errorHandler = async function (error: unknown): Notification {
  // code..
  if (error instanceof Error) {
    return {
      type: NotificationType.ERR,
      title: 'Error',
      message: error.message,
    }
  } else if (isDomainError(error) {
    return {
      type: NotificationType.ERR,
      title: error.title,
      message: error.message
    }
  } else {
    return {
      type: NotificationType.ERR,
      title: 'Error',
      message: JSON.stringify(error)
    }
  }
}

const errorHandlerEffect = effect(errorHandler);

const $notifications = store<Array<Notification>>([])
  .on(errorHandlerEffect, 'onSuccess', (state, { result }) => state.concat(result));
```

```typescript
// src/main.tsx
import { getUserPostsEffect, $userPostsIsPending, $userPosts, errorHandlerEffect, $notifications } from '@/models';
import { UserPosts } from '@/entity;
import { Toaster } from '@/shared';

export const App = function ({ userId }) {
  const notifications = useStore($notifications);
  const userPostsIsPending = useStore($userPostsIsPending);
  const userPosts = useStore($userPosts);

  useLayoutEffect(() => {
    getUserPostsEffect(userId).catch(errorHandlerEffect);
  }, [userId]);

  return (
    <main>
      <UserPosts list={ userPosts } pending={ userPostsIsPending } />
      <Toaster list={ notifications } />
    </main>
  );
}
```

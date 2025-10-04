import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from './features/posts/posts.api';
export const store = configureStore({
    reducer: {
        [postsApi.reducerPath]: postsApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(postsApi.middleware),
});

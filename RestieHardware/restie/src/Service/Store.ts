import { configureStore, } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from "redux-thunk";
import rootReducer from './Reducers/RootReducers';

export const store = configureStore( {
    reducer: rootReducer,
} )

export type ReduxState = ReturnType<typeof rootReducer>;
export type TypedDispatch = ThunkDispatch<ReduxState, any, AnyAction>;
export type RootStore = ReturnType<typeof rootReducer>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useTypedDispatch = () => useDispatch<TypedDispatch>();

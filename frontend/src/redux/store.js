import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { combineReducers } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage' // localStorage
import { setupListeners } from '@reduxjs/toolkit/query'
import { ecommerceApi } from './api/ecommerceApi'
import authReducer from './slices/authSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth
}

const rootReducer = combineReducers({
  auth: authReducer,
  [ecommerceApi.reducerPath]: ecommerceApi.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(ecommerceApi.middleware),
})

setupListeners(store.dispatch)

export const persistor = persistStore(store)
import { createSlice, configureStore, createStore } from '@reduxjs/toolkit'
import { SensorData } from './types'

const globalSlice = createSlice({
  name: 'sensor-data',
  initialState: {
    date: new Date().getTime(),
  },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload
    },
 
  }
})

export const { setDate } = globalSlice.actions

export const globalStore = configureStore({
  reducer: globalSlice.reducer
})

export type GlobalState = ReturnType<typeof globalStore.getState>
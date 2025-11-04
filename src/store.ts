import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";

// sheet slice
interface SheetState {
  openName: string | null;
}

const sheetSlice = createSlice({
  name: "dropdown",
  initialState: {
    openName: null
  } satisfies SheetState as SheetState,
  reducers: {
    closeSheet: (state) => {
      state.openName = null;
    },
    openSheet: (state, action: PayloadAction<string>) => {
      state.openName = action.payload;
    }
  }
});
export const {closeSheet, openSheet} = sheetSlice.actions;

// button slice
interface ButtonState {
  pressSave: boolean;
  pressDelete: boolean;
}

const buttonSlice = createSlice({
  name: "button",
  initialState: {
    pressSave: false,
    pressDelete: false
  } satisfies ButtonState as ButtonState,
  reducers: {
    pressSave: (state) => {
      state.pressSave = true;
    },
    unpressSave: (state) => {
      state.pressSave = false;
    },
    pressDelete: (state) => {
      state.pressDelete = true;
    },
    unpressDelete: (state) => {
      state.pressDelete = false;
    },
  }
});
export const {pressSave, unpressSave, pressDelete, unpressDelete} = buttonSlice.actions;

// calendar slice
interface CalendarState {
  selectedDate: string;
}

const calendarSlice = createSlice({
  name: "calendar",
  initialState: {
    selectedDate: dayjs().format("YYYY-MM-DD")
  } satisfies CalendarState as CalendarState,
  reducers: {
    reset: (state) => {
      state.selectedDate = dayjs().format("YYYY-MM-DD");
    },
    changeSelected: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    }
  }
});
export const {reset, changeSelected} = calendarSlice.actions;

// store
const store = configureStore({
  reducer: {
    sheet: sheetSlice.reducer,
    button: buttonSlice.reducer,
    calendar: calendarSlice.reducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
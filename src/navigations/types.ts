import { NavigatorScreenParams } from "@react-navigation/native";
import Book from "../database/Book";

export type RootStackParamList = {
  ReviewWrite: {
    mode: "modify" | "write",
    reviewId?: number,
    book?: Book
  };
  ReviewDetail: {
    reviewId: number,
  };
  Tab: NavigatorScreenParams<TabParamList>;
}

export type ReviewStackParamList = {
  ReviewList: undefined;
}

export type SearchStackParamList = {
  BookSearch: undefined;
}

export type CalendarStackParamList = {
  Calendar: undefined;
}

export type TabParamList = {
  ReviewNav: NavigatorScreenParams<ReviewStackParamList>;
  SearchNav: NavigatorScreenParams<SearchStackParamList>;
  CalendarNav: NavigatorScreenParams<CalendarStackParamList>;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
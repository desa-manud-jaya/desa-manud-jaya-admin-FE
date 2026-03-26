import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import adminApprovalReducer from "./slices/admin-approval-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminApproval: adminApprovalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
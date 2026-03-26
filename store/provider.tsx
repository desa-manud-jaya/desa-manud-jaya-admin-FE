"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { hydrateAuthState } from "./slices/auth-slice";
import { loadAuthFromStorage } from "./utils/auth-storage";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const stored = loadAuthFromStorage();
    dispatch(hydrateAuthState(stored));
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}
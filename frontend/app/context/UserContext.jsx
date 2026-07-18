"use client";

import { createContext, useContext } from "react";

const UserContext = createContext(null);
const SetUserContext = createContext(null);

export function UserProvider({ user, setUser, children }) {
  return (
    <UserContext.Provider value={user}>
      <SetUserContext.Provider value={setUser}>
        {children}
      </SetUserContext.Provider>
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export function useSetUser() {
  return useContext(SetUserContext);
}
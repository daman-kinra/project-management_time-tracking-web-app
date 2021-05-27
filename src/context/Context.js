import React, { createContext, useEffect, useState } from "react";
import { app } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
export const Data = createContext();
export const Context = (props) => {
  const [user, loading, error] = useAuthState(app.auth());
  const [canEnter, setCanEnter] = useState(false);
  const changeCanEnter = (val) => {
    setCanEnter(val);
  };

  useEffect(() => {
    app.auth().onAuthStateChanged((user) => {
      setCanEnter(true);
    });
  }, []);
  return (
    <Data.Provider
      value={{
        user,
        loading,
        error,
        email: user ? user.email : "",
        canEnter,
        changeCanEnter,
      }}
    >
      {props.children}
    </Data.Provider>
  );
};

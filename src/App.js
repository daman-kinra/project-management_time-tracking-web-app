import React, { useEffect, useContext } from "react";
import { app } from "./firebase/firebase";
import Home from "./pages/home/Home";
import Project from "./pages/project/Project";
import { Switch, Route } from "react-router-dom";
import { Data } from "./context/Context";
import Login from "./pages/login/Login";
function App() {
  const { user, loading, canEnter } = useContext(Data);
  if (loading) {
    return <h1>loading....</h1>;
  }
  if (!user) {
    return <Login />;
  }
  if (user) {
    return (
      <>
        {canEnter ? (
          <Switch>
            <Route exact path="/" component={Home}></Route>
            <Route exact path="/projects/:id" component={Project}></Route>
            <Route
              exact
              path="/projects/:admin/:id"
              component={Project}
            ></Route>
          </Switch>
        ) : (
          <h1>loading....</h1>
        )}
      </>
    );
  }
}

export default App;

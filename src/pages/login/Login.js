import React, { useContext } from "react";
import { app, provider } from "../../firebase/firebase";
import { Data } from "../../context/Context";
function Login() {
  const { changeCanEnter } = useContext(Data);
  const loginWithGmail = () => {
    app
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        app
          .firestore()
          .collection("users")
          .doc(result.user.email)
          .get()
          .then((doc) => {
            if (doc.exists) {
              changeCanEnter(true);
            } else {
              app
                .firestore()
                .collection("users")
                .doc(result.user.email)
                .set({ asCollaborator: [] })
                .then(() => {
                  changeCanEnter(true);
                });
            }
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return <button onClick={loginWithGmail}>Login</button>;
}

export default Login;

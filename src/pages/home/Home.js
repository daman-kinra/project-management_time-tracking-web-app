import React, { useContext, useEffect, useState } from "react";
import { Data } from "../../context/Context";
import { app } from "../../firebase/firebase";
import { Link } from "react-router-dom";
function Home() {
  const { email } = useContext(Data);
  const usersRef = app.firestore().collection("users");
  const projectsRef = usersRef.doc(email).collection("projects");
  const [allProjects, setAllProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [loading, setLoading] = useState(true);
  const [asCollaborator, setCollaborator] = useState([]);
  useEffect(() => {
    setLoading(true);
    projectsRef.onSnapshot((qurey) => {
      const arr = [];
      qurey.forEach((doc) => {
        arr.push({ ...doc.data(), doc_id: doc.id });
      });
      setNewProject("");
      setAllProjects(arr);
      setLoading(false);
    });
    usersRef.doc(email).onSnapshot((doc) => {
      setCollaborator(doc.data()?.asCollaborator);
    });
  }, []);

  const addNewProject = (e) => {
    projectsRef.doc(newProject).set({
      totalTasks: 0,
      completedTask: 0,
      collaborators: [],
      admin: email,
    });
  };
  const acceptProjectRequest = (pos) => {
    const arr = asCollaborator;
    arr[pos].pending = false;
    usersRef
      .doc(email)
      .update({ asCollaborator: [...arr] })
      .then()
      .catch((err) => {
        console.log(err);
      });
  };
  const rejectProjectRequest = (pos) => {
    const arr = asCollaborator;
    console.log(pos);
    usersRef
      .doc(arr[pos].admin)
      .collection("projects")
      .doc(arr[pos].projectName)
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log(doc.data());
          const collabArr = doc.data().collaborators;
          const newArr = collabArr.filter((item) => item !== email);
          usersRef
            .doc(arr[pos].admin)
            .collection("projects")
            .doc(arr[pos].projectName)
            .update({
              collaborators: [...newArr],
            })
            .then(() => {
              delete arr[pos];
              let newArr = arr.filter((item) => item !== null);
              usersRef.doc(email).update({ asCollaborator: [...newArr] });
            });
        }
      });
  };
  return (
    <div className="home">
      {loading ? (
        <h1>loading....</h1>
      ) : (
        <>
          <button
            onClick={() => {
              app.auth().signOut();
            }}
          >
            Logout
          </button>
          <h1>{email}</h1>
          <h1>Project owned</h1>
          {allProjects.map((data) => {
            return (
              <button key={data.doc_id}>
                <Link to={`/projects/${data.doc_id}`}>{data.doc_id}</Link>;
              </button>
            );
          })}
          <h1>Project Included in</h1>
          {asCollaborator &&
            asCollaborator.map((data, pos) => {
              return (
                <div key={data?.admin + data?.projectName}>
                  <button
                    style={{ pointerEvents: data?.pending ? "none" : "" }}
                  >
                    <Link to={`/projects/${data.admin}/${data.projectName}`}>
                      {data.projectName}
                    </Link>
                  </button>
                  {data?.pending && (
                    <div>
                      <button
                        onClick={() => {
                          acceptProjectRequest(pos);
                        }}
                      >
                        ACCEPT
                      </button>
                      <button
                        onClick={() => {
                          rejectProjectRequest(pos);
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          <input
            type="text"
            value={newProject}
            onChange={(e) => {
              setNewProject(e.target.value);
            }}
          />
          <button onClick={addNewProject}>ADD</button>
        </>
      )}
    </div>
  );
}

export default Home;

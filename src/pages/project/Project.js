import React, { useContext, useEffect, useState } from "react";
import { Data } from "../../context/Context";
import { app } from "../../firebase/firebase";
function Project(props) {
  const { email } = useContext(Data);
  const usersRef = app.firestore().collection("users");
  const projectsRef =
    props.match.params.admin && props.match.params.id
      ? usersRef.doc(props.match.params.admin).collection("projects")
      : usersRef.doc(email).collection("projects");
  const tasksRef = projectsRef.doc(props.match.params.id).collection("tasks");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [haveAccess, setAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [projectDetails, setProjectDetails] = useState({});
  const [collaboratorsDetails, setCollaboratorsDetails] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(false);
  useEffect(() => {
    projectsRef
      .doc(props.match.params.id)
      .get()
      .then((doc) => {
        if (doc.exists) {
        } else {
          if (props.match.params.admin) {
            usersRef
              .doc(email)
              .get()
              .then((doc) => {
                if (doc.exists) {
                  const arr = doc.data().asCollaborator;
                  const newArr = arr.filter(
                    (item) =>
                      `${item.admin}_${item.projectName}` !==
                      `${props.match.params.admin}_${props.match.params.id}`
                  );
                  usersRef
                    .doc(email)
                    .update({ asCollaborator: [...newArr] })
                    .then(() => {
                      props.history.push("/");
                    });
                }
              });
          }
        }
      });
  }, [forceUpdate]);
  useEffect(() => {
    if (!props.match.params.admin) {
      setIsAdmin(true);
      setAccess(true);
    }
    projectsRef.doc(props.match.params.id).onSnapshot((doc) => {
      if (doc.exists) {
        setProjectDetails(doc.data());
      }
    });

    tasksRef.orderBy("priority").onSnapshot((query) => {
      const arr = [];
      query.forEach((doc) => {
        arr.push({ ...doc.data(), task_id: doc.id });
      });
      setNewTask("");
      setTasks(arr);
    });

    if (props.match.params.admin) {
      projectsRef.doc(props.match.params.id).onSnapshot((doc) => {
        if (doc.data() && doc.data().collaborators?.includes(email)) {
          setAccess(true);
        } else {
          props.history.push("/");
        }
      });
    }
    return () => {
      setProjectDetails({});
    };
  }, []);
  const addNewTask = (e) => {
    tasksRef
      .doc(`task-${tasks.length + 1}`)
      .set({
        priority: tasks.length,
        taskName: newTask,
        timeGiven: 0,
        completed: false,
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  };
  const putToTrash = (data) => {
    tasksRef.doc(data.task_id).update({ ...data, trashed: true });
    // tasksRef.doc(data.task_id).delete();
  };
  const addNewCollaborator = () => {
    usersRef
      .doc(newCollaborator)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const oldProjects = doc.data().asCollaborator
            ? doc.data().asCollaborator
            : [];
          projectsRef
            .doc(props.match.params.id)
            .get()
            .then((doc) => {
              if (doc.exists) {
                const oldList = doc.data().collaborators;
                projectsRef
                  .doc(props.match.params.id)
                  .update({ collaborators: [...oldList, newCollaborator] })
                  .then(() => {
                    usersRef
                      .doc(newCollaborator)
                      .update({
                        asCollaborator: [
                          ...oldProjects,
                          {
                            admin: email,
                            projectName: props.match.params.id,
                            pending: true,
                          },
                        ],
                      })
                      .then(() => {
                        console.log("done");
                      });
                  });
              }
            });
        } else {
          console.log("no user");
        }
      });
  };
  const removeCollaborator = (id) => {
    usersRef
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const arr = doc.data().asCollaborator;
          const newArr = arr.filter(
            (item) =>
              item.admin !== email && item.projectName !== props.match.params.id
          );
          usersRef
            .doc(id)
            .update({ asCollaborator: [...newArr] })
            .then(() => {
              const collabArr = projectDetails.collaborators;

              const newArrWithoutRemovedCollborator = collabArr.filter(
                (item) => item !== id
              );
              projectsRef.doc(props.match.params.id).update({
                collaborators: [...newArrWithoutRemovedCollborator],
              });
            });
        }
      });
  };
  return (
    <div className="project">
      {isAdmin ? (
        <>
          <input
            type="text"
            value={newCollaborator}
            onChange={(e) => {
              setNewCollaborator(e.target.value);
            }}
          />
          <button onClick={addNewCollaborator}>NEW ADD</button>
        </>
      ) : (
        ""
      )}
      {tasks.length > 0
        ? tasks.map((data) => {
            return data?.trashed ? (
              ""
            ) : (
              <div className="tasks" key={data?.task_id}>
                {data?.taskName}
                <button
                  onClick={() => {
                    putToTrash(data);
                  }}
                >
                  DELETE
                </button>
              </div>
            );
          })
        : ""}
      <>
        {projectDetails.hasOwnProperty("collaborators")
          ? projectDetails?.collaborators.map((item) => {
              return (
                <div key={item}>
                  {item}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        removeCollaborator(item);
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })
          : ""}
      </>
      <input
        type="text"
        value={newTask}
        onChange={(e) => {
          setNewTask(e.target.value);
        }}
      />
      <button onClick={addNewTask}>ADD</button>
      {isAdmin && (
        <button
          onClick={() => {
            projectsRef
              .doc(props.match.params.id)
              .delete()
              .then(() => {
                props.history.push("/");
                setForceUpdate(true);
              });
          }}
        >
          Delete Project
        </button>
      )}
    </div>
  );
}

export default Project;

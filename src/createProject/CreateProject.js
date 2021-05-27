import React from "react";
import app from "../firebase/firebase";
function CreateProject(props) {
  const addNewProject = () => {
    props.projectsRef.doc("newProject").collection("tasks").doc("task-1").set({
      priority: 0,
      taskName: "new Task in newProject doc",
      timeGiven: 0,
    });
    props.projectsRef.doc("newProject").set({ totalTasks: 1 });
    // props.projectsRef.onSnapshot((query) => {
    //   query.forEach((element) => {
    //     console.log(element.id);
    //   });
    // });
  };

  return <button onClick={addNewProject}>add</button>;
}

export default CreateProject;

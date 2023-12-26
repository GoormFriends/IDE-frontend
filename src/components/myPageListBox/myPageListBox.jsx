import React from "react";
import { Link } from "react-router-dom";
import styles from "./myPageListBox.module.css";

function MyListBox({ listName, listInfo }) {
  const { userId } = JSON.parse(localStorage.getItem("user"));

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>{listName}</h4>
      {listInfo.map(item => (
        <div className={styles.itemContainer} key={item.directoryProblemId}>
          <p className={styles.problemTitle}>
            <Link
              className={styles.link}
              to={`/solve/${userId}/${item.problemId}`}
            >
              {item.problemTitle}
            </Link>
          </p>
        </div>
      ))}
    </div>
  );
}
export default MyListBox;

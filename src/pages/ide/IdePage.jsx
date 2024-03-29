/* eslint-disable */
import React, { useContext, useEffect, useState, useRef } from "react";
import * as StompJs from "@stomp/stompjs";
import {
  IoChatboxEllipsesOutline,
  IoExitOutline,
  IoBookmarks,
} from "react-icons/io5";
import { NavLink, useLocation, useParams } from "react-router-dom";
import styles from "./IdePage.module.css";
import MonacoEditor from "../../components/Ide/MonacoEditor";
import ProblemContent from "../../components/Ide/ProblemContent";
import InputOutput from "../../components/Ide/InputOutput";
import { EditorContext } from "../../contexts/EditorContext";
import MyListContainer from "../../components/myList/MyListContainer";
import ChatModal from "../../components/chatModal/ChatModal";
import { Tooltip } from "@mui/material";
import Confetti from "../../components/Ide/Confetti";
import instance from "../login-page/api";

export default function IdePage() {
  const [executionResult, setExecutionResult] = useState("");
  const { editor, setEditor } = useContext(EditorContext);
  const [problems, setProblems] = useState(null);
  const [isMyListVisible, setIsMyListVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isConfetti, setIsConfetti] = useState(false);
  const location = useLocation();
  const { userId, problemId } = useParams();
  const [messageLists, setMessageLists] = useState([]);
  const [message, setMessage] = useState("");
  const guestDataString = localStorage.getItem("user");
  const guestData = JSON.parse(guestDataString);
  const guestId = String(guestData?.userId);
  const guestNickname = guestData?.name;
  const guestProfile = guestData?.profileImage;

  // 클라이언트 생성
  const client = useRef({});

  // 데이터 가져오기
  const subscribe = () => {
    client.current.subscribe(`/sub/chat/${userId}/${problemId}`, body => {
      const jsonBody = JSON.parse(body.body);
      setMessageLists(prevMessagList => [...prevMessagList, jsonBody]);
    });
  };

  // 메시지 보내기
  const publish = chat => {
    if (!client.current.connected) return; // 연결되지 않았으면 메시지를 보내지 않는다.
    const time = new Date().getTime();
    client.current.publish({
      destination: "/pub/chat",
      body: JSON.stringify({
        ownerId: userId,
        problemId,
        userId: guestId,
        userNickname: guestNickname,
        userProfile: guestProfile,
        time,
        message: chat,
      }),
    });
    setMessage("");
  };

  // 채팅 가져오기
  const chatList = async () => {
    try {
      const response = await instance.get(`/chat/${userId}/${problemId}`);
      setMessageLists(response.data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // 웹소켓 연결
  const connect = () => {
    client.current = new StompJs.Client({
      brokerURL: "ws://localhost:8081/ws",
      onConnect: () => {
        setMessageLists([]);
        chatList();
        subscribe(); // 연결 성공 시 구독하는 로직 실행
        //시스템 메시지 보내기

        // const time = new Date().getTime();
        // const systemMessage = {
        //   ownerId: userId,
        //   problemId,
        //   userId: "-1",
        //   userNickname: "system",
        //   userProfile: null,
        //   time,
        //   message: "채팅에 연결되었습니다.",
        // };
        // client.current.publish({
        //   destination: `/pub/chat`,
        //   body: JSON.stringify(systemMessage),
        // });
      },
    });
    client.current.activate(); // 클라이언트 활성화
  };

  // 연결이 끊겼을 때
  const disconnect = () => {
    client.current.deactivate();
  };

  useEffect(() => {
    connect();

    return () => disconnect();
  }, []);

  // ide 데이터 조회
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token available");
      return;
    }
    fetch(`http://localhost:8081/api/problems/ide/${userId}/${problemId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(response => {
        return response.json();
      })
      // 초대 받은 사람인지 / 주인인지 확인 먼저(백엔드 -> status code -> 어떻게 보여줄지)
      // 200일때는 데이터를 같이 받아서 / 403일때는 데이터없이 유저를 이동 유도
      .then(data => {
        setProblems(data);
        if (data.usercode) {
          setEditor(data.usercode);
        }
        console.log("data", { data });
        console.log(`userId: ${userId}, problemId: ${problemId}`);
      })
      .catch(error => console.error(error));

    setExecutionResult("");
    setIsMyListVisible(false);
  }, [location]);

  // 제출 후 채점하기
  const handleSubmit = async () => {
    console.log("handleSubmit: ", userId, problemId);
    console.log("usercode: ", { editor });
    const accessToken = window.localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `http://localhost:8081/solve/${userId}/${problemId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ usercode: editor }),
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("response data", { data });

      const state = data.information?.state || data.state;
      let executeResultPhase = "";
      if (state === "COMPILE_ERROR") {
        executeResultPhase = "컴파일 에러입니다.";
        setIsConfetti(false);
      } else if (state === "WRONG_ANSWER") {
        executeResultPhase = "오답입니다.";
        setIsConfetti(false);
      } else if (state === "SUCCESS") {
        executeResultPhase = "정답입니다!";
        setIsConfetti(true);

        setTimeout(() => {
          setIsConfetti(false);
        }, 500); // 5000ms = 5초
      } else {
        executeResultPhase = "ERROR! 다시 시도해주세요.";
        setIsConfetti(false);
      }
      setExecutionResult(executeResultPhase);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const toggleMyListVisible = () => {
    setIsMyListVisible(!isMyListVisible);
  };

  const toggleChatVisible = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div>
      <Confetti isConfetti={isConfetti} className={styles.confetti} />
      <div className={styles.container}>
        <header className={styles.header}>
          {isMyListVisible && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                zIndex: 999,
              }}
            >
              <MyListContainer onClose={() => setIsMyListVisible(false)} />
            </div>
          )}
          {problems && (
            <>
              <p className={styles.problemTitle}>{problems.title}</p>
              <span className={styles.problemLevel}>Lv. {problems.level}</span>
            </>
          )}
          <div className={styles.linkContainer}>
            <NavLink to="/" className={styles.link}>
              문제 목록으로 나가기
            </NavLink>
          </div>
        </header>
        <div className={styles.body_container}>
          <section className={styles.problemInfoContainer}>
            {problems && (
              <ProblemContent type="문제 설명" content={problems.content} />
            )}
            <div className={styles.testcase_container}>
              <h4 className={styles.testcase_label}>예제 설명</h4>
              {problems?.testCases?.map((testCase, index) => (
                <InputOutput
                  key={testCase.testCaseId}
                  num={index}
                  input={testCase.input}
                  output={testCase.output}
                />
              ))}
            </div>
          </section>
          <section className={styles.solveContainer}>
            <div className={styles.editorContainer}>
              <MonacoEditor userCode={problems?.usercode || ""} />
            </div>
            <div className={styles.executeResult}>
              <h4 className={styles.executeResultLabel}>실행 결과</h4>
              <div className={styles.executeResultContent}>
                {executionResult}
              </div>
            </div>
          </section>
        </div>
        <footer className={styles.footer}>
          <div className={styles.button_container}>
            <Tooltip title="채팅">
              <button
                type="button"
                aria-label="chattingButton"
                className={styles.chattingButton}
                onClick={() => toggleChatVisible()}
              >
                <IoChatboxEllipsesOutline className={styles.chattingIcon} />
              </button>
            </Tooltip>
            <Tooltip title="마이리스트 메뉴">
              <button
                type="button"
                aria-label="마이리스트 메뉴 열기 버튼"
                className={styles.myListMenuButton}
                onClick={toggleMyListVisible}
              >
                <IoBookmarks />
              </button>
            </Tooltip>
          </div>
          {isChatVisible && (
            <div className={styles.chat_modal}>
              <ChatModal
                message={message}
                setMessage={setMessage}
                messageLists={messageLists}
                userId={guestId}
                publish={publish}
                chatList={chatList}
              />
            </div>
          )}
          <button
            type="button"
            className={styles.executeButton}
            onClick={handleSubmit}
          >
            제출 후 채점하기
          </button>
        </footer>
      </div>
    </div>
  );
}

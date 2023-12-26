import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { useQuery } from "react-query";
import styles from "./ProblemListsPage.module.css";
import Header from "../../components/header/Header";
import MiniMyList from "../../components/miniMyList/MiniMyList";
import fetchProblemLists from "../../api/ProblemListsService";
import { fetchMyLists } from "../../api/MyListService";

const problemListsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [problemLists, setProblemLists] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [stateFilter, setstateFilter] = useState("DEFAULT");
  const [levelFilter, setLevelFilter] = useState("DEFAULT");
  const [isListsEditing, setIsListsEditing] = useState(false);
  const [editingNum, setEditingNum] = useState(-1);

  // const isLogin = localStorage.getItem("accessToken");
  // const navigate = useNavigate();

  // localStorage에서 userId 가져오기
  const getUserId = () => {
    const userDataString = localStorage.getItem("user");
    const userData = JSON.parse(userDataString);
    const userId = userData?.userId;

    return userId;
  };
  const userId = getUserId();

  const {
    data: total,
    isLoading,
    error,
    isFetching,
  } = useQuery(["problemLists", userId], () => fetchProblemLists(userId));

  const { data: totalMyLists } = useQuery(["myLists", userId], () =>
    fetchMyLists(userId),
  );
  // invalidate를 전체 problem를 1번

  // 내가 갖고 있는 모든 디렉토리->minimylsit로 props 넘겨줌, 문제들-> 테이블
  // minimylists는 그 문제에 대한 리스트: 현재리스트 / 전체리스트(보여주기만)
  // minimylits 추가 삭제: mutation마다 최상단의 문제들 problemLists를 invalidate(무효화) -> 리렌더링(마이리스트처럼 해결)

  useEffect(() => {
    // 불러오는 방법
    // context api(둘을 감싸서 바텀업) or react query
  }, [isListsEditing]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filterProblems = (searchTerm, corFilter, levFilter) => {
    const filteredRows = rows.filter(item => {
      const itemText = item.title ? item.title : "";
      const itemNum = item.problemId ? item.problemId.toString() : "";

      if (
        !searchTerm.trim() &&
        corFilter === "DEFAULT" &&
        levFilter === "DEFAULT"
      ) {
        return true;
      }

      const searchTermRegex = new RegExp([...searchTerm].join(".*"), "i");
      const corFilterMatch =
        corFilter === "DEFAULT" || item.ideState === corFilter;
      const levFilterMatch =
        levFilter === "DEFAULT" || String(item.level) === levFilter;
      const numMatch = String(itemNum).includes(searchTerm);

      return (
        (searchTermRegex.test(itemText.toLowerCase()) || numMatch) &&
        corFilterMatch &&
        levFilterMatch
      );
    });

    setRows();
    setProblemLists(
      !searchTerm.trim() && corFilter === "DEFAULT" && levFilter === "DEFAULT"
        ? rows
        : filteredRows,
    );
  };

  const handleFilterInput = e => {
    setSearchFilter(e.target.value);
    filterProblems(e.target.value, stateFilter, levelFilter);
  };

  const handlestateFilterChange = event => {
    const newstate = event.target.value;

    setstateFilter(newstate);
    filterProblems(searchFilter, newstate, levelFilter);
  };

  const handleLevelFilterChange = event => {
    const newLevel = event.target.value;

    setLevelFilter(newLevel);
    filterProblems(searchFilter, stateFilter, newLevel);
  };

  const toggleOnListsEditor = num => () => {
    setIsListsEditing(true);
    setEditingNum(num);
  };

  const toggleOffListsEditor = e => {
    e.stopPropagation();
    setIsListsEditing(false);
    setEditingNum(-1);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isFetching) console.log({ isFetching });
  if (error) {
    console.log("my list error");
    console.log(error);
    return <div>An error occurred: {error.message}</div>;
  }
  return (
    <div>
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.search_bar}>
          <Container sx={{ mt: 5 }}>
            <TextField
              type="search"
              id="search"
              label="Search"
              value={searchFilter}
              onChange={e => handleFilterInput(e)}
              sx={{ width: 680 }}
            />
          </Container>
        </div>
        <div className={styles.sort_standard}>
          <div className={styles.sort_state}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="state-select-label">상태</InputLabel>
                <Select
                  labelId="state-select-label"
                  id="state-select"
                  label="state"
                  value={stateFilter}
                  onChange={handlestateFilterChange}
                >
                  <MenuItem value="DEFAULT">none</MenuItem>
                  <MenuItem value="SUCCESS">O</MenuItem>
                  <MenuItem value="FAILURE">X</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </div>
          <div className={styles.sort_level}>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="level-select-label">난이도</InputLabel>
                <Select
                  labelId="level-select-label"
                  id="level-select"
                  label="level"
                  value={levelFilter}
                  onChange={handleLevelFilterChange}
                >
                  <MenuItem value="DEFAULT">none</MenuItem>
                  <MenuItem value="0">Lv.0</MenuItem>
                  <MenuItem value="1">Lv.1</MenuItem>
                  <MenuItem value="2">Lv.2</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </div>
          <Paper sx={{ mt: 2, width: 680 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">상태</TableCell>
                    <TableCell align="right">번호</TableCell>
                    <TableCell align="left">제목</TableCell>
                    <TableCell align="center">난이도</TableCell>
                    <TableCell align="left">리스트</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {total &&
                    total
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map(problemList => {
                        const levelMap = {
                          0: styles.lv0,
                          1: styles.lv1,
                          2: styles.lv2,
                        };

                        const levelClass =
                          levelMap[problemList.level.toString()] || "";

                        let stateIcon = null;
                        if (
                          problemList.ideState &&
                          problemList.ideState === "SUCCESS"
                        ) {
                          stateIcon = <span className={styles.OText}>O</span>;
                        } else if (
                          problemList.ideState &&
                          problemList.ideState === "FAILURE"
                        ) {
                          stateIcon = <span className={styles.XText}>X</span>;
                        }

                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={problemList.problemId}
                          >
                            <TableCell width="60" align="center">
                              {stateIcon}
                            </TableCell>
                            <TableCell
                              width="30"
                              component="th"
                              scope="row"
                              align="right"
                            >
                              {problemList.problemId}
                            </TableCell>
                            <TableCell width="200" align="left">
                              <Link
                                className={styles.problem_title}
                                to={`/solve/${userId}/${problemList.problemId}`}
                              >
                                {problemList.title}
                              </Link>
                            </TableCell>
                            <TableCell width="50" align="center">
                              <span
                                className={levelClass}
                              >{`Lv.${problemList.level}`}</span>
                            </TableCell>
                            <TableCell
                              width="150"
                              align="left"
                              onClick={toggleOnListsEditor(
                                problemList.problemId,
                              )}
                            >
                              {problemList.customDirectoryInfos &&
                                problemList.customDirectoryInfos.map(item => (
                                  <span
                                    className={styles.list_box}
                                    key={item.customDirectoryId}
                                  >
                                    {item.customDirectoryName}
                                  </span>
                                ))}
                              {isListsEditing &&
                              editingNum === problemList.problemId ? (
                                <MiniMyList
                                  userId={userId}
                                  currentMyLists={
                                    problemList.customDirectoryInfos
                                  }
                                  totalMyLists={totalMyLists}
                                  problemId={problemList.problemId}
                                  isListsEditing={isListsEditing}
                                  toggleOffListsEditor={toggleOffListsEditor}
                                />
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={problemLists ? problemLists.length : 10}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          <div className={styles.proplem_table_container} />
        </div>
      </div>
    </div>
  );
};

export default problemListsPage;

import React, { useEffect, useMemo, useState } from "react";
import { TextField } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import styles from "./ProblemListsPage.module.css";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import fetchProblemLists from "../../api/ProblemListsService";
import ProblemRow from "../../components/problemList/ProblemRow";

const problemListsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("DEFAULT");
  const [levelFilter, setLevelFilter] = useState("DEFAULT");

  const isLogin = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }
  });

  // localStorage에서 userId 가져오기
  const getUserId = () => {
    const userDataString = localStorage.getItem("user");
    const userData = JSON.parse(userDataString);
    const userId = userData?.userId;

    return userId;
  };
  const userId = getUserId();

  const {
    data: problems,
    isLoading,
    error,
    isFetching,
  } = useQuery(["problemLists", userId], () => fetchProblemLists(userId));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleStateFilterChange = event => {
    setStateFilter(event.target.value);
  };

  const handleLevelFilterChange = event => {
    setLevelFilter(event.target.value);
  };

  const filteredData = useMemo(() => {
    return (problems || []).filter(item => {
      const matchesSearchTerm =
        searchTerm === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.problemId).includes(searchTerm);

      const matchesStateFilter =
        stateFilter === "DEFAULT" || item.ideState === stateFilter;
      const matchesLevelFilter =
        levelFilter === "DEFAULT" || String(item.level) === levelFilter;

      return matchesSearchTerm && matchesStateFilter && matchesLevelFilter;
    });
  }, [problems, searchTerm, stateFilter, levelFilter]);

  if (isLoading) return <div>Loading...</div>;
  if (isFetching) console.log({ isFetching });
  if (error) {
    console.log("my list error");
    console.log(error);
    return <div>An error occurred: {error.message}</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.body_container}>
        <div className={styles.searchFilter_container}>
          <div className={styles.searchbar}>
            <TextField
              fullWidth
              type="search"
              id="search"
              label="🔍  풀고 싶은 문제 번호, 제목을 검색하세요"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filter_container}>
            <div className={styles.filter}>
              <FormControl fullWidth>
                <InputLabel id="state-select-label">상태</InputLabel>
                <Select
                  labelId="state-select-label"
                  id="state-select"
                  label="state"
                  value={stateFilter}
                  onChange={handleStateFilterChange}
                >
                  <MenuItem value="DEFAULT">전체</MenuItem>
                  <MenuItem value="SUCCESS">O</MenuItem>
                  <MenuItem value="FAILURE">X</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className={styles.filter}>
              <FormControl fullWidth>
                <InputLabel id="level-select-label">난이도</InputLabel>
                <Select
                  labelId="level-select-label"
                  id="level-select"
                  label="level"
                  value={levelFilter}
                  onChange={handleLevelFilterChange}
                >
                  <MenuItem value="DEFAULT">전체</MenuItem>
                  <MenuItem value="0">Lv.0</MenuItem>
                  <MenuItem value="1">Lv.1</MenuItem>
                  <MenuItem value="2">Lv.2</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        <div className={styles.table_container}>
          <Table aria-label="problem table">
            <TableHead>
              <TableRow>
                <TableCell align="center">상태</TableCell>
                <TableCell align="center">번호</TableCell>
                <TableCell align="center">제목</TableCell>
                <TableCell align="center">난이도</TableCell>
                <TableCell align="center">마이리스트</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData &&
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(problem => (
                    <ProblemRow
                      key={problem.problemId}
                      userId={userId}
                      state={problem.ideState}
                      problemId={problem.problemId}
                      problemName={problem.title}
                      level={problem.level}
                      directories={problem.customDirectoryInfos}
                    />
                  ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredData ? filteredData.length : 10}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default problemListsPage;

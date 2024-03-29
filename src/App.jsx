import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ProblemListsPage from "./pages/problem_lists_page/ProblemListsPage";
import IdePage from "./pages/ide/IdePage";
import LoginPage from "./pages/login-page/LoginPage";
import RedirectPage from "./pages/login-page/RedirectPage";
import MyPage from "./pages/my_page/my_page";
import MyListContainer from "./components/myList/MyListContainer";
import { EditorProvider } from "./contexts/EditorContext";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ProblemListsPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/solve/:userId/:problemId" element={<IdePage />} />
            <Route
              path="/mylist/:userId/:problemId"
              element={<MyListContainer />}
            />
            <Route path="/oauth2" element={<RedirectPage />} />
          </Routes>
        </Router>
      </EditorProvider>
    </QueryClientProvider>
  );
}

export default App;

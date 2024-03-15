import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./components/layout";
import ProtectedRoute from "./components/protected-route";

import Home from "./routes/home";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";

import { createGlobalStyle, styled } from "styled-components";
import reset from "styled-reset";
import GlobalFont from "./styles/GlobalFonts";
import Chat from "./routes/chat";
import Store from "./routes/store";
import Set from "./routes/set";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <Home /> },
      { path: "chat", element: <Chat /> },
      { path: "store", element: <Store /> },
      { path: "set", element: <Set /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
]);

const GlobalStyles = createGlobalStyle`
  ${reset};
  * {
    box-sizing: border-box;
  }
  body {
    background-color: white;
    color:black;
  }
`;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  return (
    <Wrapper>
      <GlobalStyles />
      <GlobalFont />
      <RouterProvider router={router} />
    </Wrapper>
  );
}

export default App;

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
} from "react-router-dom";
import { AppShell, Button, Title } from "@mantine/core";
import LoginPage from "./LoginPage";
import AuctionItemList from "./AuctionItemList";
import ItemDetail from "./ItemDetail";
import { useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <AppShell
        header={isAuthenticated ? { height: 60 } : undefined}
        padding="md"
      >
        {isAuthenticated && (
          <AppShell.Header p="xs">
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  flexGrow: 1,
                }}
              >
                <Title order={3}>Auction 2024</Title>
              </Link>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </AppShell.Header>
        )}
        <AppShell.Main pt={isAuthenticated ? 60 : 0}>
          <Routes>
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <LoginPage setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ? <AuctionItemList /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/item/:id"
              element={
                isAuthenticated ? <ItemDetail /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
} from "@mantine/core";
import { login } from "./api";

interface LoginPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(identifier, password);
      localStorage.setItem("token", response.jwt);
      localStorage.setItem("user", JSON.stringify(response.user));
      setIsAuthenticated(true); // Update the authentication state
      navigate("/");
    } catch (err) {
      console.log(err);
      setError("Invalid credentials");
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome to MLBD Auction 2024</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Enter your credentials to login
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="john.doe@monstar-lab.com"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Text c="red" size="sm" mt="sm">
              {error}
            </Text>
          )}
          <Button type="submit" fullWidth mt="xl">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;

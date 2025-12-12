/* eslint-disable no-unused-vars */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../redux/api/ecommerceApi";
import { setCredentials } from "../../redux/slices/authSlice";
import { loginSchema } from "../../utils/schemas";
import { toast } from "react-toastify";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Card,
} from "@mui/material";
import { useEffect } from "react";

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data).unwrap();
      dispatch(setCredentials(response));
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Login failed");
    }
  };

  useEffect(() => {
    if (errors.root) toast.error(errors.root.message);
  }, [errors.root]);

  return (
    <Container component="main" maxWidth="sm">
      <Card sx={{ mt: 8, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h4">
            Sign In
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <Typography variant="body2" align="center">
              {"Don't have an account? "} <Link to="/register">Sign Up</Link>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

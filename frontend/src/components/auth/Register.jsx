import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../../redux/api/ecommerceApi";
import { setCredentials } from "../../redux/slices/authSlice";
import { registerSchema } from "../../utils/schemas";
import { toast } from "react-toastify";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Card,
} from "@mui/material";

export const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await registerUser(data).unwrap();
      dispatch(setCredentials(response));
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Registration failed");
    }
  };

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
            Sign Up
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
              label="Name"
              autoComplete="name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
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
              autoComplete="new-password"
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
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
            <Typography variant="body2" align="center">
              {"Already have an account? "} <Link to="/login">Sign In</Link>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

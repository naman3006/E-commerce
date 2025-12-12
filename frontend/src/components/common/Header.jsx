import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
} from "@mui/material";
import { ShoppingCart, Favorite, AccountCircle } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { useGetCartQuery } from "../../redux/api/ecommerceApi";

export const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery(undefined, { skip: !user });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          E-Shop Advanced
        </Typography>
        <Button color="inherit" component={Link} to="/products">
          Products
        </Button>
        {user ? (
          <>
            <IconButton color="inherit" component={Link} to="/wishlist">
              <Favorite />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/cart">
              <Badge badgeContent={cart?.items.length || 0} color="secondary">
                <ShoppingCart />
              </Badge>
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout ({user.name})
            </Button>
            {user.role === "admin" && (
              <Button color="inherit" component={Link} to="/admin">
                Admin
              </Button>
            )}
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

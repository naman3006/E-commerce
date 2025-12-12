import { Container, Typography, Paper, Grid } from '@mui/material'
import { useGetProfileQuery } from '../../redux/api/ecommerceApi'

export const Dashboard = () => {
  const { data: profile } = useGetProfileQuery()

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">1,234</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Orders</Typography>
            <Typography variant="h4">567</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Revenue</Typography>
            <Typography variant="h4">₹12,345</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
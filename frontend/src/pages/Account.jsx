import { Outlet } from 'react-router-dom'
import { Container, Typography, Tabs, Tab } from '@mui/material'

export const Account = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>My Account</Typography>
      <Tabs value={0} centered>
        <Tab label="Profile" />
        <Tab label="Orders" />
        <Tab label="Addresses" />
      </Tabs>
      <Outlet />
    </Container>
  )
}
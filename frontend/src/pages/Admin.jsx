import { Container, Tabs, Tab } from '@mui/material'
import { Dashboard } from '../components/admin/Dashboard'
import { ProductsGrid } from '../components/admin/ProductsGrid'
import { OrdersGrid } from '../components/admin/OrdersGrid'
import React from 'react'

export const Admin = () => {
  const [tab, setTab] = React.useState(0)

  return (
    <Container sx={{ py: 4 }}>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered>
        <Tab label="Dashboard" />
        <Tab label="Products" />
        <Tab label="Orders" />
      </Tabs>
      {tab === 0 && <Dashboard />}
      {tab === 1 && <ProductsGrid />}
      {tab === 2 && <OrdersGrid />}
    </Container>
  )
}
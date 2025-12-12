import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useGetProductsQuery } from '../../redux/api/ecommerceApi'
import { useCreateProductMutation } from '../../redux/api/ecommerceApi'

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'price', headerName: 'Price', width: 110 },
  { field: 'stock', headerName: 'Stock', width: 110 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    renderCell: (params) => (
      <Button variant="outlined" size="small">Edit</Button>
    ),
  },
]

export const ProductsGrid = () => {
  const { data } = useGetProductsQuery({ limit: 100 })
  const [createProduct] = useCreateProductMutation()

  const rows = data || []

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </div>
  )
}
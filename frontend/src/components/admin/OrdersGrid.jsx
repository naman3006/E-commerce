import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useGetMyOrdersQuery } from "../../redux/api/ecommerceApi";
import { useUpdateOrderStatusMutation } from "../../redux/api/ecommerceApi";

const columns = [
  { field: "id", headerName: "Order ID", width: 130 },
  { field: "totalAmount", headerName: "Amount", width: 110 },
  { field: "orderStatus", headerName: "Status", width: 130, editable: true },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    renderCell: (params) => (
      <Button variant="outlined" size="small">
        Update Status
      </Button>
    ),
  },
];

export const OrdersGrid = () => {
  const { data } = useGetMyOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();

  const rows = data || [];

  const handleStatusChange = async (params) => {
    try {
      await updateStatus({ id: params.id, orderStatus: params.value }).unwrap();
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        editMode="row"
        onCellEditCommit={handleStatusChange}
        checkboxSelection
      />
    </div>
  );
};

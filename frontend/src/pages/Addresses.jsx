// src/pages/Addresses.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { findMyAddresses, createAddress, updateAddress, removeAddress } from '../store/slices/addressSlice';
import AddressCard from '../components/AddressCard/AddressCard';
import { toast } from 'react-toastify';

const Addresses = () => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.address);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: '' });

  useEffect(() => {
    dispatch(findMyAddresses());
  }, [dispatch]);

  const handleAddAddress = () => {
    // Client-side validation to match backend DTO
    const required = ['fullName', 'phone', 'addressLine', 'city', 'state', 'postalCode', 'country'];
    const missing = required.filter((k) => !newAddress[k] || String(newAddress[k]).trim() === '');
    if (missing.length > 0) {
      const labels = {
        fullName: 'Full name',
        phone: 'Phone',
        addressLine: 'Address',
        city: 'City',
        state: 'State',
        postalCode: 'Postal Code',
        country: 'Country',
      };
      const names = missing.map((m) => labels[m] || m).join(', ');
      toast.error(`Please fill required fields: ${names}`);
      return;
    }

    dispatch(createAddress(newAddress));
    setNewAddress({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
      
      {/* Add New Address Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={newAddress.fullName || ""}
            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Phone"
            value={newAddress.phone || ""}
            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Street / Address"
            value={newAddress.addressLine || ""}
            onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="City"
            value={newAddress.city || ""}
            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Postal Code / ZIP"
            value={newAddress.postalCode || ""}
            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="State / Province"
            value={newAddress.state || ""}
            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Country"
            value={newAddress.country || ""}
            onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAddAddress}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Address
        </button>
      </div>

      {/* Addresses List */}
      <div className="space-y-4">
        {(addresses || []).map((address) => {
          const addrId = address._id || address.id;
          return (
            <AddressCard
              key={addrId}
              address={address}
              onUpdate={(updateData) => dispatch(updateAddress({ id: addrId, updateData }))}
              onRemove={() => dispatch(removeAddress(addrId))}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Addresses;
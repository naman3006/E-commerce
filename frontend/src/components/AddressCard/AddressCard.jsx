// src/components/AddressCard/AddressCard.js
import React, { useState } from 'react';

const AddressCard = ({ address, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(address);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editData.street}
            onChange={(e) => setEditData({ ...editData, street: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={editData.city}
            onChange={(e) => setEditData({ ...editData, city: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={editData.zipCode}
            onChange={(e) => setEditData({ ...editData, zipCode: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={editData.country}
            onChange={(e) => setEditData({ ...editData, country: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-2">
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-semibold">{address.street}</p>
          <p>{address.city}, {address.zipCode}</p>
          <p>{address.country}</p>
          <div className="absolute top-4 right-4 space-x-2">
            <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700">Edit</button>
            <button onClick={onRemove} className="text-red-500 hover:text-red-700">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
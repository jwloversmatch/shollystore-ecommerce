import { MapPin, Plus, Home, Briefcase, Check, Edit3, Trash2 } from "lucide-react";
import type { IAddress } from "../../types/account";

interface SavedAddressesCardProps {
  addresses: IAddress[];
  onAdd: () => void;
  onEdit: (addr: IAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const SavedAddressesCard = ({
  addresses,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: SavedAddressesCardProps) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-leaf-green" />
        Saved Addresses
      </h3>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 text-sm font-medium text-leaf-green hover:underline"
      >
        <Plus className="w-4 h-4" />
        Add Address
      </button>
    </div>

    {addresses.length === 0 ? (
      <p className="text-sm text-gray-500">No saved addresses yet.</p>
    ) : (
      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {addr.label === "Home" ? (
                  <Home className="w-4 h-4 text-leaf-green" />
                ) : (
                  <Briefcase className="w-4 h-4 text-leaf-green" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-800">
                    {addr.label}
                  </p>
                  {addr.isDefault && (
                    <span className="text-xs bg-leaf-green/10 text-leaf-green px-1.5 py-0.5 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {addr.address}, {addr.city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!addr.isDefault && (
                <button
                  onClick={() => onSetDefault(addr._id)}
                  className="p-1.5 text-gray-400 hover:text-leaf-green transition rounded-lg hover:bg-leaf-green/10"
                  title="Set as default"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(addr)}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(addr._id)}
                className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default SavedAddressesCard;
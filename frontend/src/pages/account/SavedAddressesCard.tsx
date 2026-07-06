import { MapPin, Plus, Home, Briefcase, Check, Edit3, Trash2 } from "lucide-react";
import type { IAddress } from "../../types/account";

interface SavedAddressesCardProps {
  addresses: IAddress[];
  onAdd: () => void;
  onEdit: (addr: IAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const ACCENT = "#e8622a";

const SavedAddressesCard = ({
  addresses,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: SavedAddressesCardProps) => (
  <div className="rounded-2xl shadow-sm border p-6 sm:p-8"
    style={{ background: "#141414", borderColor: "rgba(255,255,255,0.07)" }}
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <MapPin className="w-5 h-5" style={{ color: ACCENT }} />
        Saved Addresses
      </h3>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 text-sm font-medium hover:underline"
        style={{ color: ACCENT }}
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
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{ background: "#1c1c1c", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {addr.label === "Home" ? (
                  <Home className="w-4 h-4" style={{ color: ACCENT }} />
                ) : (
                  <Briefcase className="w-4 h-4" style={{ color: ACCENT }} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-300">
                    {addr.label}
                  </p>
                  {addr.isDefault && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: `${ACCENT}20`, color: ACCENT }}
                    >
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
                  className="p-1.5 text-gray-500 hover:text-white transition rounded-lg"
                  style={{ color: ACCENT }}
                  title="Set as default"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(addr)}
                className="p-1.5 text-gray-500 hover:text-blue-400 transition rounded-lg hover:bg-white/5"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(addr._id)}
                className="p-1.5 text-gray-500 hover:text-red-400 transition rounded-lg hover:bg-white/5"
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
"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";
import { trpc } from "../app/utils/trpc";
import { useAuth } from "../context/AuthProvider";
import { useToast } from "../context/ToastProvider";
import { useCurrency } from "../context/CurrencyProvider";

interface Address {
  id: number;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  addressType?: string;
}

export default function AddressManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { currency } = useCurrency();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [activeCountries, setActiveCountries] = useState<{ id: number; name: string; code: string; isActive: boolean }[]>([]);
  const [states, setStates] = useState<{ id: number; name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    addressType: "both",
    isDefault: false
  });

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) return;
      const data = await trpc.getAddresses({ userId: user.id });
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await trpc.getCountries({ onlyActive: true });
        setActiveCountries(data);
      } catch (error) {
        console.error("Error fetching active countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Sync country selection with navbar/currency
  useEffect(() => {
    if (!formData.country && currency?.country) {
      setFormData(prev => ({ ...prev, country: currency.country }));
    }
  }, [currency, formData.country]);

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!formData.country) {
        setStates([]);
        return;
      }

      const countryObj = activeCountries.find(
        c => c.name.toLowerCase() === formData.country.toLowerCase()
      ) || (formData.country.toLowerCase() === currency.country.toLowerCase() ? { code: currency.countryCode } : null);

      if (!countryObj) {
        setStates([]);
        return;
      }

      try {
        setIsLoadingStates(true);
        const data = await trpc.getStatesOfCountry({ countryCode: countryObj.code });
        setStates(data);
      } catch (error) {
        console.error("Error fetching states:", error);
        setStates([]);
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStates();
  }, [formData.country, activeCountries, currency]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.country || !formData.state || states.length === 0) {
        setCities([]);
        return;
      }

      const countryObj = activeCountries.find(
        c => c.name.toLowerCase() === formData.country.toLowerCase()
      ) || (formData.country.toLowerCase() === currency.country.toLowerCase() ? { code: currency.countryCode } : null);

      const stateObj = states.find(
        s => s.name.toLowerCase() === formData.state.toLowerCase()
      );

      if (!countryObj || !stateObj) {
        setCities([]);
        return;
      }

      try {
        setIsLoadingCities(true);
        const data = await trpc.getCitiesOfState({
          countryCode: countryObj.code,
          stateCode: stateObj.iso2
        });
        setCities(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [formData.state, states, formData.country, activeCountries, currency]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingAddress) {
        await trpc.updateAddress({
          id: editingAddress.id,
          userId: user.id,
          ...formData
        });
      } else {
        await trpc.addAddress({
          userId: user.id,
          ...formData
        });
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: currency.country || "",
        phone: "",
        addressType: "both",
        isDefault: false
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("Failed to save address", "error");
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || "",
      addressType: address.addressType || "both",
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await trpc.deleteAddress({ id, userId: user.id });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast("Failed to delete address", "error");
    }
  };

  const handleSetDefault = async (id: number) => {
    if (!user) return;
    
    // First, set all addresses to non-default
    for (const address of addresses) {
      if (address.isDefault) {
        try {
          await trpc.updateAddress({
            id: address.id,
            userId: user.id,
            isDefault: false
          });
        } catch (error) {
          console.error("Error updating address:", error);
        }
      }
    }

    // Then set the selected address as default
    try {
      await trpc.updateAddress({
        id,
        userId: user.id,
        isDefault: true
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  if (isLoading) {
    return <div className="text-color-1">Loading addresses...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-color-1">Addresses</h3>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(!showForm);
            setFormData({
              fullName: "",
              addressLine1: "",
              addressLine2: "",
              city: "",
              state: "",
              postalCode: "",
              country: currency.country || "",
              phone: "",
              addressType: "both",
              isDefault: false
            });
          }}
          className="flex items-center gap-2 bg-color-1 text-color-4 px-4 py-2 hover:bg-color-4 hover:text-color-1 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-color-4 p-6">
          <h3 className="text-lg font-semibold text-color-1 mb-4">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-color-1 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-color-1 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-color-1 mb-2">Address Line 1 *</label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-color-1 mb-2">Address Line 2</label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-color-1 mb-2">Country *</label>
              <select
                value={formData.country}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    country: e.target.value,
                    state: "",
                    city: ""
                  });
                }}
                className="w-full p-2.5 border border-color-1 text-color-1 bg-color-4 focus:outline-none"
                required
              >
                {activeCountries.filter(
                  c => c.code.toLowerCase() === currency.countryCode.toLowerCase()
                ).length > 0 ? (
                  activeCountries
                    .filter(c => c.code.toLowerCase() === currency.countryCode.toLowerCase())
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                ) : (
                  <option value={currency.country}>{currency.country}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-color-1 mb-2">State *</label>
              {isLoadingStates ? (
                <div className="w-full p-2.5 border border-color-1 text-color-1 bg-color-4 text-sm">Loading...</div>
              ) : states.length > 0 ? (
                <select
                  value={formData.state}
                  onChange={(e) => {
                    setFormData({ ...formData, state: e.target.value, city: "" });
                  }}
                  className="w-full p-2.5 border border-color-1 text-color-1 bg-color-4 focus:outline-none"
                  required
                >
                  <option value="" disabled>Select State</option>
                  {formData.state && !states.some(s => s.name.toLowerCase() === formData.state.toLowerCase()) && (
                    <option value={formData.state}>{formData.state}</option>
                  )}
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
                  placeholder="Enter state"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-color-1 mb-2">City *</label>
              {isLoadingCities ? (
                <div className="w-full p-2.5 border border-color-1 text-color-1 bg-color-4 text-sm">Loading...</div>
              ) : cities.length > 0 ? (
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 border border-color-1 text-color-1 bg-color-4 focus:outline-none"
                  required
                >
                  <option value="" disabled>Select City</option>
                  {formData.city && !cities.some(c => c.name.toLowerCase() === formData.city.toLowerCase()) && (
                    <option value={formData.city}>{formData.city}</option>
                  )}
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
                  placeholder="Enter city"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-color-1 mb-2">Postal Code *</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-color-1 mb-2">Address Type</label>
            <select
              value={formData.addressType}
              onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
              className="w-full p-2 border border-color-1 text-color-1 focus:outline-none"
            >
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-color-1">Set as default address</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-color-1 text-color-4 px-6 py-2 hover:bg-color-4 hover:text-color-1 transition-colors"
            >
              {editingAddress ? "Update Address" : "Add Address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
              className="bg-color-5 text-color-1 px-6 py-2 hover:bg-color-4 hover:text-color-1 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-8 text-color-1">
          No addresses saved. Add your first address!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={`bg-color-4 p-4 border ${address.isDefault ? 'border-color-2' : 'border-color-1'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-color-1" />
                  {address.isDefault && (
                    <span className="text-xs bg-color-2 text-color-1 px-2 py-1 rounded">Default</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-color-1 hover:text-accent transition-colors duration-200"
                    aria-label="Edit address"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-color-1 hover:text-error transition-colors duration-200"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="font-semibold text-color-1">{address.fullName}</p>
              <p className="text-color-1">{address.addressLine1}</p>
              {address.addressLine2 && <p className="text-color-1">{address.addressLine2}</p>}
              <p className="text-color-1">{address.city}, {address.state} {address.postalCode}</p>
              <p className="text-color-1">{address.country}</p>
              {address.phone && <p className="text-color-1">{address.phone}</p>}
              
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-3 flex items-center gap-1 text-sm text-color-1 hover:text-accent transition-colors duration-200"
                >
                  <Check className="h-4 w-4" />
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

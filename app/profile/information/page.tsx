"use client";

import { useState, useRef } from "react";
import AccountLayout from "../../../components/AccountLayout";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import { Settings } from "lucide-react";
import Image from "next/image";
import { getInitials } from "../../../app/utils/image";

export default function ProfileInformationPage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "warning");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64String = event.target?.result as string;
          if (!base64String) {
            throw new Error("Failed to convert image to base64");
          }
          await updateProfile({ avatar: base64String });
          setIsUploading(false);
          showToast("Image uploaded successfully!", "success");
        } catch (error) {
          console.error("Error in file reader callback:", error);
          showToast("Failed to process image", "error");
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        showToast("Failed to read file", "error");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image upload failed:", error);
      showToast("Failed to upload image", "error");
      setIsUploading(false);
    }
  };

  const getAvatarSrc = (avatar: string | undefined) => {
    if (!avatar) return undefined;
    return avatar;
  };

  return (
    <AccountLayout activeTab="profile">
      <div className="bg-surface p-6 border border-light">
        <h3 className="text-xl font-semibold text-primary mb-6">Profile Information</h3>
        <div className="space-y-6">
          <div className="flex items-center space-x-6 pb-6 border-b border-light">
            <div className="relative w-24 h-24">
              {user.avatar ? (
                <div className="w-full h-full rounded-full overflow-hidden relative border border-light">
                  <Image
                    src={getAvatarSrc(user.avatar) || ""}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-secondary text-primary rounded-full flex items-center justify-center font-semibold text-2xl border border-dark select-none">
                  {getInitials(user.fullName)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-primary text-inverse p-2 rounded-full hover:bg-primary-light transition-colors disabled:opacity-50 z-10 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">{user.fullName}</h3>
              <p className="text-secondary">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              {isUploading && <p className="text-sm text-muted mt-1">Uploading image...</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-light text-secondary mb-2">Full Name</label>
              <input
                type="text"
                value={user.fullName}
                className="w-full px-4 py-3 border border-dark bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-light text-secondary mb-2">Email Address</label>
              <input
                type="email"
                value={user.email}
                className="w-full px-4 py-3 border border-dark bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-light text-secondary mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-dark bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary text-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button className="px-6 py-3 border border-dark hover:bg-surface-alt transition-colors text-secondary font-light cursor-pointer">
              Cancel
            </button>
            <button className="px-6 py-3 bg-primary text-inverse hover:bg-primary-light transition-colors font-light cursor-pointer">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}

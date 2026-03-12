"use client";

import { useState } from "react";

interface ClubProfileData {
  name: string;
  address: string;
  contactEmail: string;
  logoUrl: string;
}

interface ClubProfileStepProps {
  data: ClubProfileData;
  onChange: (data: ClubProfileData) => void;
  errors: Record<string, string>;
}

export function ClubProfileStep({ data, onChange, errors }: ClubProfileStepProps) {
  const [logoPreview, setLogoPreview] = useState<string>(data.logoUrl || "");

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setLogoPreview(url);
        onChange({ ...data, logoUrl: url });
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#0A2E12]">Club Profile</h2>
        <p className="mt-1 text-sm text-[#3D5A3E]">Basic information about your club.</p>
      </div>

      <div>
        <label htmlFor="club-name" className="mb-1.5 block text-sm font-medium text-[#2D4A30]">
          Club Name <span className="text-red-500">*</span>
        </label>
        <input
          id="club-name"
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-4 py-3 text-[#0A2E12] placeholder-[#3D5A3E] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
          placeholder="e.g., Long Beach Lawn Bowling Club"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="club-address" className="mb-1.5 block text-sm font-medium text-[#2D4A30]">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          id="club-address"
          type="text"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-4 py-3 text-[#0A2E12] placeholder-[#3D5A3E] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
          placeholder="e.g., 1085 E Ocean Blvd, Long Beach, CA"
        />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
      </div>

      <div>
        <label htmlFor="club-email" className="mb-1.5 block text-sm font-medium text-[#2D4A30]">
          Contact Email <span className="text-red-500">*</span>
        </label>
        <input
          id="club-email"
          type="email"
          value={data.contactEmail}
          onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
          className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-4 py-3 text-[#0A2E12] placeholder-[#3D5A3E] outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
          placeholder="admin@yourclub.com"
        />
        {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#2D4A30]">
          Club Logo (optional)
        </label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#0A2E12]/10">
              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-[#0A2E12]/10 text-[#3D5A3E]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          )}
          <label className="cursor-pointer rounded-lg border border-[#0A2E12]/10 bg-white px-4 py-2 text-sm font-medium text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03] transition-colors min-h-[44px] flex items-center">
            Upload Logo
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

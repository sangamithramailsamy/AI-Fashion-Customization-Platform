import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Tag,
} from "lucide-react";

import apiClient from "@/services/apiClient";
import { useToast } from "@/context/ToastContext";

type Coupon = {
  id: number;
  code: string;
  description: string;
  discount_type: "PERCENTAGE" | "FLAT";
  discount_value: number | string;
  minimum_order_amount: number | string;
  maximum_discount_amount: number | string | null;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CouponForm = {
  code: string;
  description: string;
  discount_type: "PERCENTAGE" | "FLAT";
  discount_value: string;
  minimum_order_amount: string;
  maximum_discount_amount: string;
  usage_limit: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
};

const emptyForm: CouponForm = {
  code: "",
  description: "",
  discount_type: "PERCENTAGE",
  discount_value: "",
  minimum_order_amount: "0",
  maximum_discount_amount: "",
  usage_limit: "1",
  valid_from: "",
  valid_until: "",
  is_active: true,
};

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function CouponManagementPage() {
  const { notify } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadCoupons() {
    try {
      setLoading(true);

      const response = await apiClient.get(
        "/discounts/coupons/"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results ?? [];

      setCoupons(data);
    } catch (error) {
      console.error("Unable to load coupons:", error);
      notify("Unable to load coupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function openCreateModal() {
    setEditingCoupon(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(coupon: Coupon) {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code,
      description: coupon.description ?? "",
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      minimum_order_amount: String(
        coupon.minimum_order_amount ?? 0
      ),
      maximum_discount_amount:
        coupon.maximum_discount_amount !== null &&
        coupon.maximum_discount_amount !== undefined
          ? String(coupon.maximum_discount_amount)
          : "",
      usage_limit: String(coupon.usage_limit),
      valid_from: coupon.valid_from
        ? coupon.valid_from.slice(0, 16)
        : "",
      valid_until: coupon.valid_until
        ? coupon.valid_until.slice(0, 16)
        : "",
      is_active: coupon.is_active,
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingCoupon(null);
    setForm(emptyForm);
  }

  function updateField<K extends keyof CouponForm>(
    field: K,
    value: CouponForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!form.code.trim()) {
      notify("Please enter a coupon code.");
      return;
    }

    if (!form.discount_value) {
      notify("Please enter a discount value.");
      return;
    }

    if (!form.valid_from || !form.valid_until) {
      notify("Please select the coupon validity dates.");
      return;
    }

    if (
      new Date(form.valid_until) <=
      new Date(form.valid_from)
    ) {
      notify("Valid until must be after valid from.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),

        discount_type: form.discount_type,

        discount_value: Number(
          form.discount_value
        ),

        minimum_order_amount: Number(
          form.minimum_order_amount || 0
        ),

        maximum_discount_amount:
          form.maximum_discount_amount
            ? Number(form.maximum_discount_amount)
            : null,

        usage_limit: Number(
          form.usage_limit || 1
        ),

        valid_from: new Date(
          form.valid_from
        ).toISOString(),

        valid_until: new Date(
          form.valid_until
        ).toISOString(),

        is_active: form.is_active,
      };

      if (editingCoupon) {
        await apiClient.put(
          `/discounts/coupons/${editingCoupon.id}/`,
          payload
        );

        notify("Coupon updated successfully.");
      } else {
        await apiClient.post(
          "/discounts/coupons/",
          payload
        );

        notify("Coupon created successfully.");
      }

      closeModal();
      await loadCoupons();
    } catch (error: any) {
      console.error(
        "Unable to save coupon:",
        error
      );

      const message =
        error.response?.data?.detail ??
        error.response?.data?.message ??
        "Unable to save coupon.";

      notify(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}"?`
    );

    if (!confirmed) return;

    try {
      await apiClient.delete(
        `/discounts/coupons/${coupon.id}/`
      );

      notify("Coupon deleted successfully.");

      await loadCoupons();
    } catch (error) {
      console.error(
        "Unable to delete coupon:",
        error
      );

      notify("Unable to delete coupon.");
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      await apiClient.patch(
        `/discounts/coupons/${coupon.id}/`,
        {
          is_active: !coupon.is_active,
        }
      );

      notify(
        coupon.is_active
          ? "Coupon deactivated."
          : "Coupon activated."
      );

      await loadCoupons();
    } catch (error) {
      console.error(
        "Unable to update coupon status:",
        error
      );

      notify("Unable to update coupon status.");
    }
  }

  return (
    <div className="min-h-screen bg-token px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">
              Promotions
            </p>

            <h1 className="mt-2 text-3xl font-serif">
              Coupon Management
            </h1>

            <p className="mt-2 text-sm text-muted">
              Create and manage discount coupons for customers.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-white"
          >
            <Plus size={18} />
            Add Coupon
          </button>
        </div>

        {/* Coupon list */}
        <div className="overflow-hidden border border-token bg-surface">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted">
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Tag
                size={32}
                className="mx-auto mb-3 text-muted"
              />

              <p className="font-medium">
                No coupons yet
              </p>

              <p className="mt-1 text-sm text-muted">
                Create your first coupon for customers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-token bg-surface">
                    <th className="px-5 py-4 text-left font-medium">
                      Coupon
                    </th>

                    <th className="px-5 py-4 text-left font-medium">
                      Discount
                    </th>

                    <th className="px-5 py-4 text-left font-medium">
                      Minimum Order
                    </th>

                    <th className="px-5 py-4 text-left font-medium">
                      Usage
                    </th>

                    <th className="px-5 py-4 text-left font-medium">
                      Validity
                    </th>

                    <th className="px-5 py-4 text-left font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-token last:border-0"
                    >
                      <td className="px-5 py-5">
                        <div className="font-semibold tracking-wide">
                          {coupon.code}
                        </div>

                        {coupon.description && (
                          <div className="mt-1 max-w-xs text-xs text-muted">
                            {coupon.description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {coupon.discount_type ===
                        "PERCENTAGE"
                          ? `${coupon.discount_value}%`
                          : `₹${coupon.discount_value}`}
                      </td>

                      <td className="px-5 py-5">
                        ₹
                        {Number(
                          coupon.minimum_order_amount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-5">
                        {coupon.used_count} /{" "}
                        {coupon.usage_limit}
                      </td>

                      <td className="px-5 py-5 text-xs">
                        <div>
                          {formatDate(
                            coupon.valid_from
                          )}
                        </div>

                        <div className="mt-1 text-muted">
                          to{" "}
                          {formatDate(
                            coupon.valid_until
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            toggleActive(coupon)
                          }
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                            coupon.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {coupon.is_active ? (
                            <>
                              <Check size={13} />
                              Active
                            </>
                          ) : (
                            "Inactive"
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(coupon)
                            }
                            className="mt-[-2px] p-1 text-token hover:text-primary"
                            title="Edit coupon"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(coupon)
                            }
                            className="p-2 text-red-500 hover:text-red-700"
                            title="Delete coupon"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-[460px] flex-col overflow-hidden border border-token bg-token shadow-2xl">

            <div className="flex shrink-0 items-start justify-between border-b border-token px-5 py-4">
              <div>
                <h2 className="font-display text-2xl text-token">
                  {editingCoupon
                    ? "Edit Coupon"
                    : "Create Coupon"}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Configure the discount customers can use at checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 overflow-y-auto p-5"
            >
              {/* Code */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Coupon Code
                </label>

                <input
                  value={form.code}
                  onChange={(e) =>
                    updateField(
                      "code",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="WELCOME10"
                  className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="10% off on orders above ₹1,000"
                  rows={3}
                  className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                />
              </div>

              {/* Discount */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Discount Type
                  </label>

                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      updateField(
                        "discount_type",
                        e.target.value as
                          | "PERCENTAGE"
                          | "FLAT"
                      )
                    }
                    className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                  >
                    <option value="PERCENTAGE">
                      Percentage
                    </option>

                    <option value="FLAT">
                      Flat Amount
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Discount Value
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) =>
                      updateField(
                        "discount_value",
                        e.target.value
                      )
                    }
                    placeholder={
                      form.discount_type ===
                      "PERCENTAGE"
                        ? "10"
                        : "500"
                    }
                    className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Minimum / Maximum */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Minimum Order Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.minimum_order_amount
                    }
                    onChange={(e) =>
                      updateField(
                        "minimum_order_amount",
                        e.target.value
                      )
                    }
                    className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Maximum Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.maximum_discount_amount
                    }
                    onChange={(e) =>
                      updateField(
                        "maximum_discount_amount",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Usage */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Usage Limit
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.usage_limit}
                  onChange={(e) =>
                    updateField(
                      "usage_limit",
                      e.target.value
                    )
                  }
                  className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                />
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Valid From
                  </label>

                  <input
                    type="datetime-local"
                    value={form.valid_from}
                    onChange={(e) =>
                      updateField(
                        "valid_from",
                        e.target.value
                      )
                    }
                    className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Valid Until
                  </label>

                  <input
                    type="datetime-local"
                    value={form.valid_until}
                    onChange={(e) =>
                      updateField(
                        "valid_until",
                        e.target.value
                      )
                    }
                    className="w-full border border-token bg-surface px-3 py-2.5 text-token outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    updateField(
                      "is_active",
                      e.target.checked
                    )
                  }
                />

                <span className="text-sm">
                  Coupon is active
                </span>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-token pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="border border-token px-5 py-2.5 text-sm text-token hover:border-primary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
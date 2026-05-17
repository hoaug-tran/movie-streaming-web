"use client";

import { Typography } from "@mui/material";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import AdminFormDrawer from "@/modules/admin/components/AdminFormDrawer";
import { AdminSubscriptionPlan, adminService } from "@/modules/admin/api";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function AdminSubscriptionsPage() {
  return (
    <AdminManagementPage<AdminSubscriptionPlan>
      permission="subscriptions:manage"
      title="Quản lý gói thuê bao"
      description="Theo dõi cấu hình gói premium đang công bố từ backend subscriptions."
      queryKey={["admin", "subscriptions"]}
      queryFn={adminService.getSubscriptionPlans}
      searchPlaceholder="Tìm gói, giá, mô tả..."
      getSearchText={(plan) =>
        `${plan.name} ${plan.code ?? ""} ${plan.description ?? ""} ${plan.price ?? ""}`
      }
      extraFilters={[
        {
          key: "isActive",
          label: "Trạng thái",
          options: [
            { label: "Đang bật", value: "true" },
            { label: "Tạm tắt", value: "false" },
          ],
          getValue: (plan) => String(plan.isActive !== false),
        },
        {
          key: "videoQuality",
          label: "Chất lượng",
          options: [
            { label: "HD", value: "HD" },
            { label: "Full HD", value: "FULL_HD" },
            { label: "4K", value: "4K" },
          ],
          getValue: (plan) => plan.videoQuality ?? "",
        },
      ]}
      stats={[
        { label: "Gói", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Đang bật",
          getValue: (items) => items.filter((item) => item.isActive !== false).length,
          tone: "emerald",
        },
        {
          label: "Tạm tắt",
          getValue: (items) => items.filter((item) => item.isActive === false).length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Gói",
          render: (plan) => <Typography fontWeight={800}>{plan.name}</Typography>,
        },
        {
          key: "price",
          label: "Giá",
          render: (plan) => (
            <AdminStatusChip label={money.format(Number(plan.price ?? 0))} tone="violet" />
          ),
        },
        {
          key: "duration",
          label: "Chu kỳ",
          render: (plan) => (
            <Typography color="text.secondary">{plan.durationDays ?? 30} ngày</Typography>
          ),
        },
        {
          key: "devices",
          label: "Thiết bị",
          render: (plan) => (
            <Typography color="text.secondary">{plan.maxDevices ?? 1} thiết bị</Typography>
          ),
        },
        {
          key: "quality",
          label: "Chất lượng",
          render: (plan) => <AdminStatusChip label={plan.videoQuality ?? "HD"} tone="cyan" />,
        },
        {
          key: "status",
          label: "Trạng thái",
          render: (plan) => (
            <AdminStatusChip
              label={plan.isActive === false ? "Tạm tắt" : "Đang bật"}
              tone={plan.isActive === false ? "amber" : "emerald"}
            />
          ),
        },
      ]}
      createLabel="Tạo gói thuê bao"
      onCreate={(payload) => adminService.createSubscriptionPlan(payload)}
      onEdit={(plan, payload) => adminService.updateSubscriptionPlan(plan.id, payload)}
      onDelete={(plan) => adminService.deleteSubscriptionPlan(plan.id)}
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer
          open={open}
          mode={mode}
          title={mode === "create" ? "Tạo gói mới" : `Sửa gói ${item?.name}`}
          description="Thiết lập tên gói, giá tiền và chu kỳ thanh toán."
          fields={[
            { name: "name", label: "Tên gói", required: true },
            { name: "code", label: "Mã gói", required: true },
            { name: "description", label: "Mô tả", type: "textarea" },
            { name: "price", label: "Giá (VNĐ)", type: "number", required: true },
            { name: "durationDays", label: "Chu kỳ (Ngày)", type: "number", required: true },
            { name: "maxDevices", label: "Số thiết bị tối đa", type: "number", required: true },
            {
              name: "videoQuality",
              label: "Chất lượng video",
              type: "select",
              options: [
                { label: "HD", value: "HD" },
                { label: "Full HD", value: "FULL_HD" },
                { label: "4K", value: "4K" },
              ],
            },
            {
              name: "hasAdsFree",
              label: "Quảng cáo",
              type: "select",
              options: [
                { label: "Không quảng cáo", value: true },
                { label: "Có quảng cáo", value: false },
              ],
            },
            {
              name: "isActive",
              label: "Trạng thái",
              type: "select",
              options: [
                { label: "Đang bật", value: true },
                { label: "Tạm tắt", value: false },
              ],
            },
          ]}
          initialValues={{
            name: item?.name ?? "",
            code: item?.code ?? "",
            description: item?.description ?? "",
            price: item?.price ?? 0,
            durationDays: item?.durationDays ?? 30,
            maxDevices: item?.maxDevices ?? 1,
            videoQuality: item?.videoQuality ?? "HD",
            hasAdsFree: item?.hasAdsFree ?? false,
            isActive: item?.isActive ?? true,
          }}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}

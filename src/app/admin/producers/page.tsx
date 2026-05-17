"use client";

import { Avatar, Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminStudio, AdminStudioPayload, adminService } from "@/modules/admin/api";

type StudioFormValues = AdminStudioPayload & Record<string, unknown>;

const fields: AdminFormField<StudioFormValues>[] = [
  { name: "name", label: "Tên đơn vị", required: true, maxLength: 255 },
  { name: "slug", label: "Slug", required: true, maxLength: 270 },
  { name: "country", label: "Quốc gia", maxLength: 100 },
  { name: "websiteUrl", label: "Website", maxLength: 2048 },
  {
    name: "logoUrl",
    label: "Logo",
    type: "image",
    imageAspectRatio: "1 / 1",
    helperText: "Khuyến nghị 512×512, nền trong suốt nếu có.",
  },
  { name: "description", label: "Mô tả", type: "textarea", maxLength: 2000 },
];

function toForm(studio?: AdminStudio | null): StudioFormValues {
  return {
    name: studio?.name ?? "",
    slug: studio?.slug ?? "",
    country: studio?.country ?? "",
    websiteUrl: studio?.websiteUrl ?? "",
    logoUrl: studio?.logoUrl ?? "",
    description: studio?.description ?? "",
  };
}

export default function AdminProducersPage() {
  return (
    <AdminManagementPage<AdminStudio>
      permission="studios:manage"
      title="Quản lý đơn vị sản xuất"
      description="Quản lý thông tin nhà sản xuất và studio liên kết với phim."
      queryKey={["admin", "studios"]}
      queryFn={adminService.getStudios}
      searchPlaceholder="Tìm studio, slug, quốc gia..."
      getSearchText={(studio) => `${studio.name} ${studio.slug ?? ""} ${studio.country ?? ""}`}
      stats={[
        { label: "Studio", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Có logo",
          getValue: (items) => items.filter((item) => item.logoUrl).length,
          tone: "emerald",
        },
        {
          label: "Thiếu website",
          getValue: (items) => items.filter((item) => !item.websiteUrl).length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "studio",
          label: "Đơn vị",
          render: (studio) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={studio.logoUrl ?? undefined}>{studio.name.charAt(0)}</Avatar>
              <Stack>
                <Typography fontWeight={800}>{studio.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {studio.slug}
                </Typography>
              </Stack>
            </Stack>
          ),
        },
        {
          key: "country",
          label: "Quốc gia",
          render: (studio) => <AdminStatusChip label={studio.country || "Chưa rõ"} tone="violet" />,
        },
        {
          key: "website",
          label: "Website",
          render: (studio) => (
            <Typography color="text.secondary">{studio.websiteUrl || "Chưa có"}</Typography>
          ),
        },
      ]}
      quickActions={[
        {
          id: "delete",
          label: "Xóa",
          tone: "rose",
          run: (studio) => adminService.deleteStudio(studio.id),
        },
      ]}
      createLabel="Thêm đơn vị"
      onCreate={(payload) => adminService.createStudio(payload as AdminStudioPayload)}
      onEdit={(studio, payload) =>
        adminService.updateStudio(studio.id, payload as AdminStudioPayload)
      }
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<StudioFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm đơn vị sản xuất" : `Sửa ${item?.name ?? "đơn vị"}`}
          description="Nhập thông tin nhà sản xuất hoặc studio."
          fields={fields}
          initialValues={toForm(item)}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}

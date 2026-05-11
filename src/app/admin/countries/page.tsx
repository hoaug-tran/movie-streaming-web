"use client";

import { Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminTag, AdminTagPayload, adminService } from "@/modules/admin/api";

type TagFormValues = AdminTagPayload & Record<string, unknown>;

const fields: AdminFormField<TagFormValues>[] = [
  { name: "name", label: "Tên quốc gia", required: true, maxLength: 120 },
  { name: "slug", label: "Slug", required: true, maxLength: 140 },
  { name: "description", label: "Mô tả", type: "textarea", maxLength: 500 },
];

function toForm(tag?: AdminTag | null): TagFormValues {
  return { name: tag?.name ?? "", slug: tag?.slug ?? "", description: tag?.description ?? "" };
}

export default function AdminCountriesPage() {
  return (
    <AdminManagementPage<AdminTag>
      permission="tags:manage"
      title="Quản lý quốc gia"
      description="Quản lý nhãn quốc gia/vùng sản xuất dùng trong bộ lọc phim."
      queryKey={["admin", "countries"]}
      queryFn={adminService.getTags}
      searchPlaceholder="Tìm quốc gia, slug..."
      getSearchText={(tag) => `${tag.name} ${tag.slug ?? ""} ${tag.description ?? ""}`}
      stats={[
        { label: "Quốc gia", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Có mô tả",
          getValue: (items) => items.filter((item) => item.description).length,
          tone: "emerald",
        },
        {
          label: "Cần bổ sung",
          getValue: (items) => items.filter((item) => !item.description).length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Quốc gia",
          render: (tag) => <Typography fontWeight={800}>{tag.name}</Typography>,
        },
        {
          key: "slug",
          label: "Slug",
          render: (tag) => <AdminStatusChip label={tag.slug || "—"} tone="violet" />,
        },
        {
          key: "description",
          label: "Mô tả",
          render: (tag) => (
            <Typography color="text.secondary">{tag.description || "Chưa có mô tả"}</Typography>
          ),
        },
      ]}
      quickActions={[
        { id: "delete", label: "Xóa", tone: "rose", run: (tag) => adminService.deleteTag(tag.id) },
      ]}
      createLabel="Thêm quốc gia"
      onCreate={(payload) => adminService.createTag(payload as AdminTagPayload)}
      onEdit={(tag, payload) => adminService.updateTag(tag.id, payload as AdminTagPayload)}
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<TagFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm quốc gia" : `Sửa ${item?.name ?? "quốc gia"}`}
          description="Dùng endpoint tags vì backend đang mô hình hóa country dưới dạng taxonomy tag."
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

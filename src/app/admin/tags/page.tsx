"use client";

import { Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminTag, AdminTagPayload, adminService } from "@/modules/admin/api";

type TagFormValues = AdminTagPayload & Record<string, unknown>;

const tagFields: AdminFormField<TagFormValues>[] = [
  { name: "name", label: "Tên thẻ", required: true, maxLength: 100 },
  { name: "slug", label: "Slug", required: true, maxLength: 120 },
  { name: "description", label: "Mô tả", type: "textarea", maxLength: 500 },
];

function toTagForm(tag?: AdminTag | null): TagFormValues {
  return {
    name: tag?.name ?? "",
    slug: tag?.slug ?? "",
    description: tag?.description ?? "",
  };
}

export default function AdminTagsPage() {
  return (
    <AdminManagementPage<AdminTag>
      permission="tags:manage"
      title="Quản lý thẻ nội dung"
      description="Quản trị tag mô tả vibe, chủ đề và nhãn nội dung dùng để gắn vào từng phim."
      queryKey={["admin", "tags"]}
      queryFn={adminService.getTags}
      searchPlaceholder="Tìm thẻ, slug, mô tả..."
      getSearchText={(tag) => `${tag.name} ${tag.slug ?? ""} ${tag.description ?? ""}`}
      stats={[
        { label: "Thẻ", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Có mô tả",
          getValue: (items) => items.filter((item) => item.description).length,
          tone: "emerald",
        },
        {
          label: "Cần rà soát",
          getValue: (items) => items.filter((item) => !item.description).length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Thẻ",
          render: (tag) => (
            <Stack>
              <Typography fontWeight={800}>{tag.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {tag.slug}
              </Typography>
            </Stack>
          ),
        },
        {
          key: "description",
          label: "Mô tả",
          render: (tag) => (
            <Typography color="text.secondary">{tag.description || "Chưa có mô tả"}</Typography>
          ),
        },
        {
          key: "status",
          label: "Trạng thái dữ liệu",
          render: (tag) => (
            <AdminStatusChip
              label={tag.description ? "Đầy đủ" : "Thiếu mô tả"}
              tone={tag.description ? "emerald" : "amber"}
            />
          ),
        },
      ]}
      quickActions={[
        {
          id: "delete",
          label: "Xóa",
          tone: "rose",
          run: (tag) => adminService.deleteTag(tag.id),
        },
      ]}
      createLabel="Thêm thẻ"
      onCreate={(payload) => adminService.createTag(payload as AdminTagPayload)}
      onEdit={(tag, payload) => adminService.updateTag(tag.id, payload as AdminTagPayload)}
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<TagFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm thẻ" : `Sửa ${item?.name ?? "thẻ"}`}
          description="Tag là metadata bổ trợ cho phim, khác với danh mục chính."
          fields={tagFields}
          initialValues={toTagForm(item)}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}

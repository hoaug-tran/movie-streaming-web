"use client";

import { Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminCategory, AdminCategoryPayload, adminService } from "@/modules/admin/api";

type CategoryFormValues = AdminCategoryPayload & Record<string, unknown>;

const categoryFields: AdminFormField<CategoryFormValues>[] = [
  { name: "name", label: "Tên danh mục", required: true, maxLength: 100 },
  { name: "slug", label: "Slug", required: true, maxLength: 120 },
  { name: "description", label: "Mô tả", type: "textarea", maxLength: 500 },
];

function toCategoryForm(category?: AdminCategory | null): CategoryFormValues {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
  };
}

export default function AdminCategoriesPage() {
  return (
    <AdminManagementPage<AdminCategory>
      permission="categories:manage"
      title="Quản lý danh mục"
      description="Chuẩn hóa taxonomy phim, slug SEO và phân loại nội dung toàn nền tảng."
      queryKey={["admin", "categories"]}
      queryFn={adminService.getCategories}
      searchPlaceholder="Tìm danh mục, slug, mô tả..."
      getSearchText={(category) =>
        `${category.name} ${category.slug ?? ""} ${category.description ?? ""}`
      }
      stats={[
        { label: "Danh mục", getValue: (items) => items.length, tone: "cyan" },
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
          label: "Danh mục",
          render: (category) => (
            <Stack>
              <Typography fontWeight={800}>{category.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {category.slug}
              </Typography>
            </Stack>
          ),
        },
        {
          key: "description",
          label: "Mô tả",
          render: (category) => (
            <Typography color="text.secondary">
              {category.description || "Chưa có mô tả"}
            </Typography>
          ),
        },
        {
          key: "created",
          label: "Ngày tạo",
          render: (category) => (
            <AdminStatusChip
              label={
                category.createdAt
                  ? new Date(category.createdAt).toLocaleDateString("vi-VN")
                  : "LOCAL"
              }
              tone="violet"
            />
          ),
        },
      ]}
      quickActions={[
        {
          id: "delete",
          label: "Xóa",
          tone: "rose",
          run: (category) => adminService.deleteCategory(category.id),
        },
      ]}
      createLabel="Thêm danh mục"
      onCreate={(payload) => adminService.createCategory(payload as AdminCategoryPayload)}
      onEdit={(category, payload) =>
        adminService.updateCategory(category.id, payload as AdminCategoryPayload)
      }
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<CategoryFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm danh mục" : `Sửa ${item?.name ?? "danh mục"}`}
          description="Ràng buộc name/slug/mô tả bám sát DTO backend để tránh lỗi @Valid."
          fields={categoryFields}
          initialValues={toCategoryForm(item)}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}

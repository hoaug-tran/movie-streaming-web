"use client";

import { Avatar, Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminPerson, AdminPersonPayload, adminService } from "@/modules/admin/api";

type PersonFormValues = AdminPersonPayload & Record<string, unknown>;

const fields: AdminFormField<PersonFormValues>[] = [
  { name: "fullName", label: "Họ tên", required: true, maxLength: 255 },
  { name: "stageName", label: "Nghệ danh / Tên hiển thị", maxLength: 255 },
  { name: "birthDate", label: "Ngày sinh", type: "datetime" },
  { name: "nationality", label: "Quốc tịch", maxLength: 120 },
  {
    name: "avatarUrl",
    label: "Ảnh đại diện",
    type: "image",
    imageAspectRatio: "1 / 1",
    helperText: "Khuyến nghị 512×512.",
  },
  { name: "biography", label: "Tiểu sử", type: "textarea", maxLength: 2000 },
];

function toForm(person?: AdminPerson | null): PersonFormValues {
  return {
    fullName: person?.fullName ?? "",
    stageName: person?.stageName ?? "",
    birthDate: person?.birthDate ?? "",
    nationality: person?.nationality ?? "",
    avatarUrl: person?.avatarUrl ?? "",
    biography: person?.biography ?? "",
  };
}

export default function AdminPersonsPage() {
  return (
    <AdminManagementPage<AdminPerson>
      permission="persons:manage"
      title="Quản lý người tham gia"
      description="Quản lý hồ sơ diễn viên, đạo diễn và các thành phần sáng tạo. Vai trò được gán khi liên kết với phim tại trang chi tiết phim."
      queryKey={["admin", "persons"]}
      queryFn={adminService.getPersons}
      searchPlaceholder="Tìm tên, nghệ danh, quốc tịch..."
      getSearchText={(person) =>
        `${person.fullName} ${person.stageName ?? ""} ${person.nationality ?? ""}`
      }
      extraFilters={[
        {
          key: "hasBio",
          label: "Tiểu sử",
          options: [
            { label: "Có tiểu sử", value: "true" },
            { label: "Chưa có", value: "false" },
          ],
          getValue: (person) => String(Boolean(person.biography)),
        },
        {
          key: "hasAvatar",
          label: "Ảnh",
          options: [
            { label: "Có ảnh", value: "true" },
            { label: "Chưa có", value: "false" },
          ],
          getValue: (person) => String(Boolean(person.avatarUrl)),
        },
      ]}
      stats={[
        { label: "Hồ sơ", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Có ảnh",
          getValue: (items) => items.filter((item) => item.avatarUrl).length,
          tone: "emerald",
        },
        {
          label: "Thiếu tiểu sử",
          getValue: (items) => items.filter((item) => !item.biography).length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "person",
          label: "Người tham gia",
          render: (person) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={person.avatarUrl ?? undefined}>{person.fullName.charAt(0)}</Avatar>
              <Stack>
                <Typography fontWeight={800}>{person.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {person.stageName || "Chưa có nghệ danh"}
                </Typography>
              </Stack>
            </Stack>
          ),
        },
        {
          key: "nationality",
          label: "Quốc tịch",
          render: (person) => (
            <AdminStatusChip label={person.nationality || "Chưa rõ"} tone="violet" />
          ),
        },
        {
          key: "biography",
          label: "Tiểu sử",
          render: (person) => (
            <Typography color="text.secondary">
              {person.biography
                ? person.biography.length > 80
                  ? person.biography.slice(0, 80) + "..."
                  : person.biography
                : "Chưa có tiểu sử"}
            </Typography>
          ),
        },
      ]}
      quickActions={[
        {
          id: "delete",
          label: "Xóa",
          tone: "rose",
          run: (person) => adminService.deletePerson(person.id),
        },
      ]}
      createLabel="Thêm người tham gia"
      onCreate={(payload) => adminService.createPerson(payload as AdminPersonPayload)}
      onEdit={(person, payload) =>
        adminService.updatePerson(person.id, payload as AdminPersonPayload)
      }
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<PersonFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm người tham gia" : `Sửa ${item?.fullName ?? "hồ sơ"}`}
          description="Nhập thông tin. Vai trò (diễn viên, đạo diễn...) được gán tại trang chi tiết phim."
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

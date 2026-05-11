"use client";

import { Avatar, Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminPerson, AdminPersonPayload, adminService } from "@/modules/admin/api";

type PersonFormValues = AdminPersonPayload & Record<string, unknown>;

const fields: AdminFormField<PersonFormValues>[] = [
  { name: "fullName", label: "Họ tên đạo diễn", required: true, maxLength: 255 },
  { name: "stageName", label: "Tên hiển thị", maxLength: 255 },
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

export default function AdminDirectorsPage() {
  return (
    <AdminManagementPage<AdminPerson>
      permission="persons:manage"
      title="Quản lý đạo diễn"
      description="Quản lý hồ sơ đạo diễn và metadata liên kết phim."
      queryKey={["admin", "directors"]}
      queryFn={adminService.getPersons}
      searchPlaceholder="Tìm đạo diễn, quốc tịch..."
      getSearchText={(person) =>
        `${person.fullName} ${person.stageName ?? ""} ${person.nationality ?? ""}`
      }
      stats={[
        { label: "Đạo diễn", getValue: (items) => items.length, tone: "cyan" },
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
          key: "director",
          label: "Đạo diễn",
          render: (person) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={person.avatarUrl ?? undefined}>{person.fullName.charAt(0)}</Avatar>
              <Stack>
                <Typography fontWeight={800}>{person.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {person.stageName || "Tên thật"}
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
          label: "Hồ sơ",
          render: (person) => (
            <Typography color="text.secondary">{person.biography || "Chưa có hồ sơ"}</Typography>
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
      createLabel="Thêm đạo diễn"
      onCreate={(payload) => adminService.createPerson(payload as AdminPersonPayload)}
      onEdit={(person, payload) =>
        adminService.updatePerson(person.id, payload as AdminPersonPayload)
      }
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<PersonFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm đạo diễn" : `Sửa ${item?.fullName ?? "đạo diễn"}`}
          description="Dữ liệu dùng chung person catalog trong backend."
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

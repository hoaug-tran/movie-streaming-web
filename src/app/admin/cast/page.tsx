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
  { name: "stageName", label: "Nghệ danh", maxLength: 255 },
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

export default function AdminCastPage() {
  return (
    <AdminManagementPage<AdminPerson>
      permission="persons:manage"
      title="Quản lý diễn viên"
      description="Quản lý hồ sơ diễn viên dùng trong dữ liệu phim và SEO cast."
      queryKey={["admin", "cast"]}
      queryFn={adminService.getPersons}
      searchPlaceholder="Tìm diễn viên, nghệ danh, quốc tịch..."
      getSearchText={(person) =>
        `${person.fullName} ${person.stageName ?? ""} ${person.nationality ?? ""}`
      }
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
          label: "Diễn viên",
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
            <Typography color="text.secondary">{person.biography || "Chưa có tiểu sử"}</Typography>
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
      createLabel="Thêm diễn viên"
      onCreate={(payload) => adminService.createPerson(payload as AdminPersonPayload)}
      onEdit={(person, payload) =>
        adminService.updatePerson(person.id, payload as AdminPersonPayload)
      }
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<PersonFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm diễn viên" : `Sửa ${item?.fullName ?? "diễn viên"}`}
          description="Dữ liệu bám CreatePersonRequest/UpdatePersonRequest backend."
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

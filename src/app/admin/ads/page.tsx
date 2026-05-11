"use client";

import { Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminAd, AdminAdPayload, adminService } from "@/modules/admin/api";

type AdFormValues = AdminAdPayload & Record<string, unknown>;

const adFields: AdminFormField<AdFormValues>[] = [
  { name: "title", label: "Tên campaign", required: true, maxLength: 255 },
  { name: "videoUrl", label: "Video URL", required: true, maxLength: 1000 },
  { name: "targetUrl", label: "Target URL", maxLength: 1000 },
  {
    name: "durationSeconds",
    label: "Thời lượng giây",
    type: "number",
    required: true,
    min: 1,
    max: 600,
  },
  {
    name: "adType",
    label: "Loại quảng cáo",
    type: "select",
    required: true,
    options: [
      { label: "Video", value: "VIDEO" },
      { label: "Banner", value: "BANNER" },
      { label: "Interstitial", value: "INTERSTITIAL" },
    ],
  },
  { name: "priority", label: "Ưu tiên", type: "number", required: true, min: 0, max: 100 },
  { name: "isSkippable", label: "Cho phép bỏ qua", type: "switch" },
  { name: "skipAfterSeconds", label: "Bỏ qua sau giây", type: "number", min: 0, max: 600 },
  { name: "isActive", label: "Đang hoạt động", type: "switch" },
  { name: "startAt", label: "Bắt đầu", type: "datetime" },
  { name: "endAt", label: "Kết thúc", type: "datetime" },
];

function toAdForm(ad?: AdminAd | null): AdFormValues {
  return {
    title: ad?.title ?? ad?.name ?? "",
    videoUrl: ad?.videoUrl ?? ad?.mediaUrl ?? "",
    targetUrl: ad?.targetUrl ?? "",
    durationSeconds: ad?.durationSeconds ?? 15,
    adType: ad?.adType ?? "VIDEO",
    priority: ad?.priority ?? 0,
    isSkippable: Boolean(ad?.isSkippable),
    skipAfterSeconds: ad?.skipAfterSeconds ?? 5,
    isActive: ad?.isActive ?? true,
    startAt: ad?.startAt ?? ad?.startDate ?? "",
    endAt: ad?.endAt ?? ad?.endDate ?? "",
  };
}

export default function AdminAdsPage() {
  return (
    <AdminManagementPage<AdminAd>
      permission="ads:manage"
      title="Quản lý quảng cáo"
      description="Theo dõi campaign, placement và trạng thái phân phối quảng cáo an toàn."
      queryKey={["admin", "ads"]}
      queryFn={adminService.getAds}
      searchPlaceholder="Tìm campaign, placement, target URL..."
      getSearchText={(ad) =>
        `${ad.title ?? ad.name ?? ""} ${ad.adType ?? ""} ${ad.placement ?? ""} ${ad.targetUrl ?? ""}`
      }
      getStatus={(ad) => (ad.isActive ? "ACTIVE" : "INACTIVE")}
      stats={[
        { label: "Campaign", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Đang chạy",
          getValue: (items) => items.filter((item) => item.isActive).length,
          tone: "emerald",
        },
        {
          label: "Tạm dừng",
          getValue: (items) => items.filter((item) => !item.isActive).length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "name",
          label: "Campaign",
          render: (ad) => (
            <Stack>
              <Typography fontWeight={800}>{ad.title ?? ad.name ?? `Ad #${ad.id}`}</Typography>
              <Typography variant="caption" color="text.secondary">
                {ad.targetUrl || "Không có target"}
              </Typography>
            </Stack>
          ),
        },
        {
          key: "type",
          label: "Loại",
          render: (ad) => <AdminStatusChip label={ad.adType} tone="violet" />,
        },
        {
          key: "placement",
          label: "Placement",
          render: (ad) => <Typography>{ad.placement || "-"}</Typography>,
        },
        {
          key: "status",
          label: "Trạng thái",
          render: (ad) => (
            <AdminStatusChip
              label={ad.isActive ? "ACTIVE" : "INACTIVE"}
              tone={ad.isActive ? "emerald" : "amber"}
            />
          ),
        },
      ]}
      createLabel="Tạo quảng cáo"
      onCreate={(payload) => adminService.createAd(payload as AdminAdPayload)}
      onEdit={(ad, payload) => adminService.updateAd(ad.id, payload as AdminAdPayload)}
      quickActions={[
        { id: "delete", label: "Xóa", tone: "rose", run: (ad) => adminService.deleteAd(ad.id) },
      ]}
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<AdFormValues>
          open={open}
          mode={mode}
          title={
            mode === "create" ? "Tạo quảng cáo" : `Sửa ${item?.title ?? item?.name ?? "quảng cáo"}`
          }
          description="Form theo CreateAdvertisementRequest; chỉ bật submit khi payload đạt constraint chính."
          fields={adFields}
          initialValues={toAdForm(item)}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}

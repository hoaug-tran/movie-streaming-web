"use client";

import { Stack, Typography } from "@mui/material";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminAd, AdminAdPayload, adminService } from "@/modules/admin/api";

type AdFormValues = AdminAdPayload & Record<string, unknown>;

const AD_TYPE_LABELS: Record<string, string> = {
  PRE_ROLL: "Pre-roll (trước phim)",
  MID_ROLL: "Mid-roll (giữa phim)",
  POST_ROLL: "Post-roll (sau phim)",
  BANNER_POPUP: "Banner Popup",
};

const adFields: AdminFormField<AdFormValues>[] = [
  { name: "title", label: "Tên campaign", required: true, maxLength: 255 },
  { name: "videoUrl", label: "Video quảng cáo", type: "video" as const, required: true },
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
      { label: "Pre-roll (trước phim)", value: "PRE_ROLL" },
      { label: "Mid-roll (giữa phim)", value: "MID_ROLL" },
      { label: "Post-roll (sau phim)", value: "POST_ROLL" },
      { label: "Banner Popup", value: "BANNER_POPUP" },
    ],
  },
  {
    name: "priority",
    label: "Độ ưu tiên",
    type: "number",
    required: true,
    min: 1,
    max: 100,
    helperText:
      "1–100. Số càng cao càng được phát trước. Nếu bằng nhau, quảng cáo mới hơn được ưu tiên.",
  },
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
    adType: ad?.adType ?? "PRE_ROLL",
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
      searchPlaceholder="Tìm campaign, target URL..."
      getSearchText={(ad) =>
        `${ad.title ?? ad.name ?? ""} ${ad.adType ?? ""} ${ad.targetUrl ?? ""}`
      }
      getStatus={(ad) => (ad.isActive ? "ACTIVE" : "INACTIVE")}
      extraFilters={[
        {
          key: "adType",
          label: "Loại",
          options: [
            { label: "Pre-roll", value: "PRE_ROLL" },
            { label: "Mid-roll", value: "MID_ROLL" },
            { label: "Post-roll", value: "POST_ROLL" },
            { label: "Banner Popup", value: "BANNER_POPUP" },
          ],
          getValue: (ad) => ad.adType ?? "",
        },
        {
          key: "skippable",
          label: "Bỏ qua",
          options: [
            { label: "Có thể bỏ", value: "true" },
            { label: "Không bỏ", value: "false" },
          ],
          getValue: (ad) => String(Boolean(ad.isSkippable)),
        },
      ]}
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
          label: "Quảng cáo",
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
          render: (ad) => (
            <AdminStatusChip
              label={AD_TYPE_LABELS[ad.adType ?? ""] ?? ad.adType ?? "-"}
              tone="violet"
            />
          ),
        },
        {
          key: "duration",
          label: "Thời lượng",
          render: (ad) => (
            <Typography>{ad.durationSeconds ? `${ad.durationSeconds}s` : "-"}</Typography>
          ),
        },
        {
          key: "skipAfter",
          label: "Bỏ qua sau",
          render: (ad) => (
            <Typography>
              {ad.isSkippable ? (ad.skipAfterSeconds ? `${ad.skipAfterSeconds}s` : "0s") : "-"}
            </Typography>
          ),
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
          description="Nhập thông tin quảng cáo, thời gian phát và cài đặt hiển thị."
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

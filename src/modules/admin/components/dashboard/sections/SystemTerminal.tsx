import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  alpha,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BentoContainer } from "../BentoContainer";
import { adminService, AdminActivity } from "@/modules/admin/api";

export function SystemTerminal({
  signals,
}: {
  signals: { label: string; value: string; detail: string; status: string }[];
  activities?: AdminActivity[];
  adminActivities?: AdminActivity[];
}) {
  const theme = useTheme();

  const [userLogs, setUserLogs] = useState<AdminActivity[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminActivity[]>([]);

  const [userPage, setUserPage] = useState(0);
  const [adminPage, setAdminPage] = useState(0);

  const [hasMoreUser, setHasMoreUser] = useState(true);
  const [hasMoreAdmin, setHasMoreAdmin] = useState(true);

  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [searchVal, setSearchVal] = useState("");
  const [scopeVal, setScopeVal] = useState("");
  const [severityVal, setSeverityVal] = useState("");
  const [actorNameVal, setActorNameVal] = useState("");
  const [actionVal, setActionVal] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterScope, setFilterScope] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterActorName, setFilterActorName] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const [modalPage, setModalPage] = useState(0);
  const [modalLogs, setModalLogs] = useState<AdminActivity[]>([]);
  const [modalTotalPages, setModalTotalPages] = useState(0);
  const [modalTotalElements, setModalTotalElements] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const getStatusColor = (severity: string) => {
    const s = (severity || "").toUpperCase();
    switch (s) {
      case "SUCCESS":
        return theme.palette.success.main;
      case "WARNING":
        return theme.palette.warning.main;
      case "DANGER":
      case "ERROR":
        return theme.palette.error.main;
      case "INFO":
        return "#1976d2";
      default:
        return theme.palette.primary.main;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      const date = new Date(timeStr);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${hours}:${minutes}:${seconds} ${day}/${month}`;
    } catch {
      return timeStr;
    }
  };

  const loadLogs = useCallback(
    async (scope: "USER" | "ADMIN", pageNum: number, append: boolean) => {
      if (scope === "USER") {
        setIsLoadingUser(true);
        try {
          const res = await adminService.getActivities({
            scope: "USER",
            page: pageNum,
            size: 10,
          });
          setUserLogs((prev) => (append ? [...prev, ...res.content] : res.content));
          setUserPage(pageNum);
          setHasMoreUser(res.hasNext);
        } catch (err) {
        } finally {
          setIsLoadingUser(false);
        }
      } else {
        setIsLoadingAdmin(true);
        try {
          const res = await adminService.getActivities({
            scope: "ADMIN",
            page: pageNum,
            size: 10,
          });
          setAdminLogs((prev) => (append ? [...prev, ...res.content] : res.content));
          setAdminPage(pageNum);
          setHasMoreAdmin(res.hasNext);
        } catch (err) {
        } finally {
          setIsLoadingAdmin(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadLogs("USER", 0, false);
    loadLogs("ADMIN", 0, false);
  }, [loadLogs]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, scope: "USER" | "ADMIN") => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 30) {
      if (scope === "USER" && !isLoadingUser && hasMoreUser) {
        loadLogs("USER", userPage + 1, true);
      } else if (scope === "ADMIN" && !isLoadingAdmin && hasMoreAdmin) {
        loadLogs("ADMIN", adminPage + 1, true);
      }
    }
  };

  const loadModalLogs = useCallback(
    async (pageNum: number) => {
      setIsModalLoading(true);
      try {
        const res = await adminService.getActivities({
          scope: filterScope || undefined,
          severity: filterSeverity || undefined,
          actorName: filterActorName || undefined,
          action: filterAction || undefined,
          search: searchQuery || undefined,
          page: pageNum,
          size: 10,
        });
        setModalLogs(res.content);
        setModalPage(pageNum);
        setModalTotalPages(res.totalPages);
        setModalTotalElements(res.totalElements);
      } catch (err) {
      } finally {
        setIsModalLoading(false);
      }
    },
    [filterScope, filterSeverity, filterActorName, filterAction, searchQuery]
  );

  useEffect(() => {
    if (modalOpen) {
      loadModalLogs(0);
    }
  }, [
    modalOpen,
    searchQuery,
    filterScope,
    filterSeverity,
    filterActorName,
    filterAction,
    loadModalLogs,
  ]);

  const handleSearchApply = () => {
    setSearchQuery(searchVal);
    setFilterScope(scopeVal);
    setFilterSeverity(severityVal);
    setFilterActorName(actorNameVal);
    setFilterAction(actionVal);
  };

  const handleReset = () => {
    setSearchVal("");
    setScopeVal("");
    setSeverityVal("");
    setActorNameVal("");
    setActionVal("");
    setSearchQuery("");
    setFilterScope("");
    setFilterSeverity("");
    setFilterActorName("");
    setFilterAction("");
  };

  const openModalWithScope = (scope: string) => {
    setScopeVal(scope);
    setFilterScope(scope);
    setModalOpen(true);
  };

  const renderFeed = (title: string, items: AdminActivity[], scope: "USER" | "ADMIN") => (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        bgcolor: alpha(theme.palette.common.white, 0.025),
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        display: "flex",
        flexDirection: "column",
        height: "500px",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => openModalWithScope(scope)}
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 800,
            textTransform: "none",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Xem tất cả
        </Button>
      </Box>
      <Box
        onScroll={(e) => handleScroll(e, scope)}
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(theme.palette.common.white, 0.1),
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: alpha(theme.palette.common.white, 0.2),
          },
        }}
      >
        <Stack spacing={1.25}>
          {items.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              Chưa có hoạt động mới
            </Typography>
          ) : (
            items.map((activity) => {
              const color = getStatusColor(activity.severity);
              return (
                <Box
                  key={activity.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "120px 1fr" },
                    gap: { xs: 0.5, sm: 2 },
                    alignItems: "start",
                    py: 1,
                    borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.18)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(theme.palette.text.secondary, 0.82),
                      fontFamily: "monospace",
                    }}
                  >
                    {formatTime(activity.createdAt)}
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 850, color, mb: 0.2 }}>
                      {activity.action}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace", display: "block" }}
                    >
                      {activity.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
          {(scope === "USER" ? isLoadingUser : isLoadingAdmin) && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <BentoContainer gridColumn="1 / -1">
        <Typography variant="h6" sx={{ fontWeight: 950, mb: 0.5 }}>
          Tổng quan vận hành hôm nay
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Các chỉ số cần theo dõi để vận hành nội dung, kiểm duyệt, doanh thu và hiệu năng.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.25, sm: 1.5, md: 2 },
          }}
        >
          {signals.map((signal) => {
            const color = getStatusColor(signal.status);
            return (
              <Box
                key={signal.label}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: alpha(color, 0.055),
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {signal.value}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {signal.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {signal.detail}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </BentoContainer>

      <BentoContainer gridColumn="1 / -1">
        <Typography
          variant="h6"
          sx={{ fontWeight: 950, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: theme.palette.error.main,
              animation: "pulse 2s infinite",
            }}
          />
          Nhật ký hoạt động
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {renderFeed("Hoạt động người dùng", userLogs, "USER")}
          {renderFeed("Hoạt động quản trị", adminLogs, "ADMIN")}
        </Box>
        <style>
          {`
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0.7); }
              70% { box-shadow: 0 0 0 6px rgba(200, 16, 46, 0); }
              100% { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0); }
            }
          `}
        </style>
      </BentoContainer>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            backgroundImage: "none",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 3,
            boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.15)}`,
            color: "#F0F0F0",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 950, color: "#FFFFFF" }}>
              {filterScope === "USER"
                ? "Nhật ký Hoạt động Người dùng"
                : filterScope === "ADMIN"
                  ? "Nhật ký Hoạt động Quản trị"
                  : "Nhật ký Hoạt động Hệ thống"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bộ lọc nâng cao kết hợp phân trang dữ liệu kiểm toán hoạt động
            </Typography>
          </Box>
          <IconButton onClick={() => setModalOpen(false)} sx={{ color: "#8A8A8A" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Từ khóa tìm kiếm"
                  variant="outlined"
                  size="small"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Nhập nội dung, actor..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#0C0C0C",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phạm vi (Scope)</InputLabel>
                  <Select
                    value={scopeVal}
                    label="Phạm vi (Scope)"
                    onChange={(e) => setScopeVal(e.target.value)}
                    sx={{ bgcolor: "#0C0C0C" }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="USER">USER</MenuItem>
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                    <MenuItem value="SYSTEM">SYSTEM</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Mức độ</InputLabel>
                  <Select
                    value={severityVal}
                    label="Mức độ"
                    onChange={(e) => setSeverityVal(e.target.value)}
                    sx={{ bgcolor: "#0C0C0C" }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="INFO">INFO</MenuItem>
                    <MenuItem value="SUCCESS">SUCCESS</MenuItem>
                    <MenuItem value="WARNING">WARNING</MenuItem>
                    <MenuItem value="DANGER">DANGER</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  label="Tên Actor"
                  variant="outlined"
                  size="small"
                  value={actorNameVal}
                  onChange={(e) => setActorNameVal(e.target.value)}
                  placeholder="Nhập tên người dùng..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#0C0C0C",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  label="Hành động (Action)"
                  variant="outlined"
                  size="small"
                  value={actionVal}
                  onChange={(e) => setActionVal(e.target.value)}
                  placeholder="Ví dụ: Đăng nhập..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#0C0C0C",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                sx={{
                  color: "#8A8A8A",
                  borderColor: alpha("#8A8A8A", 0.3),
                  fontWeight: 800,
                  "&:hover": {
                    borderColor: "#8A8A8A",
                    bgcolor: alpha("#8A8A8A", 0.05),
                  },
                }}
              >
                Làm mới
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearchApply}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  fontWeight: 800,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                Tìm kiếm
              </Button>
            </Box>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              bgcolor: "#0C0C0C",
              backgroundImage: "none",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 2,
              flex: 1,
              overflow: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Thời gian
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Scope
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Mức độ
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Actor
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Hành động
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Mô tả
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Địa chỉ IP
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#161616", color: "#F0F0F0", fontWeight: 900 }}>
                    Thiết bị
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isModalLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : modalLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                      Không tìm thấy dữ liệu hoạt động phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  modalLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.common.white, 0.02),
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                          color: "#F0F0F0",
                        }}
                      >
                        {formatTime(log.createdAt)}
                      </TableCell>
                      <TableCell
                        sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}
                      >
                        <Chip
                          label={log.scope}
                          size="small"
                          sx={{
                            bgcolor:
                              log.scope === "ADMIN"
                                ? alpha(theme.palette.error.main, 0.15)
                                : alpha(theme.palette.common.white, 0.05),
                            color: log.scope === "ADMIN" ? theme.palette.error.main : "#F0F0F0",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}
                      >
                        <Chip
                          label={log.severity}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(log.severity), 0.15),
                            color: getStatusColor(log.severity),
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                          color: "#F0F0F0",
                          fontWeight: 700,
                        }}
                      >
                        {log.actorName || "-"} {log.actorId ? `(ID: ${log.actorId})` : ""}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                          color: "#FFFFFF",
                          fontWeight: 700,
                        }}
                      >
                        {log.action}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                          color: "#8A8A8A",
                          maxWidth: "300px",
                        }}
                      >
                        {log.description}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                          color: "#F0F0F0",
                          fontFamily: "monospace",
                        }}
                      >
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                          color: "#8A8A8A",
                          maxWidth: "200px",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.userAgent || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {modalTotalElements > 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}
            >
              <Typography variant="caption" color="text.secondary">
                Hiển thị trang {modalPage + 1} trên {modalTotalPages} ({modalTotalElements} dòng)
              </Typography>
              <Pagination
                count={modalTotalPages}
                page={modalPage + 1}
                onChange={(_, val) => loadModalLogs(val - 1)}
                color="primary"
                disabled={modalTotalPages <= 1}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#8A8A8A",
                  },
                  "& .Mui-selected": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: "#FFFFFF",
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

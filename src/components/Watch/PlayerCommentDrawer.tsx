"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  useCreateMovieComment,
  useMovieComments,
  useToggleCommentLike,
} from "@/modules/comment/hooks/useMovieComments";
import { MovieComment } from "@/modules/movie/types/movie";
import { ReportContentDialog } from "@/modules/report/components/ReportContentDialog";
import { usePathname, useRouter } from "next/navigation";
import { getAbsoluteAvatarUrl } from "@/utils/avatar";

interface PlayerCommentDrawerProps {
  open: boolean;
  movieId: number;
  movieSlug: string;
  episodeId?: number | null;
  commentsLocked?: boolean;
  onClose: () => void;
}

function formatRelativeTime(value?: string) {
  if (!value) return "Vừa xong";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function flattenComments(comments: MovieComment[]): MovieComment[] {
  const result: MovieComment[] = [];
  comments.forEach((c) => {
    result.push(c);
    (c.replies || []).forEach((r) =>
      result.push({ ...r, parentCommentId: r.parentCommentId ?? c.id })
    );
  });
  return result;
}

export default function PlayerCommentDrawer({
  open,
  movieId,
  movieSlug,
  episodeId,
  commentsLocked,
  onClose,
}: PlayerCommentDrawerProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const commentsQuery = useMovieComments(movieId, []);
  const createComment = useCreateMovieComment(movieId, movieSlug);
  const toggleLike = useToggleCommentLike(movieId, movieSlug);

  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [reportComment, setReportComment] = useState<MovieComment | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const MIN_LENGTH = 3;

  const allComments = useMemo(
    () => flattenComments(commentsQuery.data ?? []),
    [commentsQuery.data]
  );
  const rootComments = useMemo(() => allComments.filter((c) => !c.parentCommentId), [allComments]);
  const repliesByParent = useMemo(() => {
    return allComments.reduce<Record<number, MovieComment[]>>((acc, c) => {
      if (!c.parentCommentId) return acc;
      acc[c.parentCommentId] = [...(acc[c.parentCommentId] || []), c];
      return acc;
    }, {});
  }, [allComments]);

  useEffect(() => {
    setLikedIds(new Set(allComments.filter((c) => c.likedByCurrentUser).map((c) => c.id)));
  }, [allComments]);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [allComments.length, open]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    router.push(`/auth/login?returnTo=${encodeURIComponent(pathname || "/")}`);
    return false;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    const trimmed = content.trim();
    if (commentsLocked) return;
    if (trimmed.length < MIN_LENGTH) {
      setContentError(`Bình luận phải có ít nhất ${MIN_LENGTH} ký tự.`);
      return;
    }
    if (createComment.isPending) return;
    setContentError(null);
    createComment.mutate(
      { content: trimmed, episodeId: episodeId ?? undefined },
      { onSuccess: () => setContent("") }
    );
  };

  const handleReplySubmit = (e: FormEvent, parentCommentId: number) => {
    e.preventDefault();
    if (!requireAuth()) return;
    const trimmed = replyContent.trim();
    if (trimmed.length < MIN_LENGTH) {
      setReplyError(`Phản hồi phải có ít nhất ${MIN_LENGTH} ký tự.`);
      return;
    }
    if (createComment.isPending) return;
    setReplyError(null);
    createComment.mutate(
      { content: trimmed, parentCommentId, episodeId: episodeId ?? undefined },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyingTo(null);
        },
      }
    );
  };

  const handleLike = (commentId: number) => {
    if (!requireAuth()) return;
    if (toggleLike.isPending) return;
    const wasLiked = likedIds.has(commentId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    toggleLike.mutate(
      { commentId, liked: wasLiked },
      {
        onError: () =>
          setLikedIds((prev) => {
            const next = new Set(prev);
            wasLiked ? next.add(commentId) : next.delete(commentId);
            return next;
          }),
      }
    );
  };

  if (!open) return null;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: alpha("#fff", 0.06),
      color: "#fff",
      fontSize: "0.85rem",
      "& fieldset": { borderColor: alpha("#fff", 0.12) },
      "&:hover fieldset": { borderColor: alpha("#fff", 0.25) },
      "&.Mui-focused fieldset": { borderColor: "#C8102E" },
    },
    "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.35)", opacity: 1 },
  };

  return (
    <>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: "100%", sm: 380 },
          display: "flex",
          flexDirection: "column",
          bgcolor: alpha("#0a0a0a", 0.92),
          backdropFilter: "blur(20px)",
          borderLeft: `1px solid ${alpha("#fff", 0.08)}`,
          zIndex: 30,
        }}
      >
        {}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            pt: "max(12px, env(safe-area-inset-top))",
            pb: 1.5,
            borderBottom: `1px solid ${alpha("#fff", 0.08)}`,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
            Bình luận ({rootComments.length})
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5 }}>
          {commentsQuery.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
              <CircularProgress size={28} sx={{ color: "#C8102E" }} />
            </Box>
          ) : rootComments.length === 0 ? (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.85rem",
                textAlign: "center",
                pt: 4,
              }}
            >
              Chưa có bình luận nào.
              <br />
              Hãy là người đầu tiên!
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {rootComments.map((comment) => (
                <Box key={comment.id}>
                  <CommentItem
                    comment={comment}
                    liked={likedIds.has(comment.id)}
                    likeDisabled={toggleLike.isPending || !isAuthenticated}
                    onLike={() => handleLike(comment.id)}
                    onReply={() => {
                      if (!requireAuth()) return;
                      setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    }}
                    onReport={() => {
                      if (!requireAuth()) return;
                      setReportComment(comment);
                    }}
                  />

                  {}
                  {(repliesByParent[comment.id] || []).length > 0 && (
                    <Stack spacing={1} sx={{ mt: 1, ml: 4.5 }}>
                      {(repliesByParent[comment.id] || []).map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          liked={likedIds.has(reply.id)}
                          likeDisabled={toggleLike.isPending || !isAuthenticated}
                          onLike={() => handleLike(reply.id)}
                          onReport={() => {
                            if (!requireAuth()) return;
                            setReportComment(reply);
                          }}
                          compact
                        />
                      ))}
                    </Stack>
                  )}

                  {}
                  <Collapse in={replyingTo === comment.id} unmountOnExit>
                    <Box
                      component="form"
                      onSubmit={(e) => handleReplySubmit(e, comment.id)}
                      sx={{ mt: 1, ml: 4.5 }}
                    >
                      <TextField
                        size="small"
                        multiline
                        maxRows={3}
                        fullWidth
                        autoFocus
                        value={replyContent}
                        onChange={(e) => {
                          setReplyContent(e.target.value);
                          setReplyError(null);
                        }}
                        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReplySubmit(e as unknown as FormEvent, comment.id);
                          }
                        }}
                        placeholder="Phản hồi... (Enter để gửi)"
                        error={Boolean(replyError)}
                        helperText={
                          replyError && (
                            <Typography
                              component="span"
                              sx={{ color: "#ff6b6b", fontSize: "0.72rem" }}
                            >
                              {replyError}
                            </Typography>
                          )
                        }
                        sx={inputSx}
                      />
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                        sx={{ mt: 0.75 }}
                      >
                        <Button
                          size="small"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyError(null);
                            setReplyContent("");
                          }}
                          sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="small"
                          type="submit"
                          variant="contained"
                          disabled={
                            replyContent.trim().length < MIN_LENGTH || createComment.isPending
                          }
                          sx={{
                            fontSize: "0.75rem",
                            bgcolor: "#C8102E",
                            "&:hover": { bgcolor: "#A00B24" },
                          }}
                        >
                          Gửi
                        </Button>
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>
              ))}
              <div ref={bottomRef} />
            </Stack>
          )}
        </Box>

        {}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: `1px solid ${alpha("#fff", 0.08)}`,
            flexShrink: 0,
          }}
        >
          {commentsLocked ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
              <LockRoundedIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
                Bình luận đã bị khóa
              </Typography>
            </Stack>
          ) : (
            <Stack component="form" onSubmit={handleSubmit} spacing={1}>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextField
                  multiline
                  maxRows={4}
                  size="small"
                  fullWidth
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setContentError(null);
                  }}
                  onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as unknown as FormEvent);
                    }
                  }}
                  placeholder={
                    isAuthenticated
                      ? `Nhập bình luận... (tối thiểu ${MIN_LENGTH} ký tự)`
                      : "Đăng nhập để bình luận"
                  }
                  disabled={!isAuthenticated || createComment.isPending}
                  sx={inputSx}
                />
                <Tooltip title="Gửi bình luận">
                  <span>
                    <IconButton
                      type="submit"
                      disabled={
                        content.trim().length < MIN_LENGTH ||
                        createComment.isPending ||
                        !isAuthenticated
                      }
                      sx={{
                        color:
                          content.trim().length >= MIN_LENGTH && isAuthenticated
                            ? "#C8102E"
                            : "rgba(255,255,255,0.3)",
                        "&:hover": { bgcolor: alpha("#C8102E", 0.12) },
                        mb: 0.25,
                      }}
                    >
                      {createComment.isPending ? (
                        <CircularProgress size={18} sx={{ color: "#C8102E" }} />
                      ) : (
                        <SendRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              {contentError && (
                <Typography sx={{ color: "#ff6b6b", fontSize: "0.75rem", px: 0.5 }}>
                  {contentError}
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      {}
      <ReportContentDialog
        open={Boolean(reportComment)}
        targetType="comment"
        targetId={reportComment?.id ?? null}
        targetLabel={reportComment?.content?.slice(0, 120) || "Bình luận"}
        onClose={() => setReportComment(null)}
      />
    </>
  );
}

function CommentItem({
  comment,
  liked,
  likeDisabled,
  onLike,
  onReply,
  onReport,
  compact = false,
}: {
  comment: MovieComment;
  liked: boolean;
  likeDisabled: boolean;
  onLike: () => void;
  onReply?: () => void;
  onReport: () => void;
  compact?: boolean;
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const displayName =
    comment.authorFullName?.trim() ||
    comment.authorUsername?.trim() ||
    `Người xem #${comment.userId}`;

  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Avatar
        src={getAbsoluteAvatarUrl(comment.authorAvatarUrl) || undefined}
        sx={{
          width: compact ? 24 : 30,
          height: compact ? 24 : 30,
          bgcolor: alpha("#C8102E", 0.3),
          color: "#fff",
          fontSize: compact ? "0.65rem" : "0.75rem",
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {displayName.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.3 }}>
          <Typography
            sx={{
              color: "#fff",
              fontSize: compact ? "0.72rem" : "0.78rem",
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 130,
            }}
          >
            {displayName}
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem", whiteSpace: "nowrap" }}
          >
            {formatRelativeTime(comment.createdAt)}
          </Typography>
        </Stack>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.85)",
            fontSize: compact ? "0.78rem" : "0.82rem",
            lineHeight: 1.6,
            overflowWrap: "anywhere",
          }}
        >
          {comment.content}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
          {}
          <IconButton
            size="small"
            onClick={onLike}
            disabled={likeDisabled}
            sx={{
              color: liked ? "#C8102E" : "rgba(255,255,255,0.5)",
              p: 0.5,
              "&:hover": { color: liked ? "#A00B24" : "rgba(255,255,255,0.8)" },
            }}
          >
            {liked ? (
              <FavoriteRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
          {comment.likeCount > 0 && (
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", mr: 0.5 }}>
              {comment.likeCount}
            </Typography>
          )}

          {}
          {onReply && (
            <IconButton
              size="small"
              onClick={onReply}
              sx={{
                color: "rgba(255,255,255,0.5)",
                p: 0.5,
                borderRadius: 1,
                gap: 0.4,
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
              }}
              aria-label="Phản hồi"
            >
              <ReplyRoundedIcon sx={{ fontSize: 16 }} />
              <Typography
                component="span"
                sx={{
                  fontSize: "0.72rem",
                  display: { xs: "none", sm: "inline" },
                  color: "inherit",
                }}
              >
                Trả lời
              </Typography>
            </IconButton>
          )}

          {}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(e.currentTarget);
            }}
            sx={{
              color: "rgba(255,255,255,0.5)",
              p: 0.5,
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
            }}
            aria-label="Thêm tùy chọn"
          >
            <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            PaperProps={{ sx: { minWidth: 180, borderRadius: 1.5 } }}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onReport();
              }}
              sx={{ fontSize: "0.85rem" }}
            >
              Báo cáo bình luận
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
    </Stack>
  );
}

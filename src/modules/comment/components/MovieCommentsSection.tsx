"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { usePathname, useRouter } from "next/navigation";

import { Episode, MovieComment } from "@/modules/movie/types/movie";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  useCreateMovieComment,
  useMovieComments,
  useToggleCommentLike,
} from "@/modules/comment/hooks/useMovieComments";
import { ReportContentDialog } from "@/modules/report/components/ReportContentDialog";

function formatTime(value?: string) {
  if (!value) return "Vừa xong";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function episodeLabel(comment: MovieComment, episodes: Episode[]) {
  if (!comment.episodeId) return "Toàn phim";
  const episode = episodes.find((item) => item.id === comment.episodeId);
  if (!episode) return `Tập ${comment.episodeId}`;
  return `Tập ${episode.episodeNumber ?? "?"}: ${episode.title ?? "Chưa có tiêu đề"}`;
}

function replyScopeLabel(comment: MovieComment, episodes: Episode[]) {
  const scope = episodeLabel(comment, episodes);
  return scope === "Toàn phim" ? "Phản hồi · Toàn phim" : `Phản hồi · ${scope}`;
}

function flattenComments(comments: MovieComment[]): MovieComment[] {
  const flattened: MovieComment[] = [];

  comments.forEach((comment) => {
    flattened.push(comment);

    const replies = comment.replies || [];
    replies.forEach((reply) => {
      flattened.push({
        ...reply,
        parentCommentId: reply.parentCommentId ?? comment.id,
      });
    });
  });

  return flattened;
}

type MovieCommentsSectionProps = {
  movieId: number;
  slug: string;
  initialComments: MovieComment[];
  episodes: Episode[];
};

export function MovieCommentsSection({
  movieId,
  slug,
  initialComments,
  episodes,
}: MovieCommentsSectionProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const commentsQuery = useMovieComments(movieId, initialComments);
  const createComment = useCreateMovieComment(movieId, slug);
  const toggleLike = useToggleCommentLike(movieId, slug);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(() => new Set());
  const [allCommentsOpen, setAllCommentsOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<MovieComment | null>(null);
  const [reportComment, setReportComment] = useState<MovieComment | null>(null);

  const comments = useMemo(
    () => flattenComments(commentsQuery.data ?? initialComments),
    [commentsQuery.data, initialComments]
  );

  useEffect(() => {
    setLikedCommentIds(
      new Set(comments.filter((comment) => comment.likedByCurrentUser).map((comment) => comment.id))
    );
  }, [comments]);

  const rootComments = useMemo(
    () => comments.filter((comment) => !comment.parentCommentId),
    [comments]
  );

  const repliesByParent = useMemo(() => {
    return comments.reduce<Record<number, MovieComment[]>>((acc, comment) => {
      if (!comment.parentCommentId) return acc;
      acc[comment.parentCommentId] = [...(acc[comment.parentCommentId] || []), comment];
      return acc;
    }, {});
  }, [comments]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    router.push(`/auth/login?returnTo=${encodeURIComponent(pathname || "/")}`);
    return false;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!requireAuth()) return;
    const trimmed = content.trim();
    if (!trimmed || createComment.isPending) return;
    createComment.mutate({ content: trimmed }, { onSuccess: () => setContent("") });
  };

  const handleReplySubmit = (event: FormEvent, parentCommentId: number) => {
    event.preventDefault();
    if (!requireAuth()) return;
    const trimmed = replyContent.trim();
    if (!trimmed || createComment.isPending) return;
    createComment.mutate(
      { content: trimmed, parentCommentId },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyingTo(null);
        },
      }
    );
  };

  const handleCommentKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    handleSubmit(event as unknown as FormEvent);
  };

  const handleReplyKeyDown = (event: KeyboardEvent<HTMLDivElement>, parentCommentId: number) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    handleReplySubmit(event as unknown as FormEvent, parentCommentId);
  };

  const handleLike = (commentId: number) => {
    if (!requireAuth()) return;
    if (toggleLike.isPending) return;
    const wasLiked = likedCommentIds.has(commentId);
    setLikedCommentIds((current) => {
      const next = new Set(current);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
    toggleLike.mutate(
      { commentId, liked: wasLiked },
      {
        onError: () => {
          setLikedCommentIds((current) => {
            const next = new Set(current);
            if (wasLiked) {
              next.add(commentId);
            } else {
              next.delete(commentId);
            }
            return next;
          });
        },
      }
    );
  };

  const handleOpenReport = (comment: MovieComment) => {
    if (!requireAuth()) return;
    setReportComment(comment);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
          <Box>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={900}
              sx={{ letterSpacing: "0.2em" }}
            >
              Bình luận
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              fontWeight={950}
              letterSpacing="-0.035em"
              sx={{ fontSize: { xs: "2rem", sm: "2.35rem", md: "3rem" }, lineHeight: 1.08 }}
            >
              Phòng trò chuyện sau suất chiếu
            </Typography>
          </Box>
          {comments.length > 8 && (
            <Button
              id="movie-comment-view-all"
              variant="outlined"
              onClick={() => setAllCommentsOpen(true)}
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              Xem tất cả bình luận
            </Button>
          )}
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2.5,
          borderRadius: 1.5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, ${alpha(theme.palette.background.paper, 0.88)})`,
          backdropFilter: "blur(18px)",
        }}
      >
        <Stack component="form" onSubmit={handleSubmit} spacing={1.5}>
          <TextField
            id="movie-comment-input"
            multiline
            minRows={3}
            value={content}
            onFocus={requireAuth}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleCommentKeyDown}
            placeholder={
              isAuthenticated
                ? "Enter để gửi · Shift + Enter để xuống dòng"
                : "Đăng nhập để tham gia bình luận"
            }
            disabled={loading || createComment.isPending}
            fullWidth
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
            <Typography variant="caption" color="text.secondary">
              Nội dung tối đa 5000 ký tự.
            </Typography>
            <Button
              id="movie-comment-submit"
              type="submit"
              variant="contained"
              disabled={loading || createComment.isPending || !content.trim()}
            >
              <SendRoundedIcon />
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack spacing={1.5}>
        {rootComments.length ? (
          rootComments.map((comment) => (
            <Paper
              key={comment.id}
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.6 },
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(theme.palette.primary.main, 0.06)})`,
              }}
            >
              <CommentContent
                comment={comment}
                episodeText={episodeLabel(comment, episodes)}
                onLike={() => handleLike(comment.id)}
                onReply={() =>
                  requireAuth()
                    ? setReplyingTo(replyingTo === comment.id ? null : comment.id)
                    : undefined
                }
                likeDisabled={toggleLike.isPending}
                liked={likedCommentIds.has(comment.id)}
                onReport={() => handleOpenReport(comment)}
              />

              <Collapse in={replyingTo === comment.id} unmountOnExit>
                <Box
                  component="form"
                  onSubmit={(event) => handleReplySubmit(event, comment.id)}
                  sx={{ mt: 2, ml: { xs: 0, md: 6 } }}
                >
                  <TextField
                    id={`movie-comment-reply-${comment.id}`}
                    size="small"
                    multiline
                    minRows={2}
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    onKeyDown={(event) => handleReplyKeyDown(event, comment.id)}
                    placeholder="Enter để gửi · Shift + Enter để xuống dòng"
                    fullWidth
                  />
                  <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                    <Button onClick={() => setReplyingTo(null)}>Hủy</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!replyContent.trim() || createComment.isPending}
                    >
                      Gửi trả lời
                    </Button>
                  </Stack>
                </Box>
              </Collapse>

              {(repliesByParent[comment.id] || []).length > 0 && (
                <Stack spacing={1.2} sx={{ mt: 2, ml: { xs: 0, md: 6 } }}>
                  {(repliesByParent[comment.id] || []).map((reply) => (
                    <Box
                      key={reply.id}
                      sx={{
                        p: 1.6,
                        borderRadius: 1.2,
                        backgroundColor: alpha(theme.palette.common.white, 0.04),
                      }}
                    >
                      <CommentContent
                        comment={reply}
                        episodeText={replyScopeLabel(reply, episodes)}
                        onLike={() => handleLike(reply.id)}
                        likeDisabled={toggleLike.isPending}
                        liked={likedCommentIds.has(reply.id)}
                        onReport={() => handleOpenReport(reply)}
                        compact
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          ))
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              backgroundColor: "background.paper",
            }}
          >
            <Typography color="text.secondary">
              Chưa có bình luận nào. Hãy mở màn cuộc trò chuyện đầu tiên.
            </Typography>
          </Paper>
        )}
      </Stack>
      <CommentListDialog
        open={allCommentsOpen}
        comments={comments}
        episodes={episodes}
        onClose={() => setAllCommentsOpen(false)}
        onSelectComment={setSelectedComment}
        onLike={handleLike}
        likedCommentIds={likedCommentIds}
        likeDisabled={toggleLike.isPending}
        onReport={handleOpenReport}
      />
      <CommentDetailDialog
        comment={selectedComment}
        episodes={episodes}
        liked={selectedComment ? likedCommentIds.has(selectedComment.id) : false}
        likeDisabled={toggleLike.isPending}
        onClose={() => setSelectedComment(null)}
        onLike={() => selectedComment && handleLike(selectedComment.id)}
        onReport={() => selectedComment && handleOpenReport(selectedComment)}
      />
      <ReportContentDialog
        open={Boolean(reportComment)}
        targetType="comment"
        targetId={reportComment?.id ?? null}
        targetLabel={reportComment?.content?.slice(0, 120) || "Bình luận"}
        onClose={() => setReportComment(null)}
      />
    </Container>
  );
}

type CommentContentProps = {
  comment: MovieComment;
  episodeText: string;
  onLike: () => void;
  onReply?: () => void;
  likeDisabled: boolean;
  liked: boolean;
  compact?: boolean;
  onReport: () => void;
};

function CommentContent({
  comment,
  episodeText,
  onLike,
  onReply,
  likeDisabled,
  liked,
  compact,
  onReport,
}: CommentContentProps) {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const displayName =
    comment.authorFullName?.trim() ||
    comment.authorUsername?.trim() ||
    `Người xem #${comment.userId}`;
  const usernameLabel = comment.authorUsername ? `@${comment.authorUsername}` : null;
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Avatar
        src={comment.authorAvatarUrl || undefined}
        sx={{
          width: compact ? 32 : 42,
          height: compact ? 32 : 42,
          bgcolor: alpha(theme.palette.primary.main, 0.26),
          color: "primary.light",
          fontWeight: 900,
        }}
      >
        {avatarLetter}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 0.75 }}
        >
          <Chip
            size="small"
            label={episodeText}
            color={comment.episodeId ? "primary" : "default"}
          />
          <Typography variant="caption" color="text.primary" fontWeight={800}>
            {displayName}
          </Typography>
          {usernameLabel && (
            <Typography variant="caption" color="text.secondary">
              {usernameLabel}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            · {formatTime(comment.createdAt)}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: compact ? "0.96rem" : "1.03rem",
            lineHeight: 1.75,
            overflowWrap: "anywhere",
          }}
        >
          {comment.content}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
          <IconButton
            id={`comment-like-${comment.id}`}
            onClick={onLike}
            disabled={likeDisabled}
            size="small"
            color={liked ? "primary" : "default"}
            aria-label={liked ? "Bỏ thích bình luận" : "Thích bình luận"}
          >
            {liked ? (
              <FavoriteRoundedIcon fontSize="small" />
            ) : (
              <FavoriteBorderRoundedIcon fontSize="small" />
            )}
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {comment.likeCount || 0}
          </Typography>
          {onReply && (
            <Button
              id={`comment-reply-${comment.id}`}
              onClick={onReply}
              size="small"
              startIcon={<ReplyRoundedIcon />}
              sx={{ ml: 1 }}
            >
              Trả lời {comment.replyCount ? `(${comment.replyCount})` : ""}
            </Button>
          )}
          <IconButton
            id={`comment-more-${comment.id}`}
            size="small"
            aria-label="Mở menu bình luận"
            aria-controls={menuAnchor ? `comment-menu-${comment.id}` : undefined}
            aria-haspopup="true"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
          <Menu
            id={`comment-menu-${comment.id}`}
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              id={`comment-report-${comment.id}`}
              onClick={() => {
                setMenuAnchor(null);
                onReport();
              }}
            >
              Báo cáo comment
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
    </Stack>
  );
}

function CommentListDialog({
  open,
  comments,
  episodes,
  onClose,
  onSelectComment,
  onLike,
  likedCommentIds,
  likeDisabled,
  onReport,
}: {
  open: boolean;
  comments: MovieComment[];
  episodes: Episode[];
  onClose: () => void;
  onSelectComment: (comment: MovieComment) => void;
  onLike: (commentId: number) => void;
  likedCommentIds: Set<number>;
  likeDisabled: boolean;
  onReport: (comment: MovieComment) => void;
}) {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={950} letterSpacing="-0.03em">
          Tất cả bình luận
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {comments.length} bình luận
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={1.5}>
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              elevation={0}
              onClick={() => onSelectComment(comment)}
              sx={{
                p: 2,
                borderRadius: 1.5,
                cursor: "pointer",
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.94)}, ${alpha(theme.palette.primary.main, 0.07)})`,
              }}
            >
              <CommentContent
                comment={comment}
                episodeText={episodeLabel(comment, episodes)}
                onLike={() => onLike(comment.id)}
                onReply={undefined}
                likeDisabled={likeDisabled}
                liked={likedCommentIds.has(comment.id)}
                onReport={() => onReport(comment)}
                compact
              />
            </Paper>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function CommentDetailDialog({
  comment,
  episodes,
  liked,
  likeDisabled,
  onClose,
  onLike,
  onReport,
}: {
  comment: MovieComment | null;
  episodes: Episode[];
  liked: boolean;
  likeDisabled: boolean;
  onClose: () => void;
  onLike: () => void;
  onReport: () => void;
}) {
  return (
    <Dialog open={Boolean(comment)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 3 }}>
        {comment && (
          <CommentContent
            comment={comment}
            episodeText={episodeLabel(comment, episodes)}
            onLike={onLike}
            onReply={undefined}
            likeDisabled={likeDisabled}
            liked={liked}
            onReport={onReport}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

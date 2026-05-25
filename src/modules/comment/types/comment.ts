
export interface Comment {
  id: number;
  userId: number;
  movieId: number;
  movieSlug?: string;
  movieTitle?: string;
  episodeId?: number | null;
  parentCommentId?: number | null;
  content: string;
  likeCount: number;
  replyCount: number;
  status: string;
  authorUsername?: string | null;
  authorFullName?: string | null;
  authorAvatarUrl?: string | null;
  likedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  replies?: Comment[];
}

export interface CreateCommentRequest {
  movieId?: number | string;
  episodeId?: number | string;
  content: string;
  parentCommentId?: number | string;
}

export interface UpdateCommentRequest {
  content: string;
}

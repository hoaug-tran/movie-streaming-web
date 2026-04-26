/* Comment Domain Types */
export interface Comment {
  id: string;
  userId: string;
  movieId: string;
  movieSlug?: string;
  movieTitle?: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likeCount?: number;
  replyCount?: number;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

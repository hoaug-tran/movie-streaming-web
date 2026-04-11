/* Comment Domain Types */
export interface Comment {
  id: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  replies?: Comment[];
  likes?: number;
  dislikes?: number;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

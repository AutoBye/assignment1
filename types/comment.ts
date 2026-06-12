import type {
  ApiMessageResponse,
  CommentPaginationResponse,
} from "@/types/api";

export type CommentAuthor = {
  id: string;
  name: string;
  email: string;
};

export type CommentItem = {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  replies: CommentItem[];
};

export type CommentsResponse = ApiMessageResponse & {
  comments?: CommentItem[];
  pagination?: CommentPaginationResponse;
};

export type CreateCommentResponse = ApiMessageResponse & {
  comment?: CommentItem;
};

export type UpdateCommentResponse = ApiMessageResponse & {
  comment?: {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: CommentAuthor;
  };
};

export type DeleteCommentResponse = ApiMessageResponse;

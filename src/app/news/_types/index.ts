export type News = {
  id: string;
  title: string;
  summary: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsPagination = {
  contents: News[];
  totalCount: number;
  offset: number;
  limit: number;
};

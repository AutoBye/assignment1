import PostList from "@/components/post/PostList";
import { getPositivePageNumber } from "@/lib/validators";
import { getPosts } from "@/lib/services/post-read.service";

type PostsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

//06-09 getPosts() 다른곳으로 날림
export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { page, q } = await searchParams;

  const requestedPage = getPositivePageNumber(page);
  const query = typeof q === "string" ? q : "";

  const { posts, currentPage, totalPages, totalPostCount } = await getPosts(
    requestedPage,
    query,
  );

  return (
    <PostList
      posts={posts}
      currentPage={currentPage}
      totalPages={totalPages}
      totalPostCount={totalPostCount}
      query={query}
    />
  );
}

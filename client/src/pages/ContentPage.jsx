import { useLocation, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Header from "../components/Header";
import TopNav from "../components/TopNav";
import SectionSidebar from "../components/SectionSidebar";
import { findByPath } from "../content/nav";
import { getPageBody } from "../lib/content";

export default function ContentPage() {
  const location = useLocation();
  const route = location.pathname.replace(/^\/+|\/+$/g, "");
  const match = findByPath(route);
  const body = getPageBody(route);

  return (
    <>
      <Header />
      <TopNav />
      <div className="content-layout">
        <SectionSidebar section={match?.section} />
        <article className="md-content">
          {body === null ? (
            <>
              <h1>Page not found</h1>
              <p>
                That page doesn't exist yet. <Link to="/">Back to the homepage</Link>.
              </p>
            </>
          ) : (
            <>
              <h1>{match?.page?.title || route}</h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                {body}
              </ReactMarkdown>
            </>
          )}
        </article>
      </div>
    </>
  );
}

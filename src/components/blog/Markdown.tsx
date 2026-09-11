import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// Renders article Markdown. Raw HTML in the source is ignored (react-markdown
// default), so content can never inject scripts. Headings get ids for the
// table of contents; a stray "# Heading" is demoted to <h2> so every article
// page keeps exactly one <h1> (its title).
// react-markdown passes its AST node as a prop; keep it off the DOM element.
function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

const components: Components = {
  h1: (props) => <h2 {...omitNode(props)} />,
  a: ({ href = "", ...p }) => {
    const props = omitNode(p);
    const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?socialswick\.com/i.test(href);
    return <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props} />;
  },
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ alt = "", ...p }) => <img alt={alt} loading="lazy" decoding="async" {...omitNode(p)} />,
  table: (props) => (
    <div className="table-wrap">
      <table {...omitNode(props)} />
    </div>
  ),
};

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="article-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

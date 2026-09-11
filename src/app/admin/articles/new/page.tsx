import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo-settings";
import ArticleEditor from "../ArticleEditor";

export default async function NewArticlePage() {
  const [siteUrl, cats] = await Promise.all([
    getSiteUrl(),
    prisma.article.findMany({ where: { NOT: { category: "" } }, select: { category: true }, distinct: ["category"] }),
  ]);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">New article</h2>
      <ArticleEditor categories={cats.map((c) => c.category)} siteHost={siteUrl.replace(/^https?:\/\//, "")} />
    </div>
  );
}

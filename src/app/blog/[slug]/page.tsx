import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  Users,
  Share2,
  Twitter,
  Facebook,
  LinkIcon,
  BookOpen,
  Tag,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://lawnbowl.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

/** Extract H2 headings from markdown content for table of contents */
function extractHeadings(content: string): { id: string; text: string }[] {
  const headingRegex = /^## (.+)$/gm;
  const headings: { id: string; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    headings.push({ id, text });
  }
  return headings;
}

/** Convert markdown content to HTML-safe JSX */
function renderMarkdown(content: string): string {
  let html = content;

  // Headers - H3 first (more specific), then H2
  html = html.replace(/^### (.+)$/gm, (_, text) => {
    const id = text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return `<h3 id="${id}" class="mt-10 mb-4 text-xl font-bold text-zinc-900 md:text-2xl">${text.trim()}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_, text) => {
    const id = text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return `<h2 id="${id}" class="mt-14 mb-6 text-2xl font-bold text-zinc-900 md:text-3xl scroll-mt-24">${text.trim()}</h2>`;
  });

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-900">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links - internal and external
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, url) => {
      if (url.startsWith("/")) {
        return `<a href="${url}" class="text-[#1B5E20] font-medium underline decoration-[#1B5E20]/30 underline-offset-2 hover:decoration-[#1B5E20] transition">${text}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#1B5E20] font-medium underline decoration-[#1B5E20]/30 underline-offset-2 hover:decoration-[#1B5E20] transition">${text}</a>`;
    }
  );

  // Tables
  html = html.replace(
    /(\|.+\|[\r\n]+\|[-| :]+\|[\r\n]+((\|.+\|[\r\n]*)*))/g,
    (table) => {
      const rows = table.trim().split("\n").filter((r) => r.trim());
      if (rows.length < 2) return table;

      const headerCells = rows[0]
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      const bodyRows = rows.slice(2); // skip header and separator

      let tableHtml =
        '<div class="my-8 overflow-x-auto rounded-xl border border-zinc-200"><table class="w-full text-left text-sm">';
      tableHtml += "<thead><tr>";
      headerCells.forEach((cell) => {
        tableHtml += `<th class="border-b border-zinc-200 bg-zinc-50 px-4 py-3 font-semibold text-zinc-900">${cell}</th>`;
      });
      tableHtml += "</tr></thead><tbody>";

      bodyRows.forEach((row, i) => {
        const cells = row
          .split("|")
          .filter((c) => c.trim())
          .map((c) => c.trim());
        const bgClass = i % 2 === 1 ? ' class="bg-zinc-50/50"' : "";
        tableHtml += `<tr${bgClass}>`;
        cells.forEach((cell) => {
          // Process bold/links within table cells
          let cellHtml = cell;
          cellHtml = cellHtml.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-900">$1</strong>');
          tableHtml += `<td class="border-b border-zinc-100 px-4 py-3 text-zinc-700">${cellHtml}</td>`;
        });
        tableHtml += "</tr>";
      });

      tableHtml += "</tbody></table></div>";
      return tableHtml;
    }
  );

  // Unordered lists
  html = html.replace(
    /(^- .+[\r\n]?)+/gm,
    (block) => {
      const items = block
        .trim()
        .split("\n")
        .filter((l) => l.startsWith("- "))
        .map((l) => l.replace(/^- /, "").trim());
      return (
        '<ul class="my-6 space-y-2 pl-1">' +
        items
          .map(
            (item) =>
              `<li class="flex gap-3 text-zinc-700 leading-relaxed"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E20]/60"></span><span>${item}</span></li>`
          )
          .join("") +
        "</ul>"
      );
    }
  );

  // Ordered lists
  html = html.replace(
    /(^\d+\. .+[\r\n]?)+/gm,
    (block) => {
      const items = block
        .trim()
        .split("\n")
        .filter((l) => /^\d+\./.test(l))
        .map((l) => l.replace(/^\d+\.\s*/, "").trim());
      return (
        '<ol class="my-6 space-y-2 pl-1 list-none counter-reset-item">' +
        items
          .map(
            (item, i) =>
              `<li class="flex gap-3 text-zinc-700 leading-relaxed"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10 text-xs font-semibold text-[#1B5E20]">${i + 1}</span><span>${item}</span></li>`
          )
          .join("") +
        "</ol>"
      );
    }
  );

  // Paragraphs - wrap remaining standalone text
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<table")
      ) {
        return trimmed;
      }
      return `<p class="my-5 text-zinc-700 leading-[1.8]">${trimmed}</p>`;
    })
    .join("\n");

  return html;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const relatedPosts = getRelatedPosts(post.slug, 3);
  const htmlContent = renderMarkdown(post.content);

  // Schema.org Article markup
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://lawnbowl.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Lawnbowling",
      url: "https://lawnbowl.app",
      logo: {
        "@type": "ImageObject",
        url: "https://lawnbowl.app/icons/icon-512.png",
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://lawnbowl.app/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://lawnbowl.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://lawnbowl.app/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://lawnbowl.app/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <LearnNav />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-[#1B5E20] transition">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-[#1B5E20] transition">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-zinc-700 truncate max-w-[200px]">
            {post.title}
          </span>
        </nav>
      </div>

      {/* Article Header */}
      <header className="mx-auto max-w-3xl px-6 pt-10 pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#1B5E20]/10 px-3 py-1 text-xs font-semibold text-[#1B5E20]">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            {post.readTime} min read
          </span>
          <span className="text-xs text-zinc-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-5xl md:leading-[1.15]">
          {post.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600">
          {post.excerpt}
        </p>

        {/* Author */}
        <div className="mt-8 flex items-center gap-4 border-t border-b border-zinc-100 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5E20] to-[#2E7D32]">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900">{post.author}</p>
            <p className="text-sm text-zinc-500">
              Expert lawn bowling guides and resources
            </p>
          </div>
        </div>
      </header>

      {/* Two-column layout: TOC + Content */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex gap-12">
          {/* Table of Contents - Desktop Sidebar */}
          {headings.length > 3 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Table of Contents
                </h4>
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="block rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-[#1B5E20]/5 hover:text-[#1B5E20]"
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Article Content */}
          <article
            className="min-w-0 max-w-[720px] pb-16"
            style={{ fontSize: "18px", lineHeight: "1.7" }}
          >
            {/* Mobile Table of Contents */}
            {headings.length > 3 && (
              <div className="mb-10 rounded-xl border border-zinc-200 bg-zinc-50 p-5 lg:hidden">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <BookOpen className="h-4 w-4" />
                  Table of Contents
                </h4>
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="block rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-white hover:text-[#1B5E20]"
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Rendered Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Tags */}
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-8">
              <Tag className="h-4 w-4 text-zinc-400" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="mt-8 flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                <Share2 className="h-4 w-4" />
                Share:
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://lawnbowl.app/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20]"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://lawnbowl.app/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20]"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20]"
                aria-label="Copy link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Author Section */}
            <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] shadow-lg shadow-green-900/15">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {post.author}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    We are passionate about making lawn bowling accessible to
                    everyone. Our guides are researched using official World
                    Bowls laws, club resources, and input from experienced
                    players across the USA, Australia, and the UK.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Link
                      href="/learn"
                      className="text-sm font-medium text-[#1B5E20] hover:underline"
                    >
                      Learning Hub
                    </Link>
                    <Link
                      href="/blog"
                      className="text-sm font-medium text-[#1B5E20] hover:underline"
                    >
                      All Articles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="border-t border-zinc-200 pt-16">
            <h2 className="mb-8 text-2xl font-bold text-zinc-900 md:text-3xl">
              Related Articles
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#1B5E20]/30"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                      {related.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {related.readTime} min
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#1B5E20] transition">
                    {related.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 line-clamp-3">
                    {related.excerpt}
                  </p>
                  <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#1B5E20] group-hover:gap-2 transition-all">
                    Read article
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog + CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link
            href="/blog"
            className="group flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-[#1B5E20] transition"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to all articles
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#2E7D32]"
          >
            Sign Up Free
          </Link>
        </div>
      </section>

      <LearnFooter />
    </div>
  );
}

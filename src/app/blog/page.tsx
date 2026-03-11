import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ChevronRight,
  Search,
  Users,
  Tag,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { getAllBlogPosts, getAllCategories } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Lawn Bowling Blog | Guides, Rules & Tips",
  description:
    "Expert guides on lawn bowling rules, equipment, technique, and finding clubs near you. Everything you need to know about the sport of lawn bowls.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Lawn Bowling Blog | Guides, Rules & Tips",
    description:
      "Expert guides on lawn bowling rules, equipment, technique, and finding clubs near you.",
    url: "https://lawnbowl.app/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const categories = getAllCategories();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <LearnNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <BookOpen className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">Blog</span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            The Lawn Bowling{" "}
            <span className="text-[#1B5E20]">Blog</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Guides, rules, equipment reviews, and everything you need to know
            about the sport of lawn bowls. Written for beginners and experienced
            bowlers alike.
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
            <Tag className="h-4 w-4" />
            Topics:
          </span>
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20]"
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-[#1B5E20]/5 to-transparent shadow-sm transition-all hover:shadow-lg hover:border-[#1B5E20]/30"
          >
            <div className="p-8 md:p-12">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#1B5E20]/10 px-3 py-1 text-xs font-semibold text-[#1B5E20]">
                  Featured
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  {featuredPost.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {featuredPost.readTime} min read
                </span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 group-hover:text-[#1B5E20] transition md:text-4xl">
                {featuredPost.title}
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-600">
                {featuredPost.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B5E20]/10">
                    <Users className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {featuredPost.author}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(featuredPost.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-[#1B5E20] group-hover:gap-2 transition-all">
                  Read article
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Post Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-bold text-zinc-900 md:text-3xl">
          All Articles
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#1B5E20]/30"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {post.readTime} min read
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#1B5E20] transition md:text-xl">
                {post.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B5E20]/10">
                    <Users className="h-3.5 w-3.5 text-[#1B5E20]" />
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#1B5E20] group-hover:gap-1.5 transition-all">
                  Read
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-8 text-center shadow-2xl shadow-green-900/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Get on the Green?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-green-100/80">
            Find a lawn bowling club near you, learn the rules, or sign up to
            track your games and connect with other players.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/clubs"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Find a Club
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      <LearnFooter />
    </div>
  );
}

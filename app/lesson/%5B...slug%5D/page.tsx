import { getAllLessonSlugs, getLessonBySlug } from "@/lib/content/discover";
import { CurriculumShell } from "@/components/CurriculumShell";
import { LessonExperience } from "@/components/experience/LessonExperience";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = await getAllLessonSlugs();
  return slugs.map((slug) => ({ slug: slug.map((s) => s.toLowerCase()) }));
}

export default async function LessonPage({ params }: { params: { slug: string[] } }) {
  const lesson = await getLessonBySlug(params.slug);
  if (!lesson) notFound();

  return (
    <CurriculumShell>
      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:px-8">
        <LessonExperience lesson={lesson} />
      </article>
    </CurriculumShell>
  );
}

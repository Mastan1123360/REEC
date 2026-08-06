/**
 * components/experience/LessonExperience.tsx
 *
 * This is the "Learning Experience Generator" step from the pipeline:
 *
 *   Lesson (parsed)
 *     → buildSemanticModel()      "what is in this lesson"
 *     → interpretLesson()         "how should this be taught"
 *     → LessonExperience           assembles the concrete React modules
 *
 * The author never touches this file and never sees its output structure
 * in their markdown — dropping a new .md under /content is still the
 * entire authoring workflow. Every module below is switched on/off by the
 * interpreter's ExperiencePlan, so a lesson with no code gets no Practice
 * module scaffold, a lesson with no historical-context block gets no
 * timeline, etc. — the study session is generated per lesson, not
 * templated identically for all of them.
 */

import { buildSemanticModel } from "@/lib/semantic/model";
import { interpretLesson } from "@/lib/semantic/interpreter";
import type { Lesson } from "@/lib/content/types";

import { MissionHeader } from "./MissionHeader";
import { ConceptMap } from "./ConceptMap";
import { CompletionSummary } from "./CompletionSummary";
import { NextLessonPreview } from "./NextLessonPreview";
import { LessonRenderer } from "@/components/LessonRenderer";

export function LessonExperience({ lesson }: { lesson: Lesson }) {
  const model = buildSemanticModel(lesson);
  const plan = interpretLesson(model);

  return (
    <>
      <MissionHeader lesson={lesson} model={model} plan={plan} />

      {plan.capabilities.conceptMap && <ConceptMap concepts={model.concepts} />}

      {/* "Interactive Reading" — the existing widget-driven renderer,
          now additionally passed the plan so it can attach per-block
          visualizer enhancements (EnhancementStrip) where the
          interpreter decided they apply. */}
      <LessonRenderer lesson={lesson} plan={plan} />

      <CompletionSummary lesson={lesson} model={model} />
      <NextLessonPreview lesson={lesson} />
    </>
  );
}

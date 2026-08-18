"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  OverallProgressCard,
  CurrentStreakCard,
  TimeInvestedCard,
  TotalLessonsCard,
} from "@/components/dashboard/TopMetricsRow";
import { RoadmapStepperCard } from "@/components/dashboard/RoadmapStepperCard";
import { ContinueLearningCard } from "@/components/dashboard/ContinueLearningCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { LearningAnalyticsCard } from "@/components/dashboard/LearningAnalyticsCard";
import { UpcomingMilestonesCard } from "@/components/dashboard/UpcomingMilestonesCard";
import { PhilosophyQuoteWidget } from "@/components/dashboard/PhilosophyQuoteWidget";
import { CurrentModuleWidget } from "@/components/dashboard/CurrentModuleWidget";
import type { DashboardPhase, DashboardLesson } from "./types";
import { staggerContainerVariants, cardEntranceVariants } from "@/lib/motion";

interface DashboardShellProps {
  phases: DashboardPhase[];
  allLessons: DashboardLesson[];
}

export function DashboardShell({
  phases,
  allLessons,
}: DashboardShellProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-3 sm:p-4 lg:p-3 xl:p-4 flex flex-col justify-between h-full">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (lg:flex) — Matches the exact Apple Glass Visual Target    */}
      {/* ========================================================================= */}
      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="hidden lg:flex flex-col justify-between h-full space-y-3 lg:space-y-2.5 xl:space-y-3"
      >
        {/* 1. Top Metric Row: 4 Equal Cards across full width */}
        <motion.div
          variants={cardEntranceVariants}
          className="grid grid-cols-4 gap-3 lg:gap-3 xl:gap-3.5 shrink-0"
        >
          <OverallProgressCard allLessons={allLessons} />
          <CurrentStreakCard />
          <TimeInvestedCard />
          <TotalLessonsCard allLessons={allLessons} phasesCount={phases.length} />
        </motion.div>

        {/* 2. Main 2-Column Content Grid: 8 Cols Left + 4 Cols Right */}
        <div className="grid grid-cols-12 gap-3 lg:gap-3 xl:gap-3.5 flex-1 min-h-0 items-stretch">
          {/* LEFT COLUMN: Curriculum Carousel + Continue Learning + Recent Activity */}
          <div className="col-span-8 flex flex-col justify-between space-y-3 lg:space-y-2.5 xl:space-y-3 h-full">
            {/* Your Curriculum Carousel */}
            <motion.div variants={cardEntranceVariants}>
              <RoadmapStepperCard phases={phases} />
            </motion.div>

            {/* Continue Learning */}
            <motion.div variants={cardEntranceVariants}>
              <ContinueLearningCard allLessons={allLessons} />
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={cardEntranceVariants}>
              <RecentActivityCard />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Learning Analytics + Upcoming Milestones + Philosophy Quote */}
          <div className="col-span-4 flex flex-col justify-between space-y-3 lg:space-y-2.5 xl:space-y-3 h-full">
            {/* Learning Analytics */}
            <motion.div variants={cardEntranceVariants}>
              <LearningAnalyticsCard />
            </motion.div>

            {/* Upcoming Milestones */}
            <motion.div variants={cardEntranceVariants}>
              <UpcomingMilestonesCard phases={phases} allLessons={allLessons} />
            </motion.div>

            {/* REEC Philosophy Quote */}
            <motion.div variants={cardEntranceVariants}>
              <PhilosophyQuoteWidget />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET LAYOUT (< lg:) — Optimized 2-Column Responsive for Tablet */}
      {/* ========================================================================= */}
      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="flex lg:hidden flex-col space-y-3.5 pb-28 sm:pb-32"
      >
        {/* Top Metric Cards: 2-cols on mobile, 4-cols on tablet (md:) */}
        <motion.div
          variants={cardEntranceVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3"
        >
          <OverallProgressCard allLessons={allLessons} />
          <CurrentStreakCard />
          <TimeInvestedCard />
          <TotalLessonsCard allLessons={allLessons} phasesCount={phases.length} />
        </motion.div>

        {/* Tablet 2-Column Grid (md:grid-cols-12) / Single Column on Mobile */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-3.5 items-start">
          {/* Main Left Column on Tablet (7 cols) */}
          <div className="w-full md:col-span-7 flex flex-col space-y-3.5">
            {/* Your Curriculum Carousel */}
            <motion.div variants={cardEntranceVariants}>
              <RoadmapStepperCard phases={phases} />
            </motion.div>

            {/* Continue Learning */}
            <motion.div variants={cardEntranceVariants}>
              <ContinueLearningCard allLessons={allLessons} />
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={cardEntranceVariants}>
              <RecentActivityCard />
            </motion.div>
          </div>

          {/* Side Right Column on Tablet (5 cols) */}
          <div className="w-full md:col-span-5 flex flex-col space-y-3.5">
            {/* Current Module Widget */}
            <motion.div variants={cardEntranceVariants}>
              <CurrentModuleWidget allLessons={allLessons} />
            </motion.div>

            {/* Learning Analytics */}
            <motion.div variants={cardEntranceVariants}>
              <LearningAnalyticsCard />
            </motion.div>

            {/* Upcoming Milestones */}
            <motion.div variants={cardEntranceVariants}>
              <UpcomingMilestonesCard phases={phases} allLessons={allLessons} />
            </motion.div>

            {/* Philosophy Quote */}
            <motion.div variants={cardEntranceVariants}>
              <PhilosophyQuoteWidget />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

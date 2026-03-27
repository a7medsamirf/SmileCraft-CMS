"use client";

import React, { useState } from "react";
import { CalendarGrid } from "./CalendarGrid";
import { DailyAgenda } from "./DailyAgenda";
import { getLocale } from "next-intl/server";

interface CalendarContainerProps {
  locale: string;
}

// NOTE: DailyAgenda is currently an async server component.
// We are wrapping it here, but since it's a server component being passed to a client component,
// we should ideally make DailyAgenda a client component or use a pattern to pass server-fetched data.
// FOR NOW, we'll convert a simplified version or keep it as is if Next.js permits the nested usage.
// Actually, DailyAgenda in the original file was "async export async function DailyAgenda()".
// I will need a client-side version of DailyAgenda or a way to fetch data.

export function CalendarContainer({ locale }: CalendarContainerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 xl:col-span-4 sticky top-4">
        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          locale={locale}
        />

        <div className="mt-6 glass-card p-5 border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>إحصائيات المواعيد</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
                day: "numeric",
                month: "short",
              }).format(selectedDate)}
            </span>
          </h4>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-tight">
                إجمالي
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                12
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-tight">
                مأكد
              </p>
              <p className="text-xl font-bold text-green-600">8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 xl:col-span-8">
        {/* Pass selected date to DailyAgenda if it supported props, 
            but the current one is a server component mock. 
            In a real implementation, this would be a client component 
            fetching data based on selectedDate. */}
        <DailyAgendaWrapper selectedDate={selectedDate} locale={locale} />
      </div>
    </div>
  );
}

// Temporary wrapper to simulate dynamic agenda until we refactor DailyAgenda to be more dynamic
function DailyAgendaWrapper({
  selectedDate,
  locale,
}: {
  selectedDate: Date;
  locale: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {locale === "ar" ? "أجندة يوم " : "Agenda for "}
          {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }).format(selectedDate)}
        </h3>
      </div>
      {/* 
          Since the original DailyAgenda is a server component, we can't easily pass it props that change on the client.
          We will eventually need to refactor DailyAgenda.
          For now, I'll allow the static mock version to show up.
       */}
      <DailyAgenda selectedDate={selectedDate} />
    </div>
  );
}

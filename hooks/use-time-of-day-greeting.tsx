"use client";

import { useEffect, useState } from "react";

export type TimeOfDayGreetingStyle = "sentence" | "title";

function greetingForHour(hour: number, style: TimeOfDayGreetingStyle): string {
  const morning = style === "title" ? "Good Morning" : "Good morning";
  const afternoon = style === "title" ? "Good Afternoon" : "Good afternoon";
  const evening = style === "title" ? "Good Evening" : "Good evening";
  if (hour < 12) return morning;
  if (hour < 18) return afternoon;
  return evening;
}

/**
 * Time-of-day greeting that is stable across SSR → hydrate.
 * Returns `fallback` until mounted, then the local-clock greeting.
 */
export function useTimeOfDayGreeting(
  fallback = "Hello",
  style: TimeOfDayGreetingStyle = "sentence"
): string {
  const [greeting, setGreeting] = useState(fallback);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours(), style));
  }, [style]);

  return greeting;
}

/** Drop-in text node for server components that need a local greeting. */
export function TimeOfDayGreeting({
  fallback = "Hello",
  style = "sentence",
}: {
  fallback?: string;
  style?: TimeOfDayGreetingStyle;
}) {
  return <>{useTimeOfDayGreeting(fallback, style)}</>;
}

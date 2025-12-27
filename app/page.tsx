import type { Metadata } from "next";
import FlightTrackerClient from './FlightTrackerClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Voyages de Céline",
  description: "Suivi de vol personnel et temps de trajet",
  openGraph: {
    title: "Voyages de Céline",
    description: "Suivi de vol personnel et temps de trajet",
  },
};

export default function Page() {
  return <FlightTrackerClient />;
}

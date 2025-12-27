import type { Metadata } from "next";
import FlightTrackerClient from './FlightTrackerClient';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const flightNumber = params?.flight || params?.q;

  if (flightNumber && typeof flightNumber === 'string') {
    return {
      title: `Vol ${flightNumber.toUpperCase()} - Voyages de Céline`,
      description: `Vol ${flightNumber.toUpperCase()} : Horaires, terminal, porte, météo à destination et temps de trajet vers l'aéroport`,
      openGraph: {
        title: `Vol ${flightNumber.toUpperCase()} - Voyages de Céline`,
        description: `Vol ${flightNumber.toUpperCase()} : Horaires, terminal, porte, météo à destination et temps de trajet vers l'aéroport`,
      },
    };
  }

  return {
    title: "Voyages de Céline",
    description: "Suivi de vol personnel et temps de trajet",
    openGraph: {
      title: "Voyages de Céline",
      description: "Suivi de vol personnel et temps de trajet",
    },
  };
}

export default async function Page({ searchParams }: Props) {
  return <FlightTrackerClient />;
}

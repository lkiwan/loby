'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const EXTERNAL_GAMES: Record<string, string> = {
  'paint-followers': 'https://paint-followers.vercel.app/',
  'mafia': 'https://mafia-dl7oma.vercel.app/',
  '7azr-fazr': 'https://7azr-fazr-six.vercel.app/',
  'bara-salfa': 'https://bara-salfa-bdarija.vercel.app/'
};

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const resolvedParams = use(params);
  const externalUrl = EXTERNAL_GAMES[resolvedParams.gameId];

  if (!externalUrl) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
        <Link href="/" className="text-blue-500 hover:underline">Return to Lobby</Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col relative">
      {/* Overlay back button to allow user to return to lobby */}
      <Link href="/" className="absolute top-4 left-4 z-50 bg-gray-900/80 p-2 rounded-full text-white hover:bg-gray-700 transition shadow-lg backdrop-blur-sm">
        <ArrowLeft className="w-6 h-6" />
      </Link>
      
      <iframe 
        src={externalUrl} 
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        title={`Game: ${resolvedParams.gameId}`}
      />
    </div>
  );
}

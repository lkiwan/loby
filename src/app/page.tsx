'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Coins, LogOut, Play, Video } from 'lucide-react';
import Link from 'next/link';

const GAMES = [
  { id: 'game1', title: 'Space Invaders', cost: 10, img: 'https://via.placeholder.com/300x200.png?text=Space+Invaders' },
  { id: 'game2', title: 'Pac-Man', cost: 15, img: 'https://via.placeholder.com/300x200.png?text=Pac-Man' },
];

export default function LobbyPage() {
  const { data: session, status, update } = useSession();
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<'idle' | 'watching' | 'verifying'>('idle');
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
  };

  const playWithCoins = async (gameId: string) => {
    if (!session) return router.push('/login');

    const res = await fetch('/api/games/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, paymentMethod: 'coins' }),
    });

    if (res.ok) {
      const { redirectUrl, remainingCoins } = await res.json();
      // Update local session to reflect new coin balance immediately
      await update({ coins: remainingCoins });
      window.location.href = redirectUrl;
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  };

  const watchAdToPlay = (gameId: string) => {
    if (!session) return router.push('/login');
    setSelectedGame(gameId);
    setAdModalOpen(true);
    setAdStatus('idle');
  };

  const simulateAdWatch = () => {
    setAdStatus('watching');
    setTimeout(() => {
      setAdStatus('verifying');
      verifyAdCompletion();
    }, 5000);
  };

  const verifyAdCompletion = async () => {
    if (!session || !selectedGame) return;

    const maxAttempts = 10;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      const res = await fetch('/api/games/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId: selectedGame, paymentMethod: 'ad' }),
      });

      if (res.status === 200) {
        clearInterval(poll);
        const { redirectUrl } = await res.json();
        window.location.href = redirectUrl;
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        alert('Failed to verify ad completion. Please try again.');
        setAdModalOpen(false);
      }
    }, 2000);
  };

  if (status === 'loading') return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-500 tracking-tight">Arcade<span className="text-white">Portal</span></h1>
        
        {session?.user ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700 shadow-sm">
              <Coins className="text-yellow-400 w-5 h-5" />
              <span className="font-bold text-lg">{session.user.coins}</span>
            </div>
            <div className="text-gray-300">
              Welcome, <span className="font-semibold text-white">{session.user.email}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login" className="px-5 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 rounded-lg transition">Login</Link>
            <Link href="/register" className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition">Sign Up</Link>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <div key={game.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition hover:border-gray-600">
              <img src={game.img} alt={game.title} className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition" />
              <div className="p-5">
                <h3 className="text-xl font-bold mb-4">{game.title}</h3>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => playWithCoins(game.id)}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-medium transition"
                  >
                    <Play className="w-4 h-4" /> Play for {game.cost} Coins
                  </button>
                  <button 
                    onClick={() => watchAdToPlay(game.id)}
                    className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg font-medium transition border border-gray-600"
                  >
                    <Video className="w-4 h-4" /> Watch Ad to Play
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Ad Modal */}
      {adModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 text-center border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Sponsor Message</h3>
            
            {adStatus === 'idle' && (
              <>
                <p className="text-gray-400 mb-6">Watch a short video to unlock this game for free.</p>
                <div className="bg-gray-900 h-40 rounded-lg flex items-center justify-center mb-6 border border-gray-700 cursor-pointer hover:border-blue-500 transition group" onClick={simulateAdWatch}>
                  <Play className="w-12 h-12 text-gray-600 group-hover:text-blue-500 transition" />
                </div>
                <button onClick={() => setAdModalOpen(false)} className="text-gray-500 hover:text-white transition">Cancel</button>
              </>
            )}

            {adStatus === 'watching' && (
              <div className="h-40 flex flex-col items-center justify-center mb-6">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-blue-400 font-medium animate-pulse">Playing advertisement...</p>
              </div>
            )}

            {adStatus === 'verifying' && (
              <div className="h-40 flex flex-col items-center justify-center mb-6">
                <p className="text-green-400 font-medium animate-pulse">Verifying reward with server...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

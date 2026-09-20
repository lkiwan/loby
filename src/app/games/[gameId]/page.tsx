import Link from 'next/link';

export default function GamePage({ params }: { params: { gameId: string } }) {
  // At this point, the middleware has already validated the token and burned it.
  // The user is authenticated for this game session.
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono">
      <h1 className="text-4xl font-bold text-green-500 mb-6 animate-pulse">
        Game Unlocked: {params.gameId.toUpperCase()}
      </h1>
      <p className="text-gray-400 mb-8 max-w-md text-center leading-relaxed">
        You have successfully bypassed the arcade bouncer! 
        Your secure, single-use token was validated and destroyed. 
        If you refresh this page, you will be kicked out.
      </p>
      
      <div className="w-full max-w-2xl aspect-video bg-gray-900 border-2 border-gray-800 rounded-xl flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.3) 25%, rgba(0, 255, 0, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.3) 75%, rgba(0, 255, 0, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.3) 25%, rgba(0, 255, 0, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.3) 75%, rgba(0, 255, 0, 0.3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>
        <span className="text-2xl text-gray-700 tracking-widest font-bold z-10">[ GAME CANVAS PLACEHOLDER ]</span>
      </div>

      <Link href="/" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition">
        EXIT GAME
      </Link>
    </div>
  );
}

import { useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getGameByPass, getPlayersByPass, endGame } from "@/utils/game";
import { supabase } from "@/utils/supabaseClient"; // ✅ Make sure this is set up

interface GameInfo {
  title: string;
  game_pass: number;
  current_no_of_participants: number;
  max_no_of_participants: number;
  reward_amount: number;
}

interface Player {
  id: number;
  name: string;
  address: string;
  completed: boolean;
}

export default function HostGamePage() {
  const { connected } = useWallet();
  const router = useRouter();
  const { game_pass } = router.query;

  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // ✅ Modal toggle
  const [updating, setUpdating] = useState(false);

  // Redirect if wallet not connected
  useEffect(() => {
    if (loading) return;
    if (!connected) {
      router.replace("/");
    }
  }, [connected, router, loading]);

  // Fetch game + players
  useEffect(() => {
    if (!game_pass) return;

    const fetchGameData = async () => {
      try {
        setLoading(true);
        const pass = Array.isArray(game_pass) ? game_pass[0] : game_pass;

        const [gameData, playersData] = await Promise.all([
          getGameByPass(pass),
          getPlayersByPass(Number(pass)),
        ]);

        if (gameData) setGameInfo(gameData);
        if (playersData) setPlayers(playersData);
      } catch (err) {
        console.error("Error fetching game data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [game_pass]);

  // Auto-refresh every 5s
  useEffect(() => {
    if (!game_pass) return;

    const interval = setInterval(async () => {
      try {
        const pass = Array.isArray(game_pass) ? game_pass[0] : game_pass;

        const [gameData, playersData] = await Promise.all([
          getGameByPass(pass),
          getPlayersByPass(Number(pass)),
        ]);

        if (gameData) setGameInfo(gameData);
        if (playersData) setPlayers(playersData);
      } catch (err) {
        console.error("Error auto-refreshing game data:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [game_pass]);

  // ✅ Handle End Game Confirmation
  const handleEndGame = async () => {
    if (!game_pass) return;
    setUpdating(true);

    try {
      const pass = Array.isArray(game_pass) ? game_pass[0] : game_pass;
      endGame(Number(pass));

      // ✅ Redirect to leaderboard
      router.push({
        pathname: "/host-game/leaderboard",
        query: { game_pass: pass },
      });
    } catch (err) {
      console.error("Error ending game:", err);
      alert("❌ Failed to end game. Please try again.");
    } finally {
      setUpdating(false);
      setShowModal(false);
    }
  };

  // ✅ Loading screen
  if (loading || !connected || !gameInfo)
    return (
      <div className="min-h-screen bg-[#1b2957] text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-white text-center">
          {connected ? "Loading game data..." : "Checking wallet connection..."}
        </p>
      </div>
    );

  // ✅ Main UI
  return (
    <div className="min-h-screen bg-[#1b2957] text-white p-6 relative overflow-y-auto pt-[20vh]">
      <h1 className="text-4xl font-bold text-center mb-8">
        ⟪ {gameInfo.title} ⟫
      </h1>

      <div className="flex justify-around text-center mb-8">
        <div>
          <p className="text-3xl font-bold">{gameInfo.game_pass}</p>
          <p className="text-sm text-yellow-400">Passcode</p>
        </div>
        <div>
          <p className="text-3xl font-bold">
            {gameInfo.current_no_of_participants}/{gameInfo.max_no_of_participants}
          </p>
          <p className="text-sm text-yellow-400">Participants</p>
        </div>
        <div>
          <p className="text-3xl font-bold">{gameInfo.reward_amount} tADA</p>
          <p className="text-sm text-yellow-400">Winner Prize</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {players.map((p) => (
          <div
            key={p.id}
            className={`rounded-3xl p-6 text-center shadow-lg w-80 h-30 ${
              p.completed ? "bg-green-600/80" : "bg-red-600/80"
            }`}
          >
            <p className="font-semibold text-lg">
              {p.name.charAt(0).toUpperCase() + p.name.slice(1).toLowerCase()} joined
            </p>
            <p className="text-sm text-gray-200 mt-2">
              {p.address.slice(0, 6)}...{p.address.slice(-4)}
            </p>
            <p className="mt-4 text-sm font-medium">
              {p.completed ? "« Completed »" : "« In Progress »"}
            </p>
          </div>
        ))}

        {Array.from({
          length: (gameInfo?.max_no_of_participants || 0) - players.length,
        }).map((_, idx) => (
          <div
            key={`placeholder-${idx}`}
            className="rounded-3xl p-6 text-center shadow-lg bg-gray-500/30 w-80 h-30 flex items-center justify-center"
          >
            <p className="font-semibold text-yellow-300">Waiting for player...</p>
          </div>
        ))}
      </div>

      {/* ✅ End Game Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-20 parallelogram bg-[#0b1636] text-white font-bold py-3 px-7 text-lg transform -skew-x-12 scale-100 hover:scale-110 active:scale-95 transition-transform duration-200 shadow-lg rounded-lg"
      >
        <span className="block transform skew-x-12">End Game</span>
      </button>

      {/* ✅ Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0b1636] border border-gray-700 rounded-2xl p-8 text-center w-[90%] max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-3">
              Confirm End Game
            </h2>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Are you sure you want to end the game? <br />
              This will reveal the leaderboard and pay rewards to the winner.
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleEndGame}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition font-semibold"
                disabled={updating}
              >
                {updating ? "Ending..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

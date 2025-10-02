import { useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getGameByPass, getPlayersByPass } from "@/utils/game";

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
  submitted: boolean;
}

export default function HostGamePage() {
  const { connected } = useWallet();
  const router = useRouter();
  const { game_pass } = router.query;

  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);


  useEffect(() => {
    if (!game_pass) return;

    const fetchGameData = async () => {
      const pass = Array.isArray(game_pass) ? game_pass[0] : game_pass;
      const gameData = await getGameByPass(pass);
      if (gameData) setGameInfo(gameData);

      const playersData = await getPlayersByPass(Number(pass));
      if (playersData) setPlayers(playersData);
    };

    fetchGameData();
  }, [game_pass]);

  if (!gameInfo)
  return (
    <div className="min-h-screen bg-[#1b2957] text-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 text-white text-center">Loading...</p>
    </div>
  );


  return (
    <div className="min-h-screen bg-[#1b2957] text-white p-6 relative overflow-y-auto pt-[20vh]">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-8">{gameInfo.title}</h1>

      {/* Game info row */}
      <div className="flex justify-around text-center mb-8">
        <div>
          <p className="text-3xl font-bold">{gameInfo.game_pass}</p>
          <p className="text-sm text-gray-300">Passcode</p>
        </div>
        <div>
          <p className="text-3xl font-bold">
            {gameInfo.current_no_of_participants}/{gameInfo.max_no_of_participants}
          </p>
          <p className="text-sm text-gray-300">Participants</p>
        </div>
        <div>
          <p className="text-3xl font-bold">{gameInfo.reward_amount} tADA</p>
          <p className="text-sm text-gray-300">Reward</p>
        </div>
      </div>

      {/* Players section */}
      <div className="flex flex-wrap justify-center gap-6">
        {players.map((p) => (
          <div
            key={p.id}
            className={`rounded-3xl p-6 text-center shadow-lg w-80 h-30 ${p.submitted ? "bg-green-600/80" : "bg-red-600/80"
              }`}
          >
            <p className="font-semibold text-lg">
              {p.name.charAt(0).toUpperCase() + p.name.slice(1).toLowerCase()} has joined
            </p>
            <p className="text-sm text-gray-200 mt-2">
              {p.address.slice(0, 6)}...{p.address.slice(-4)}
            </p>
            <p className="mt-4 text-sm font-medium">
              {p.submitted ? "« Submitted »" : "« Pending Submit »"}
            </p>
          </div>
        ))}

        {/* Placeholders */}
        {Array.from({
          length: (gameInfo?.max_no_of_participants || 0) - players.length,
        }).map((_, idx) => (
          <div
            key={`placeholder-${idx}`}
            className="rounded-3xl p-6 text-center shadow-lg bg-gray-500/30 w-80 h-30 flex items-center justify-center"
          >
            <p className="font-semibold text-gray-300">Waiting for player...</p>
          </div>
        ))}
      </div>



      {/* Floating End Game Button */}
      <button
        className="fixed bottom-10 right-20 parallelogram bg-[#0b1636] text-white font-bold py-3 px-7 text-lg transform -skew-x-12 scale-100 hover:scale-110 active:scale-95 transition-transform duration-200 shadow-lg rounded-lg"
        onClick={() => alert("End Game logic to implement")}
      >
        <span className="block transform skew-x-12">End Game</span>
      </button>
    </div>
  );
}

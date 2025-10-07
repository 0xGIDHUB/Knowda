import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useWallet } from "@meshsdk/react";
import { getGameInfo, joinGame } from "../utils/game";

export default function JoinGamePage() {
  const router = useRouter();
  const [walletFocused, setWalletFocused] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [gamePass, setGamePass] = useState<number | null>(null);
  const [nickname, setNickname] = useState("");

  const { connected, wallet } = useWallet();

  // Auto-fill wallet address when connected
  useEffect(() => {
    const fetchAddress = async () => {
      if (connected && wallet) {
        try {
          const addresses = await wallet.getUsedAddresses();
          if (addresses && addresses.length > 0) {
            setWalletAddress(addresses[0]);
          }
        } catch (err) {
          console.error("Error fetching wallet address:", err);
        }
      }
    };
    fetchAddress();
  }, [connected, wallet]);

  // Handle Join
  const handleJoin = async () => {
    try {
      const game = await getGameInfo(gamePass!);

      if (!game) {
        toast.error(`Game with game pass '${gamePass}' does not exist!`);
        return;
      }

      if (game.game_state !== true) {
        toast.error("Game not active");
        return;
      }

      if (game.current_no_of_participants >= game.max_no_of_participants) {
        toast.error("Game has reached maximum participants");
        return;
      }

      // Add player to supabase
      const res = await joinGame(
        Number(gamePass),
        String(walletAddress),
        String(nickname)
      );

      if (!res.success) {
        toast.error("Error joining game!");
        return;
      }

      router.push({
        pathname: "/join-game/" + game.game_pass,
        query: {
          gamePass,
          nickname,
          walletAddress,
        },
      });
    } catch (err: any) {
      console.error("Error checking game:", err);
      toast.error("Something went wrong. Try again.");
    }
  };

  const isFormValid = gamePass && nickname.trim() && walletAddress.trim();

  return (
    <div className="flex items-start justify-center min-h-screen bg-[#1b2957] text-white relative px-4">
      {/* Card Section */}
      <div className="w-full max-w-md bg-[#0b1636] rounded-2xl shadow-lg p-8 flex flex-col gap-6 mt-40">
        <div className='flex justify-center block text-l font-medium'> <h4>Join Game </h4></div>
        {/* Game Pass */}
        <div>
          <label className="block mb-2 text-sm font-medium">Game Pass</label>
          <input
            type="number"
            placeholder="Enter game pass..."
            className="w-full px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-800
              [&::-webkit-outer-spin-button]:appearance-none 
              [&::-webkit-inner-spin-button]:appearance-none 
              [&::-moz-appearance]:textfield"
            value={gamePass ?? ""}
            onChange={(e) => setGamePass(Number(e.target.value))}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block mb-2 text-sm font-medium">Name / Alias</label>
          <input
            type="text"
            placeholder="Enter nickname..."
            className="w-full px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-800"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block mb-2 text-sm font-medium">Wallet Address</label>
          <input
            type="text"
            placeholder="Enter wallet address..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-500"
            onFocus={() => setWalletFocused(true)}
            onBlur={() => setWalletFocused(false)}
          />
          {walletFocused && (
            <p className="mt-2 text-xs text-center text-red-400">
              Ensure you enter the correct address! <br />
              Entering a wrong address will result in loss of reward.
            </p>
          )}
        </div>
      </div>

      {/* Floating Join Button */}
      <button
        disabled={!isFormValid}
        className={`fixed bottom-10 right-20 parallelogram font-bold py-3 px-10 text-lg transform -skew-x-12 scale-100 
          transition-transform duration-200 shadow-lg rounded-lg
          ${isFormValid
            ? "bg-[#0b1636] text-white hover:scale-110 active:scale-95"
            : "bg-[#0b1636] opacity-70 text-gray-300 cursor-not-allowed"
          }`}
        onClick={handleJoin}
      >
        <span className="block transform skew-x-12">Enter</span>
      </button>
    </div>
  );
}

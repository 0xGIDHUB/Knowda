import { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import { useRouter } from "next/router";
import GameCard from "@/components/GameCard";
import NewGameModal from "@/components/NewGameModal";
import {
  createGame,
  getGamesByOwner,
  deleteGame,
  updateGame,
  getGameByPass,
  activateGame,
  resetGameBeforeActivation,
  updateGameTxId
} from "@/utils/game";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EditGameModal from "@/components/EditGameModal";
import SetQuestionsModal from "@/components/SetQuestionsModal";
import toast from "react-hot-toast";
import { lockAdaReward } from "@/offchain/lock";
import { IWallet } from "@meshsdk/core";


export default function CreateGamePage() {
  const { connected, wallet } = useWallet();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [address, setAddress] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [selectedGameForQuestions, setSelectedGameForQuestions] = useState<
    any | null
  >(null);

  // Redirect if wallet not connected
  useEffect(() => {
    if (!connected && !loading) {
      router.replace("/");
    }
  }, [connected, router, loading]);

  // Fetch wallet address
  useEffect(() => {
    async function fetchAddress() {
      if (connected && wallet) {
        const addr = await wallet.getChangeAddress();
        setAddress(addr);
      }
    }
    fetchAddress();
  }, [connected, wallet]);

  // Fetch games for this wallet
  useEffect(() => {
    async function fetchGames() {
      if (address) {
        setLoading(true);
        const myGames = await getGamesByOwner(address);
        setGames(myGames);
        setLoading(false);
      }
    }
    fetchGames();
  }, [address]);

  // Handle form submit
  const handleCreateGame = async (formData: {
    title: string;
    reward: number;
    questions: number;
    duration: number;
  }) => {
    if (!address) return;

    try {
      const newGame = await createGame({
        owner: address,
        title: formData.title,
        reward: formData.reward,
        questions: formData.questions,
        duration: formData.duration,
      });

      if (newGame) {
        const updatedGames = await getGamesByOwner(address);
        setGames(updatedGames);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Failed to create game:", err);
    }
  };

  const handleDeleteGame = (gameId: string) => {
    setPendingDeleteId(gameId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteGame(pendingDeleteId); // ⬅️ your supabase util
      const updatedGames = await getGamesByOwner(address!); // refresh
      setGames(updatedGames);
    } catch (err) {
      console.error("Failed to delete game:", err);
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleEditGame = (game: any) => {
    setSelectedGame(game);
    setEditModalOpen(true);
  };

  const handleUpdateGame = async (formData: {
    id: string;
    title: string;
    reward: number;
    questions: number;
    duration: number;
  }) => {
    try {
      // Call your reusable updateGame function
      await updateGame({
        id: formData.id,
        title: formData.title,
        reward: formData.reward,
        questions: formData.questions,
        duration: formData.duration,
      });

      // Refresh game list after update
      const updatedGames = await getGamesByOwner(address!);
      setGames(updatedGames);
    } catch (err) {
      console.error("Failed to update game:", err);
    }
  };

  const handleSetQuestions = (game: any) => {
    setSelectedGameForQuestions(game);
    setQuestionsModalOpen(true);
  };

  // helper to truncate tx hash
  const truncateHash = (hash: string, start = 8, end = 8) =>
    hash.length > start + end ? `${hash.slice(0, start)}...${hash.slice(-end)}` : hash;



  const handleActivateGame = async (game: any, wallet: IWallet) => {
    try {
      // Step 1: Check game status
      const gameInfo = await getGameByPass(game.game_pass);

      if (gameInfo.game_state) {
        toast.success("Game is currently active!");
        router.push(`/host-game/${game.game_pass}`);
        return;
      }

      
      // Step 2: Sign transaction before activation
      let txHash: string | null = null;
      try {
        txHash = await lockAdaReward(game.reward_amount, wallet);
        if (!txHash) {
          toast.error("Transaction failed or cancelled");
          return;
        }
        
        const explorerUrl = `https://preview.cardanoscan.io/transaction/${txHash}`;
        
        toast.custom(
          (t) => (
            <div className="max-w-xl w-full bg-white text-slate-900 rounded-lg p-4 shadow-md flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">Transaction submitted</div>
                  <div className="font-medium text-sm mt-1">{truncateHash(txHash!)}</div>
                  <div className="text-xs text-gray-500 mt-1 break-all">{txHash}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(txHash!);
                        toast.success("Transaction hash copied");
                      } catch {
                        toast.error("Copy failed");
                      }
                    }}
                    className="text-sm bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200"
                    >
                    Copy
                  </button>

                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                    >
                    Explorer
                  </a>

                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ),
          { duration: Infinity }
        );
      } catch (err) {
        console.error("Transaction error:", err);
        toast.error("Transaction failed or cancelled");
        return;
      }
      
      // 🆕 Step 2.5: Reset participants and clear old data
      const { success: resetSuccess, error } = await resetGameBeforeActivation(game.game_pass);
      if (!resetSuccess) {
        console.error(error);
        toast.error("Failed to reset game data before activation");
        return;
      }

      // Step 3: Update Supabase
      await activateGame(game.game_pass);
      if (txHash) {
        const success = await updateGameTxId(game.game_pass, txHash);
        if (!success) toast.error("Failed to save transaction ID in database");
      }
      toast.success("Game activated successfully!");
      router.push(`/host-game/${game.game_pass}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to activate game");
    }
  };



  return (
    <div className="flex flex-col items-center min-h-screen text-white bg-[#1b2957] relative overflow-y-auto">
      {loading ? (
        <div className="flex flex-col items-center gap-3 pt-[40vh] pb-20">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-300">Loading games...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center justify-center text-center p-6 bg-white/10 rounded-2xl shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-gray-300">No games created yet</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-4xl pt-[25vh] pb-20">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onDelete={handleDeleteGame}
              onInfo={() => handleEditGame(game)}
              onQuestions={() => handleSetQuestions(game)}
              onActivate={() => handleActivateGame(game, wallet)}
            />
          ))}
        </div>
      )}

      {/* Floating New Game Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-20 parallelogram bg-[#0b1636] text-white font-bold py-3 px-7 text-lg transform -skew-x-12 scale-100 hover:scale-110 active:scale-95 transition-transform duration-200 shadow-lg rounded-lg border border-white"
        style={{ minWidth: "110px", zIndex: 100 }}
      >
        <span className="block transform skew-x-12">New Game</span>
      </button>

      {/* Modal Component */}
      <NewGameModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateGame}
      />

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <EditGameModal
        show={editModalOpen}
        game={selectedGame}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateGame}
      />

      <SetQuestionsModal
        show={questionsModalOpen}
        onClose={() => setQuestionsModalOpen(false)}
        game={selectedGameForQuestions}
      />

      <style jsx>{`
        .parallelogram {
          border: none;
          cursor: pointer;
          outline: none;
        }
      `}</style>
    </div>
  );
}

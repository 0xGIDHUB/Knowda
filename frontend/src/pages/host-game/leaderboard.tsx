import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getLeaderboardByPass, getGameInfo, getGameTotalPoints } from "@/utils/game";
import { payWinner } from "@/offchain/unlock";
import { supabase } from "@/utils/supabaseClient";
import Confetti from "react-confetti";
import toast, { Toaster } from "react-hot-toast";

interface Player {
    name: string;
    address: string;
    points: number | null;
}

export default function LeaderboardPage() {
    const router = useRouter();
    const { game_pass } = router.query;

    const [players, setPlayers] = useState<Player[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);
    const [gameTitle, setGameTitle] = useState("");
    const [reward, setReward] = useState<number | null>(null);
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [gameData, setGameData] = useState<any>(null);

    // Fetch leaderboard and game info
    useEffect(() => {
        if (!game_pass) return;

        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const pass = Number(Array.isArray(game_pass) ? game_pass[0] : game_pass);

                const [leaderboardData, gameData, totalPts] = await Promise.all([
                    getLeaderboardByPass(pass),
                    getGameInfo(pass),
                    getGameTotalPoints(pass),
                ]);

                if (leaderboardData) setPlayers(leaderboardData);
                if (gameData) {
                    setGameData(gameData);
                    setGameTitle(gameData.title || "Game");
                    setReward(gameData.reward_amount ?? null);
                }
                setTotalPoints(totalPts);
            } catch (err) {
                console.error("Error loading leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [game_pass]);

    // Reveal animation + pay winner or show tx notification
    useEffect(() => {
        if (loading || players.length === 0 || !gameData) return;

        let i = players.length - 1;
        const interval = setInterval(async () => {
            setRevealedCount((prev) => prev + 1);

            // When the first player (rank 1) has just been revealed
            if (i === 0) {
                const winner = players[0];

                // Wait 2 seconds before showing modal/toast
                setTimeout(async () => {
                    const showTxToast = (txHash: string, alreadyPaid = false) => {
                        toast.custom(
                            (t) => (
                                <div
                                    className={`${t.visible ? "animate-enter" : "animate-leave"
                                        } max-w-md w-full bg-[#0b1636] border border-yellow-500 text-white shadow-lg rounded-xl p-5 flex flex-col gap-3`}
                                >
                                    <h2 className="text-lg font-bold text-yellow-400">
                                        {alreadyPaid ? "💰 Reward Paid" : "🪙 Reward Paid Successfully!"}
                                    </h2>
                                    <p className="text-sm">
                                        Transaction Hash:{" "}
                                        <span className="font-mono text-yellow-300">
                                            {txHash.slice(0, 10)}...{txHash.slice(-6)}
                                        </span>
                                    </p>

                                    <div className="flex gap-3 mt-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(txHash);
                                                toast.success("Copied to clipboard!");
                                            }}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-lg text-sm font-semibold"
                                        >
                                            Copy Hash
                                        </button>
                                        <a
                                            href={`https://preview.cardanoscan.io/transaction/${txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                                        >
                                            View on Explorer
                                        </a>
                                        <button
                                            onClick={() => toast.dismiss(t.id)}
                                            className="ml-auto text-gray-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ),
                            { duration: Infinity }
                        );
                    };

                    try {
                        if (gameData.reward_paid && gameData.reward_tx) {
                            console.log("Reward already paid earlier, showing transaction info...");
                            showTxToast(gameData.reward_tx, true);
                        } else if (!gameData.reward_paid) {
                            console.log("Reward not paid yet. Initiating payment...");
                            const txHash = await payWinner(
                                gameData.tx_id as string,
                                gameData.reward_amount,
                                winner.address
                            );

                            await supabase
                                .from("game_info")
                                .update({ reward_tx: txHash, reward_paid: true })
                                .eq("game_pass", gameData.game_pass);

                            showTxToast(txHash);
                            console.log("Reward payment completed:", txHash);
                        }
                    } catch (err) {
                        console.error("Payment or toast handling failed:", err);
                        toast.error("Payment failed. Check console for details.");
                    }
                }, 2000); // ← 2-second delay before modal appears
            }

            i--; // move decrement AFTER the winner logic

            if (i < 0) {
                clearInterval(interval);
                setTimeout(() => setShowConfetti(true), 500);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [loading, players, gameData]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#1b2957] text-white">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-6">Loading leaderboard...</p>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-screen bg-[#1b2957] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
            <Toaster position="top-center" />
            {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

            {/* Header Section */}
            <div className="text-center mb-6 mt-20">
                <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                    🏆 {gameTitle} Leaderboard
                </h1>

                <div className="text-gray-300 flex items-center justify-center gap-8">
                    <p>
                        <span className="font-semibold text-yellow-500">Reward:</span>{" "}
                        {reward ? `${reward} tADA` : "—"}
                    </p>
                    <p>
                        <span className="font-semibold text-yellow-500">Total Points:</span>{" "}
                        {totalPoints ?? 0}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-gray-600 shadow-lg bg-[#0b1636]">
                <table className="w-full text-sm">
                    <thead className="bg-[#132149] text-yellow-400 uppercase text-xs">
                        <tr>
                            <th className="py-3 px-4 text-left">Rank</th>
                            <th className="py-3 px-4 text-left">Player Name</th>
                            <th className="py-3 px-4 text-left">Wallet Address</th>
                            <th className="py-3 px-4 text-left">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, index) => {
                            const isRevealed = index >= players.length - revealedCount;
                            return (
                                <tr
                                    key={index}
                                    className={`border-t border-gray-700 text-sm transition-all duration-700 transform ${isRevealed
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-8"
                                        } ${index === 0
                                            ? "bg-yellow-400/20 font-bold text-yellow-300"
                                            : index === 1
                                                ? "bg-yellow-300/10 text-yellow-200"
                                                : index === 2
                                                    ? "bg-yellow-200/5 text-yellow-100"
                                                    : "hover:bg-[#1e2b52]/60"
                                        }`}
                                >
                                    <td className="py-3 px-4">{index + 1}</td>
                                    <td className="py-3 px-4 capitalize">{player.name}</td>
                                    <td className="py-3 px-4 font-mono text-gray-300">
                                        {player.address
                                            ? `${player.address.slice(0, 6)}...${player.address.slice(-4)}`
                                            : "—"}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-yellow-400">
                                        {player.points ?? 0}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <button
                onClick={() => router.push("/")}
                className="mt-8 bg-[#0b1636] text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105"
            >
                Return to Home
            </button>
        </div>
    );
}

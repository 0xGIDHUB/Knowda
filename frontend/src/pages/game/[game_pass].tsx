import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getGameInfo, checkGameCapacity } from "@/utils/game";
import { toast } from "react-hot-toast";

// I'll be reworking on this soon for better interactivity
// It will be 1 question per time, and each question will be limited to a time frame

export default function GamePage() {
  const router = useRouter();
  const { gamePass, nickname, walletAddress } = router.query;

  const [gameData, setGameData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Fetch game info
  useEffect(() => {
    const fetchGame = async () => {
      if (!gamePass) return;
      try {
        const game = await getGameInfo(Number(gamePass));
        if (game) {
          setGameData(game);
          setTimeLeft(game.duration * 60); // convert minutes → seconds
        }
      } catch (err) {
        console.error("Error fetching game info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gamePass]);

  // Countdown timer
  useEffect(() => {
    if (!timeLeft || showModal) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, showModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Cancel → go back
  const handleCancel = () => {
    router.push("/join-game");
  };

  // Continue → check participants then proceed
  const handleContinue = async () => {
    try {
      const isFull = await checkGameCapacity(Number(gamePass));
      if (isFull) {
        toast.error("Game has reached maximum participants!");
        router.push("/join-game");
        return;
      }
      setShowModal(false);
      // Later: update participants table here
    } catch (err) {
      console.error(err);
      toast.error("Error joining game");
      router.push("/join-game");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b2957] text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4">Loading game...</p>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#1b2957] text-white flex flex-col">

    {/* Confirmation Modal */}
    {showModal && gameData && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-600 rounded-xl shadow-lg p-8 max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4 text-center">
            Confirm Participation
          </h2>
          <p className="text-center mb-6">
            Confirm to participate in{" "}
            <span className="font-semibold">{gameData.title}</span>. <br />
            You have <span className="font-semibold">{gameData.duration}</span>{" "}
            minutes to answer{" "}
            <span className="font-semibold">{gameData.no_of_questions}</span>{" "}
            questions.
          </p>
          <div className="flex justify-center gap-6">
            <button
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Game UI (only shows when modal is closed) */}
    {!showModal && gameData && (
      <>
        {/* Status Card */}
        <div className="fixed top-20 right-20 mt-[20px] z-30">
          <header className="bg-[#0b1636] p-4 rounded-xl shadow-lg w-64 flex flex-col justify-center text-center gap-2">
            <h1 className="text-base font-bold text-white truncate">
              {gameData.title}
            </h1>
            <p className="text-yellow-400 font-semibold text-sm">
              Reward: {gameData.reward_amount} ADA
            </p>
            <p className="font-mono text-green-400 text-sm">
              {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </p>
          </header>
        </div>

        {/* Scrollable Questions */}
        <main className="flex-1 overflow-y-auto p-4 space-y-6 mt-[240px] flex justify-center">
          <div className="w-11/12 max-w-2xl space-y-6">
            {gameData?.questions?.length > 0 ? (
              gameData.questions.map((q: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white text-black p-4 rounded-lg shadow-md text-sm"
                >
                  <h2 className="font-semibold mb-3 text-base">
                    Q{idx + 1}: {q.question}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt: string, i: number) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200 text-sm"
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          className="accent-blue-600"
                        />
                        {String.fromCharCode(65 + i)}. {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className="bg-white text-black p-4 rounded-lg shadow-md text-sm"
                  >
                    <h2 className="font-semibold mb-3 text-base">
                      Q{num}: Placeholder question {num}?
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {["Option A", "Option B", "Option C", "Option D"].map(
                        (opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2 bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200 text-sm"
                          >
                            <input
                              type="radio"
                              name={`q-placeholder-${num}`}
                              value={opt}
                              className="accent-blue-600"
                            />
                            {String.fromCharCode(65 + i)}. {opt}
                          </label>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </main>

        {/* Floating Submit Button */}
        <button
          className="fixed bottom-10 right-20 parallelogram bg-[#0b1636] font-bold py-3 px-10 text-lg transform -skew-x-12 scale-100 
            transition-transform duration-200 shadow-lg rounded-lg hover:scale-110 active:scale-95"
        >
          <span className="block transform skew-x-12">Submit</span>
        </button>
      </>
    )}
  </div>
);

}

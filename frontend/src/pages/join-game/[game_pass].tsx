import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  getGameInfo,
  leaveGame,
  getPlayerAnswers,
  savePlayerAnswer,
  getGameQuestions,
  markPlayerCompleted,
} from "@/utils/game";
import { toast } from "react-hot-toast";
import ConfirmJoinModal from "@/components/ConfirmJoinModal";


export default function GamePage() {
  const router = useRouter();
  const { gamePass, nickname, walletAddress } = router.query;

  const [gameData, setGameData] = useState<any>(null);
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  const [questions, setQuestions] = useState<string[]>([]);
  const [options, setOptions] = useState<string[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionOver, setQuestionOver] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gamePass) return;
      try {
        const game = await getGameInfo(Number(gamePass));
        if (game) setGameData(game);
      } catch (err) {
        console.error("Error fetching game info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gamePass]);

  const handleCancel = async () => {
    if (!gamePass || !walletAddress) {
      router.push("/join-game");
      return;
    }

    try {
      const result = await leaveGame(
        Number(gamePass),
        walletAddress as string,
        nickname as string
      );
      if (result.success) toast.success("You have left the game.");
      else toast.error("Error removing player data.");
    } catch (err) {
      console.error(err);
      toast.error("Error leaving game.");
    } finally {
      router.push("/join-game");
    }
  };

  const handleContinue = async () => {
    try {
      setShowModal(false);
      toast.success("Game in Progress!");

      const [qData, pAnswers] = await Promise.all([
        getGameQuestions(Number(gamePass)),
        getPlayerAnswers(
          Number(gamePass),
          walletAddress as string,
          nickname as string
        ),
      ]);

      if (qData && gameData?.no_of_questions) {
        const qList = Array.from(
          { length: gameData.no_of_questions },
          (_, i) => qData[`q${i + 1}`]
        );
        const oList = Array.from(
          { length: gameData.no_of_questions },
          (_, i) => qData[`q${i + 1}_options`] || []
        );

        setQuestions(qList);
        setOptions(oList);
      }

      if (pAnswers) setAnswers(pAnswers);
    } catch (err) {
      console.error(err);
      toast.error("Error loading game");
      router.push("/join-game");
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null); // ✅ store interval ref

  useEffect(() => {
    if (!gameData || questions.length === 0 || showModal) return;

    const perQuestionTime = (gameData.duration * 60) / gameData.no_of_questions;
    setTimeLeft(perQuestionTime);
    setQuestionOver(false);

    // keep a ref to prevent multiple triggers
    let triggered = false;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;

          if (!triggered) {
            triggered = true;
            setQuestionOver(true);

            // slight delay to avoid race condition before state update
            setTimeout(() => {
              handleNextQuestion("");
            }, 150);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, showModal, questions, gameData]);

  const handleSubmit = async () => {
    if (!selectedOption) return;

    // ✅ Stop the timer instantly
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setQuestionOver(true);
    await handleNextQuestion(selectedOption);
  };

  const handleNextQuestion = async (answer: string) => {
    // ✅ Make a copy to avoid mutating state directly
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;

    try {
      // ✅ Save immediately before changing states
      await savePlayerAnswer(
        Number(gamePass),
        walletAddress as string,
        nickname as string,
        newAnswers
      );
      setAnswers(newAnswers);
    } catch (err) {
      console.error("Error saving answer:", err);
    }

    // ✅ Only clear after saving
    setSelectedOption("");

    // ✅ If there are more questions, move to the next one
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // ✅ Last question: don’t re-save with blank answer
    setTimeLeft(0);
    setQuestionOver(true);
    setIsCalculating(true);

    // ✅ Mark player as completed
    try {
      await markPlayerCompleted(
        Number(gamePass),
        walletAddress as string,
        nickname as string
      );
      console.log("✅ Player marked as completed in Supabase");
    } catch (err) {
      console.error("❌ Error updating completion status:", err);
    }

    console.log("Game completed! Calculating results...");

    // ✅ Calculate result from utils/game
    try {
      const { calculateAndSaveResult } = await import("@/utils/game");
      const result = await calculateAndSaveResult(
        Number(gamePass),
        walletAddress as string,
        nickname as string
      );

      console.log(`✅ You scored ${result.totalPoints} / ${result.maxPoints}`);

      setTimeout(() => {
        setIsCalculating(false);
        setShowModal(false);
        router.push({
          pathname: "/join-game/result",
          query: {
            score: result.totalPoints,
            max: result.maxPoints,
          },
        });
      }, 2000);

    } catch (err) {
      console.error("Error calculating final score:", err);
      toast.error("Error calculating result");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1b2957] text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b2957] text-white flex flex-col">
      {showModal && gameData && (
        <ConfirmJoinModal
          gameData={gameData}
          onCancel={handleCancel}
          onContinue={handleContinue}
        />
      )}

      {!showModal && gameData && (
        <div className="absolute top-[18%] left-1/2 transform -translate-x-1/2 bg-[#0b1636] rounded-2xl shadow-lg px-8 py-5 w-[90%] max-w-md text-center border border-[#000000]">
          <h1 className="text-2xl font-bold text-yellow-400 mb-1">
            {gameData.title}
          </h1>
          <p className="text-md font-semibold text-gray-300">
            Player: {nickname}
          </p>
        </div>
      )}

      {/* ✅ Show questions while game is active */}
      {!showModal &&
        !isCalculating &&
        questions.length > 0 &&
        currentIndex < questions.length && (
          <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 bg-[#132149] text-white rounded-2xl shadow-lg px-10 py-3 w-[95%] max-w-2xl text-center border border-[#000000]">
            <h2 className="text-2xl font-semibold mb-2">
              Question {currentIndex + 1} of {questions.length}
            </h2>
            <p className="mb-5 text-lg font-medium text-gray-200">
              {questions[currentIndex]}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-2">
              {options[currentIndex]?.slice(0, 4).map((opt, i) => {
                const optionLabel = String.fromCharCode(65 + i);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(optionLabel)}
                    className={`py-4 rounded-xl font-medium border transition-all duration-200 text-base ${selectedOption === optionLabel
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "bg-transparent border-gray-400 hover:bg-gray-700"
                      }`}
                  >
                    {optionLabel}. {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-400 mb-2">⏱ Time left: {timeLeft}s</p>
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className={`px-8 py-3 rounded-lg font-semibold text-base ${selectedOption
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 cursor-not-allowed"
                  }`}
              >
                Submit
              </button>
            </div>
          </div>
        )}

      {/* ✅ Loader when calculating result */}
      {isCalculating && (
        <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-300">
            Calculating result...
          </p>
        </div>
      )}
    </div>
  );
}

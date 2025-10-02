import { useEffect, useState } from "react";
import {
  getSingleQuestion,
  saveSingleQuestion,
  Question,
} from "@/utils/gameQuestions";
import toast from "react-hot-toast";


export default function SetQuestionsModal({
  show,
  onClose,
  game,
}: {
  show: boolean;
  onClose: () => void;
  game: any;
}) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    points: 100,
  });
  const [loading, setLoading] = useState(false);

  // Load active question whenever index changes
  useEffect(() => {
    const loadQuestion = async () => {
      if (game?.game_pass && show) {
        setLoading(true);
        const q = await getSingleQuestion(game.game_pass, activeIndex);
        if (q) setCurrentQuestion(q);
        else
          setCurrentQuestion({
            questionText: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
            points: 100,
          });
        setLoading(false);
      }
    };
    loadQuestion();
  }, [activeIndex, game, show]);

  if (!show || !game) return null;

  const handleChange = (field: keyof Question, value: string | number) => {
    setCurrentQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await saveSingleQuestion(game.game_pass, activeIndex, currentQuestion);
      toast.success(`Question ${activeIndex} saved successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save question");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto">
      <div className="bg-white text-[#22336c] rounded-xl p-6 w-full max-w-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">
          Set Questions for {game.title}
        </h2>

        {loading ? (
          <p>Loading Question {activeIndex}...</p>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter question"
              value={currentQuestion.questionText}
              onChange={(e) => handleChange("questionText", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Option A"
                value={currentQuestion.optionA}
                onChange={(e) => handleChange("optionA", e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="text"
                placeholder="Option B"
                value={currentQuestion.optionB}
                onChange={(e) => handleChange("optionB", e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="text"
                placeholder="Option C"
                value={currentQuestion.optionC}
                onChange={(e) => handleChange("optionC", e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="text"
                placeholder="Option D"
                value={currentQuestion.optionD}
                onChange={(e) => handleChange("optionD", e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex gap-6 items-center">
              <div>
                <p className="text-sm font-medium">Correct Answer:</p>
                <div className="flex gap-3">
                  {["A", "B", "C", "D"].map((opt) => (
                    <label key={opt} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="correct"
                        checked={currentQuestion.correctAnswer === opt}
                        onChange={() => handleChange("correctAnswer", opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Reward Points:</p>
                <div className="flex gap-3">
                  {[100, 150, 200].map((pt) => (
                    <label key={pt} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="points"
                        checked={currentQuestion.points === pt}
                        onChange={() => handleChange("points", pt)}
                      />
                      {pt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Number Buttons */}
        <div className="grid grid-cols-10 gap-2 mt-6">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
            const disabled = num > game.no_of_questions;
            return (
              <button
                key={num}
                disabled={disabled}
                onClick={() => setActiveIndex(num)}
                className={`p-2 rounded-md text-sm ${
                  disabled
                    ? "bg-gray-200 text-gray-400"
                    : activeIndex === num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-300"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Q{activeIndex}
          </button>
        </div>
      </div>
    </div>
  );
}

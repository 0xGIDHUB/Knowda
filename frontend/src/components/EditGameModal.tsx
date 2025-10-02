import { useState, useEffect } from "react";

interface EditGameModalProps {
  show: boolean;
  game: {
    id: string;
    title: string;
    reward_amount: number;
    no_of_questions: number;
    duration: number;
  } | null;
  onClose: () => void;
  onSubmit: (formData: {
    id: string;
    title: string;
    reward: number;
    questions: number;
    duration: number;
  }) => void;
}

export default function EditGameModal({
  show,
  game,
  onClose,
  onSubmit,
}: EditGameModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    reward: 5,
    questions: 10,
    duration: 1,
  });

  // Pre-fill form when modal opens
  useEffect(() => {
    if (game) {
      setFormData({
        id: game.id,
        title: game.title,
        reward: game.reward_amount,
        questions: game.no_of_questions,
        duration: game.duration,
      });
    }
  }, [game]);

  if (!show || !game) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#0b1655] p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Game</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Game Title */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-300">Game Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="p-2 rounded bg-white/10 text-white focus:outline-none"
            />
          </div>

          {/* Reward */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-300">Reward Amount (+1 tADA gas fee)</label>
            <input
              type="number"
              min={5}
              value={formData.reward}
              onChange={(e) =>
                setFormData({ ...formData, reward: Number(e.target.value) })
              }
              required
              className="p-2 rounded bg-white/10 text-white focus:outline-none"
            />
          </div>

          {/* Questions */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-300">Number of Questions</label>
            <select
              value={formData.questions}
              onChange={(e) =>
                setFormData({ ...formData, questions: Number(e.target.value) })
              }
              className="p-2 rounded bg-white/10 text-white focus:outline-none"
            >
              <option value={10} className="text-black">
                10 Questions
              </option>
              <option value={15} className="text-black">
                15 Questions
              </option>
              <option value={20} className="text-black">
                20 Questions
              </option>
            </select>
          </div>

          {/* Duration */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-300">Game Duration (minutes)</label>
            <input
              type="number"
              min={2}
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: Number(e.target.value) })
              }
              required
              className="p-2 rounded bg-white/10 text-white focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

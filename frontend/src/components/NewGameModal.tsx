import { useState } from "react";

interface NewGameModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    title: string;
    reward: number;
    questions: number;
    duration: number;
  }) => void;
}

export default function NewGameModal({
  show,
  onClose,
  onSubmit,
}: NewGameModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    reward: 5,
    questions: 10,
    duration: 1,
  });

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#0b1655] p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Game</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Game Title */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-300">Game Title</label>
            <input
              type="text"
              placeholder="Enter game title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="p-2 rounded bg-white/10 text-white focus:outline-none"
            />
          </div>

          {/* ADA Reward */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-300">
              Reward Amount (+1 tADA gas fee) 
            </label>
            <input
              type="number"
              min={5}
              placeholder="Minimum 5 ADA"
              value={formData.reward}
              onChange={(e) =>
                setFormData({ ...formData, reward: Number(e.target.value) })
              }
              required
              className="p-2 rounded bg-white/10 text-white focus:outline-none"
            />
          </div>

          {/* Number of Questions */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-300">
              Number of Questions
            </label>
            <select
              value={formData.questions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questions: Number(e.target.value),
                })
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
            <label className="mb-1 text-sm text-gray-300">
              Game Duration (minutes)
            </label>
            <input
              type="number"
              min={2}
              placeholder="Minimum 2 minute"
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
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

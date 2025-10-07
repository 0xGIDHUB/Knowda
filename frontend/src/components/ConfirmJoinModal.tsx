import React from "react";

interface ConfirmJoinModalProps {
  gameData: any;
  onCancel: () => void;
  onContinue: () => void;
}

const ConfirmJoinModal: React.FC<ConfirmJoinModalProps> = ({
  gameData,
  onCancel,
  onContinue,
}) => {
  if (!gameData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-600 rounded-xl shadow-lg p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4 text-center">
          Confirm Participation
        </h2>
        <p className="text-center mb-6">
          Confirm to participate in{" "}
          <span className="font-semibold">{gameData.title}</span>. <br />
          You have{" "}
          <span className="font-semibold">{gameData.no_of_questions}</span>{" "}
          questions to answer. <br />
          Each question has a duration of{" "}
          <span className="font-semibold">
            {(gameData.duration * 60) / gameData.no_of_questions}
          </span>{" "}
          seconds.
        </p>
        <div className="flex justify-center gap-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmJoinModal;

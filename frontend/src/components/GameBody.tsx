import GameInfoDetails from "./GameInfo";
import GameButtons from "./GameButtons";

export default function GameBody({
  passcode,
  max,
  reward_amount,
  duration,
  onInfo,
  onQuestions,
  onActivate,
  onDelete,
}: {
  passcode: string;
  current: number;
  max: number;
  reward_amount: number;
  duration: number;
  onInfo?: () => void;
  onQuestions?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div>
      <GameInfoDetails
        passcode={passcode}
        max={max}
        reward_amount={reward_amount}
        duration={duration}
      />
      <GameButtons
        onInfo={onInfo}
        onQuestions={onQuestions}
        onActivate={onActivate}
        onDelete={onDelete}
      />
    </div>
  );
}

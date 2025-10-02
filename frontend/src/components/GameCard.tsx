import GameTitle from "./GameTitle";
import GameBody from "./GameBody";

export default function GameCard({
  game,
  onDelete,
  onInfo,
  onQuestions,
  onActivate,
}: {
  game: any;
  onDelete?: (id: string) => void;
  onInfo?: () => void;
  onQuestions?: () => void;
  onActivate?: () => void; 
}) {
  return (
    <div className="bg-white rounded-xl shadow-md px-4 py-2 flex flex-col items-start h-[250px] text-[#22336c] border border-[#0b1636] hover:shadow-xl transition-shadow">
      <div className="w-full">
        <GameTitle title={game.title} />
      </div>
      <div className="mt-2 w-full flex-1 flex flex-col justify-between">
        <GameBody
          passcode={game.game_pass}
          current={game.current_no_of_participants}
          max={game.max_no_of_participants}
          reward_amount={game.reward_amount}
          duration={game.duration}
          onDelete={() => onDelete?.(game.id)}
          onInfo={onInfo}
          onQuestions={onQuestions}
          onActivate={onActivate}
        />
      </div>
    </div>
  );
}

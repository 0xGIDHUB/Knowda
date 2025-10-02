import GameReward from "./GameReward";

export default function GameInfoDetails({
  passcode,
  max,
  reward_amount,
  duration,   // <-- add here
}: {
  passcode: string;
  max: number;
  reward_amount: number;
  duration: number;   // <-- add here
}) {
  return (
    <div className="flex flex-row items-center justify-between w-full">
      <div>
        <h4 className="font-bold mb-2">Passcode: {passcode}</h4>
        <div className="flex items-center mb-2">
          <span className="mr-2">
            {/* Person Icon */}
            <svg width="22" height="22" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="5" stroke="#22336c" fill="none"><circle cx="32" cy="18.14" r="11.14"/><path d="M54.55,56.85A22.55,22.55,0,0,0,32,34.3h0A22.55,22.55,0,0,0,9.45,56.85Z"/></svg>
          </span>
          <span className="font-semibold">{max}</span>
        </div>

        {/* Duration Display */}
        <div className="flex items-center">
          <span className="mr-2">
            {/* Clock Icon */}
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#22336c"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span className="font-semibold">{duration} min</span>
        </div>
      </div>
      <GameReward reward_amount={reward_amount} />
    </div>
  );
}

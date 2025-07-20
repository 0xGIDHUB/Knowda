import { useWallet } from "@meshsdk/react";

export default function HomepageButtonsComponent() {
  const { connected } = useWallet();
  return (
    <div className="flex flex-row gap-12 justify-center items-center">
      {/* Create Game Button */}
      <div className="relative group">
        <button
          className={`parallelogram bg-[#0b1636] ${connected ? 'text-white scale-100 hover:scale-110 transition-transform duration-200' : 'text-black'} font-bold py-4 px-10 text-xl transform -skew-x-12 shadow-lg rounded-lg border border-white ${!connected ? 'cursor-not-allowed opacity-70' : ''}`}
          style={{ minWidth: '140px' }}
          disabled={!connected}
        >
          <span className="block transform skew-x-12">Create Game</span>
        </button>
        {/* Tooltip for not connected */}
        {!connected && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max text-xs rounded px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
            Connect Web3 Wallet!
          </div>
        )}
      </div>
      {/* Join Game Button */}
      <button
        className="parallelogram bg-[#0b1636] text-white font-bold py-4 px-10 text-xl transform -skew-x-12 scale-100 hover:scale-110 transition-transform duration-200 shadow-lg rounded-lg border border-white"
        style={{ minWidth: '140px' }}
      >
        <span className="block transform skew-x-12">Join Game</span>
      </button>
      <style jsx>{`
        .parallelogram {
          border: none;
          cursor: pointer;
          outline: none;
        }
      `}</style>
    </div>
  );
}

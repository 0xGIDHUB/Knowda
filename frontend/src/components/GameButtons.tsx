export default function GameButtons({
  onInfo,
  onQuestions,
  onActivate,
  onDelete,
}: {
  onInfo?: () => void;
  onQuestions?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-3 w-full justify-center items-center">
      {/* Edit Icon */}
      <button
        className="p-2 rounded-full hover:bg-[#22336c]/10"
        title="Edit Game"
        onClick={onInfo}
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.9401 5.42141L13.7701 2.43141C12.7801 1.86141 11.2301 1.86141 10.2401 2.43141L5.02008 5.44141C2.95008 6.84141 2.83008 7.05141 2.83008 9.28141V14.7114C2.83008 16.9414 2.95008 17.1614 5.06008 18.5814L10.2301 21.5714C10.7301 21.8614 11.3701 22.0014 12.0001 22.0014C12.6301 22.0014 13.2701 21.8614 13.7601 21.5714L18.9801 18.5614C21.0501 17.1614 21.1701 16.9514 21.1701 14.7214V9.28141C21.1701 7.05141 21.0501 6.84141 18.9401 5.42141ZM12.0001 15.2514C10.2101 15.2514 8.75008 13.7914 8.75008 12.0014C8.75008 10.2114 10.2101 8.75141 12.0001 8.75141C13.7901 8.75141 15.2501 10.2114 15.2501 12.0014C15.2501 13.7914 13.7901 15.2514 12.0001 15.2514Z"
            fill="#22336c"
          />
        </svg>
      </button>

      {/* Questions Icon */}
      <button
        className="p-2 rounded-full hover:bg-[#22336c]/10"
        title="Set Questions"
        onClick={onQuestions}
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M8 18h10.237L20 19.385V9h1a1 1 0 0 1 1 1v13.5L17.545 20H9a1 1 0 0 1-1-1v-1zm-2.545-2L1 19.5V4a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v12H5.455z"
              fill="#22336c"
            />
          </g>
        </svg>
      </button>

      {/* Trash Icon */}
      <button
        className="p-2 rounded-full hover:bg-[#22336c]/10"
        title="Delete Game"
        onClick={onDelete}
      >
        <svg
          fill="#22336c"
          width="25"
          height="25"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z" />
        </svg>
      </button>

      {/* Activate Button */}
      <button
        className="px-4 py-2 rounded-full bg-[#22336c] text-white font-bold hover:scale-105 active:scale-95 transition-transform duration-200 whitespace-nowrap"
        onClick={onActivate}
      >
        ACTIVATE
      </button>
    </div>
    
  );
}

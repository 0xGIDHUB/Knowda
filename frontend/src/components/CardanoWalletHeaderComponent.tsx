// An Example of how to create your own component
// This component is used in the _app.tsx file
// It displays the header for all pages in the application

import { CardanoWallet, useWallet } from "@meshsdk/react";

export default function CardanoWalletHeaderComponent() {
  const { connected } = useWallet();

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-5xl z-50 bg-[#0b1636]/60 border border-[#999999] rounded-xl shadow-lg">
      <div className="flex items-center justify-between px-8 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* Replace with your SVG or logo image if available */}
          <span className="text-2xl">❔</span>
          <span className="text-2xl font-bold text-white"> KnowIt</span>
        </div>
        {/* Status Circle & Wallet */}
        <div className={`relative flex items-center gap-3`}>
          <span
            className={`w-3 h-3 rounded-full block ${
              connected ? "bg-green-500 animate-radar" : "bg-gray-400"
            }`}
            title={connected ? "Wallet Connected" : "Wallet Not Connected"}
          />
        <CardanoWallet isDark={false} label={"Connect Web3"} persist={false} />
        </div>
      </div>
    </header>

    // <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-gray-900 text-white">
    //   <div className="text-2xl font-bold">MyCardanoDapp</div>
    //   <div className="flex items-center gap-2">
    //     {/* Status Circle */}
    //     <div
    //       className={`w-3 h-3 rounded-full ${
    //         connected ? "bg-green-500" : "bg-gray-400"
    //       }`}
    //       title={connected ? "Wallet Connected" : "Wallet Not Connected"}
    //     />
    //     <div className="text-black">
    //       <CardanoWallet
    //         isDark={true}
    //         label={"Connect Web3"}
    //         persist={true}
    //       />
    //     </div>
    //   </div>
    // </header>
  );
}

// This component is used in the _app.tsx file
// It displays the header for all pages in the application

import { CardanoWallet, useWallet } from "@meshsdk/react";

export default function CardanoWalletHeaderComponent() {
  const { connected } = useWallet();

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-5xl z-50 bg-[#0b1636]/60 border border-[#999999] rounded-xl shadow-lg">
      <div className="flex items-center justify-between px-8 py-3">
        {/* Logo */}
        <div className="flex items-center gap-0.5">
          {/* Replace with your SVG or logo image if available */}
          <span className="text-2xl font-bold text-white">Knowda</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 64 64" fill="#ffffff"><g fill="#ffffff" fill-rule="evenodd"><path d="M6.01 42.439h9.979L20 2H2z" /><ellipse cx="11" cy="54.354" rx="7.664" ry="7.646" /><path d="M40.249 2.064C28.612 2.789 22.531 9.378 22 21.296h11.74c.147-4.129 2.451-7.215 6.741-7.669c4.211-.447 8.205.555 9.415 3.434c1.307 3.11-1.627 6.724-3.022 8.241c-2.582 2.813-6.775 4.865-8.949 7.901c-2.131 2.973-2.51 6.886-2.674 11.675h10.346c.145-3.062.349-5.995 1.742-7.898c2.266-3.092 5.65-4.541 8.486-6.983c2.709-2.334 5.559-5.147 6.043-9.5C63.319 7.466 52.683 1.289 40.249 2.064" /><ellipse cx="40.516" cy="55.566" rx="6.532" ry="6.433" /></g></svg>
        </div>
        {/* Status Circle & Wallet */}
        <div className={`relative flex items-center gap-3`}>
          <span
            className={`w-3 h-3 rounded-full block ${connected ? "bg-green-500 animate-radar" : "bg-gray-400"
              }`}
            title={connected ? "Wallet Connected" : "Wallet Not Connected"}
          />
          <CardanoWallet isDark={false} label={"Connect Web3"} persist={true} />
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

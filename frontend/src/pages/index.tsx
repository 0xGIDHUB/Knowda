import HomepageButtonsComponent from "@/components/HomepageButtonsComponent";

export default function Home() {
  return (
    <main
  className="flex min-h-screen flex-col items-center justify-center bg-[#22336c] bg-cover bg-center overflow-hidden w-full h-screen text-white select-none relative"
  style={{
    minHeight: '100vh',
    height: '100vh',
    overflow: 'hidden',
    backgroundImage: "url('/backgroundImg.png')",
    backgroundBlendMode: 'overlay',
    backgroundColor: '#22336c'
  }}
>
  {/* Optionally, add a semi-transparent overlay for better blending */}
  <div className="absolute inset-0 bg-[#22336c]/80 pointer-events-none z-0"></div>
    {/* App Description */}
    <div className="flex flex-col items-center justify-center w-full h-full mt-16">
      <h4 className="text-white text-5xl md:text-5.5xl font-bold text-center mb-5 tracking-tight opacity-90" style={{ letterSpacing: '0.01em' }}>
        A Web3 Trivia Platform <br></br>Built On Cardano
      </h4>
      <p></p>
      <p className="text-base md:text-lg text-center font-light max-w-2xl opacity-90">
        Show off your knowledge, top the quiz leaderboard, and earn Ada rewards in the <br></br> Knowda App! 
      </p>
    </div>
    {/* Buttons */}
    <div className="mb-12">
      <HomepageButtonsComponent/>
    </div>
  </main>
  
  );
}

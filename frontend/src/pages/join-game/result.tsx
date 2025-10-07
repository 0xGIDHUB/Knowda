import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const { score, max } = router.query;
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1b2957] text-white text-center">
      <h1 className="text-5xl font-bold text-yellow-400 mb-6">🎉 Game Result 🎉</h1>
      <p className="text-3xl font-semibold mb-4">
        You scored <span className="text-green-400">{score}</span> / {max}
      </p>
      <p className="text-1xl font-light mb-4">
        Game leaderboard will be shared by the game host
      </p>
      <p className="text-lg text-gray-300">
        Leaving page in <span className="font-bold">{countdown}</span> seconds...
      </p>
    </div>
  );
}

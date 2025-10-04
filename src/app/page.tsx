import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 animate-fade-in-down">
          Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">AI Nail Art Studio</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up">
          Discover your next manicure without the commitment. Use our cutting-edge AI to virtually try on hundreds of nail designs on your own hands.
        </p>
        <div className="flex justify-center space-x-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Link
            href="/try-on"
            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-indigo-500/50"
          >
            Start Virtual Try-On
          </Link>
        </div>
      </div>
    </div>
  );
}
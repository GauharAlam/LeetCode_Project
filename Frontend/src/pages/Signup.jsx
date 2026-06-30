import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useTheme } from "../contexts/ThemeContext";

function Signup() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white p-4 transition-colors duration-300">
      <div className="mb-6 flex flex-col items-center">
        <img
          src="/algoforge-logo.png"
          alt="AlgoForge"
          className="h-16 w-16 rounded-full object-cover mb-2 shadow-lg"
        />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Algo<span className="text-primary">Forge</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create an account to track your progress and solve challenges
        </p>
      </div>

      <SignUp 
        appearance={{
          baseTheme: theme === 'dark' ? dark : undefined,
          variables: {
            colorPrimary: theme === 'dark' ? '#38bdf8' : '#0f172a',
          },
          elements: {
            card: "shadow-2xl border border-gray-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl",
          }
        }}
        signInUrl="/login"
        forceRedirectUrl="/"
      />
    </div>
  );
}

export default Signup;
import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

function Signup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-text-primary p-4">
      <div className="mb-6 flex flex-col items-center">
        <img
          src="/algoforge-logo.png"
          alt="AlgoForge"
          className="h-16 w-16 rounded-xl object-cover mb-3 shadow-2xl border border-border-subtle"
        />
        <h2 className="text-3xl font-bold text-text-primary tracking-tight font-display">
          Algo<span className="text-ember-400">Forge</span>
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Create an account to track your progress and solve challenges
        </p>
      </div>

      <SignUp 
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#E8722C',
          },
          elements: {
            card: "shadow-2xl border border-border-subtle bg-surface rounded-card",
          }
        }}
        signInUrl="/login"
        forceRedirectUrl="/"
      />
    </div>
  );
}

export default Signup;
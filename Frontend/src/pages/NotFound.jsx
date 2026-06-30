import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        {/* 404 Number */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="text-9xl font-bold bg-gradient-to-r from-ember-300 via-ember-400 to-ember-600 bg-clip-text text-transparent font-display"
        >
          404
        </motion.h1>

        <h2 className="text-2xl font-bold text-text-primary mt-4 font-display">Page Not Found</h2>
        <p className="text-text-secondary mt-3 text-lg leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            to="/"
            className="btn-ember px-8 py-3 text-sm font-semibold flex items-center justify-center rounded-control"
          >
            Go Home
          </Link>
          <Link
            to="/problems"
            className="btn-secondary-af px-8 py-3 text-sm font-semibold flex items-center justify-center rounded-control"
          >
            Browse Problems
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;

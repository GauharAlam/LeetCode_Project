import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center px-6">
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
          className="text-9xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent"
        >
          404
        </motion.h1>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            to="/"
            className="btn btn-primary btn-lg px-8 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
          >
            Go Home
          </Link>
          <Link
            to="/problems"
            className="btn btn-outline btn-lg px-8 rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
          >
            Browse Problems
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;


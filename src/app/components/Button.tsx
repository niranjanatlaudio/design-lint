import React, { useState, useEffect } from "react";
import { motion } from "framer-motion/dist/framer-motion";

function Button({ error, applyStyle }) {
  const [isLoading, setIsLoading] = useState(false);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    return () => {
      // Clear the timeout when the component is unmounted
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const handleClick = error => {
    if (!isLoading) {
      setIsLoading(true);

      applyStyle(error);

      const id = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      setTimerId(id);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98, opacity: 0.8 }}
      onClick={() => handleClick(error)}
      className={
        isLoading
          ? "loading-button disabled match-button"
          : "loading-button match-button"
      }
    >
      {isLoading ? (
        <div className="button-loading-dots match-button-loading">
          <span className="button-dot" />
          <span className="button-dot" />
          <span className="button-dot" />
        </div>
      ) : (
        <>Fix All</>
      )}
    </motion.button>
  );
}

export default Button;

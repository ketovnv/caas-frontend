import { motion, MotionConfig } from "motion/react";
import { observer } from "mobx-react-lite";
import { uiStore } from "@stores/ui.js";
import { router } from "@stores/router.js";

export const Etherium = observer((props) => {
  return (
    <MotionConfig
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        type: "spring",
        stiffness: 400,
        damping: 200,
        friction: 50,
        mass: 25,
      }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 784.3699951171875 1277.3800048828125"
        {...props}
      >
        <motion.g xmlns="http://www.w3.org/2000/svg" id="_1421394342400">
          <motion.g
            animate={{
              scale: uiStore.themeIsDark ? 1 : 0.9,
              fill: uiStore.theme.color,
            }}
          >
            <motion.polygon
              animate={{ fill: uiStore.theme.color }}
              fillRule="nonzero"
              points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54 "
            />
            <motion.polygon
              animate={{
                fill: router.isActiveEtherium
                  ? "hsl(45.87 94.99% 53%)"
                  : "hsl(201.53 56.99% 38%)",
              }}
              fillRule="nonzero"
              points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33 "
            />
            <motion.polygon
              animate={{
                fill: router.isActiveEtherium
                  ? "hsl(45.87 94.99% 53%)"
                  : "hsl(201.53 56.99% 38%)",
              }}
              fillRule="nonzero"
              points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89 "
            />
            <motion.polygon
              animate={{ fill: uiStore.theme.color }}
              fillRule="nonzero"
              points="392.07,1277.38 392.07,956.52 -0,724.89 "
            />
            <motion.polygon
              fill="#141414"
              fillRule="nonzero"
              points="392.07,882.29 784.13,650.54 392.07,472.33 "
            />

            <motion.polygon
              animate={{ fill: uiStore.theme.color }}
              fillRule="nonzero"
              points="0,650.54 392.07,882.29 392.07,472.33 "
            />
          </motion.g>
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
});

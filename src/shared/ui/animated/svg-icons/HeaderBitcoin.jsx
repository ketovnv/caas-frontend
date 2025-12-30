import React from "react";
import { motion } from "motion/react";
import { observer } from "mobx-react-lite";
import { ReactSVG } from "./ReactSVG.jsx";
import { uiStore } from "@stores/ui.js";

const FrontCoinSVG = ({ width = "1em", height = "1em", isDark = true }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={width}
    height={height}
  >
    <g fill="green">
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="#2F88FF"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        fill="#2F88FF"
        d="M20 16H25H27C29.2091 16 31 17.7909 31 20C31 22.2091 29.2091 24 27 24H20V16Z"
      />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        d="M20 16V24H27C29.2091 24 31 22.2091 31 20V20C31 17.7909 29.2091 16 27 16H25M20 16H16M20 16V12M20 16H25M25 16V12"
      />
      <path
        fill="#2F88FF"
        d="M20 24H29C31.2091 24 33 25.7909 33 28C33 30.2091 31.2091 32 29 32H25H20V24Z"
      />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        d="M20 32V24H29C31.2091 24 33 25.7909 33 28V28C33 30.2091 31.2091 32 29 32H25M20 32V36M20 32H16H25M20 32H25M25 32V36"
      />
    </g>
  </svg>
);

// Компонент вращающейся монеты
const HeaderBitcoin = observer(({ size = 50, toggleNavbarOpened }) => {
  // size - размер монеты в px

  return (
    // Контейнер для задания перспективы
    <div style={{ perspective: "1000px", display: "inline-block" }}>
      <motion.div
        onMouseDown={toggleNavbarOpened}
        // Основной контейнер монеты
        style={{
          width: size,
          height: size,
          position: "relative",
          transformStyle: "preserve-3d", // Включаем 3D-пространство для дочерних элементов
        }}
        // Анимация вращения
        variants={{ hover: { rotateX: 3600, rotateZ: 3600 } }}
        animate={{ rotateY: 360 }} // Вращаем на 360 градусов по оси Y
        transition={{
          duration: 6, // Длительность одного оборота (в секундах)
          ease: "linear", // Линейная анимация (постоянная скорость)
          repeat: Infinity, // Бесконечное повторение
        }}
      >
        {/* Лицевая сторона */}
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden", // Скрывать, когда элемент повернут назад
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FrontCoinSVG
            width={size * 0.9}
            height={size * 0.9}
            isDark={uiStore.themeIsDark}
          />{" "}
          {/* Немного уменьшаем SVG для отступов */}
        </motion.div>

        {/* Обратная сторона */}
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden", // Скрывать, когда элемент повернут назад
            transform: "rotateY(180deg)", // Изначально повернута на 180 градусов
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ReactSVG
            width={size * 0.9}
            height={size * 0.9}
            isDark={uiStore.themeIsDark}
          />
        </motion.div>
      </motion.div>
    </div>
  );
});

export default HeaderBitcoin;

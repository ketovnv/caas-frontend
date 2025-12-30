export function TronLink(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="3em"
      height="3em"
      {...props}
    >
      <defs>
        <linearGradient id="tronlink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF060A" />
          <stop offset="100%" stopColor="#C4342B" />
        </linearGradient>
      </defs>
      <path
        fill="url(#tronlink-grad)"
        d="M24 4L4 14l6 22 14 8 14-8 6-22L24 4zm0 4.36l14.62 7.32L34 36 24 42l-10-6-4.62-16.96L24 8.36z"
      />
      <path
        fill="url(#tronlink-grad)"
        d="M24 12l-10 5 3 12 7 4 7-4 3-12-10-5z"
      />
    </svg>
  );
}

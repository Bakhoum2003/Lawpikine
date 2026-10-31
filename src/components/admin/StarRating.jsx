// Note en étoiles sur 5 (étoiles pleines en jaune, vides en gris).
export default function StarRating({ rating, size = 16 }) {
  return (
    <span role="img" aria-label={`Note : ${rating} sur 5`} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <svg key={index} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" className={index <= rating ? "text-yellow-400" : "text-gray-300"} fill="currentColor">
          <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}

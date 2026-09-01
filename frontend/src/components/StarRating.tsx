import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export const StarRating = ({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = interactive ? i <= rating : i <= Math.round(rating);
    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange?.(i)}
        className={`focus:outline-none ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        aria-label={`${i} star${i !== 1 ? 's' : ''}`}
      >
        <Star
          size={size}
          fill={filled ? '#f59e0b' : 'none'}
          color={filled ? '#f59e0b' : '#d1d5db'}
        />
      </button>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};
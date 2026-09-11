import { Star } from 'lucide-react'

export const RatingStars = ({ rating = 0, max = 5, size = 16, showNumber = false }) => {
  const numRating = Number(rating) || 0

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const isFilled = i < Math.floor(numRating)
          const isHalf = i === Math.floor(numRating) && numRating % 1 >= 0.5

          return (
            <Star
              key={i}
              size={size}
              className={`${
                isFilled || isHalf
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600 fill-transparent'
              } transition-colors`}
            />
          )
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-bold text-amber-400">
          {numRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default RatingStars

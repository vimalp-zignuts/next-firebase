"use client";

interface QuantityControlProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export default function QuantityControl({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  disabled = false,
  className = "",
}: QuantityControlProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value);
    }
  };

  return (
    <div className={`flex items-center space-x-1 sm:space-x-2 ${className}`}>
      <button
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm sm:text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        -
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-12 sm:w-16 text-center border rounded py-1 text-sm sm:text-base disabled:bg-gray-100"
      />
      <button
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm sm:text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}

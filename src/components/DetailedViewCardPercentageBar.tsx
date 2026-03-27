// Props type for the percentage bar component
// Expects a numeric percentage value (0–100)
type Props = {
    percentage: number;
};

// DetailedViewCardPercentageBar renders a horizontal progress bar
// representing how much of the manga has been read
export default function DetailedViewCardPercentageBar({
    percentage,
}: Props) {
    return (
        // Outer container representing the full progress bar track
        <div className="h-1 w-full rounded-full bg-[VAR(--text-clr-2)] overflow-hidden">
            {/* Inner bar showing actual progress
                Width is dynamically set based on the percentage prop */}
            <div
                className="h-full rounded-full bg-green-300"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
export function formatCompressedPercentage (num: number) {
	return Math.round(num * 100)
}

/**
 * @todo rename: bytesToMb
 */
export function calculateToMb (num: number) {
	return (num / (1024*1024)).toFixed(2)
}

export function getFormattedTimestamp(date: number) {
	const newDate = new Date(date);
	const year = newDate.getFullYear();
	const day = newDate.getDate();
	const timestamp = newDate.toLocaleTimeString();

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	]

	const monthName = months[newDate.getMonth()]

	return `${monthName} ${day}, ${year} ${timestamp}`;
}

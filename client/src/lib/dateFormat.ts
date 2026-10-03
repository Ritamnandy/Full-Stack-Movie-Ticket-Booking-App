
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString( 'en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute:'numeric'
    });
}
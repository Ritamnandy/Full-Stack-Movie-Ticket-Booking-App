
const formatMovieTime = (runtime: number) => {
    const timeInHours = runtime ? Math.floor( runtime / 60 ) : 0;
    const timeInMinutes = runtime ? runtime % 60 : 0;
    return `${timeInHours}h ${timeInMinutes}m`;
};

export { formatMovieTime };
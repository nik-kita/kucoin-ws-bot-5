export default function splitArrOnChanks<T = any>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0, j = array.length; i < j; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }

    return result;
}

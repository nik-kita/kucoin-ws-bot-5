export function pause(time: number = 1000) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, time);
    });
}

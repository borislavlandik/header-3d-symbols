export function map(value: number, valueMin: number, valueMax: number, objectiveMin: number, objectiveMax: number): number {
    return (value - valueMin) / (valueMax - valueMin) * (objectiveMax - objectiveMin) + objectiveMin;
}
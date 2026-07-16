export const calculateEstimatedWaitTime = (waitingCount, averageTime) => {
  const normalizedWaitingCount = Number(waitingCount) || 0;
  const normalizedAverageTime = Number(averageTime) || 0;

  return normalizedWaitingCount * normalizedAverageTime;
};

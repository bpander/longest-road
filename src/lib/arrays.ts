
export const removeFirst = <T>(arr: T[], element: T): T[] => {
  const indexToRemove = arr.indexOf(element);
  if (indexToRemove === -1) {
    return arr;
  }
  const clone = [ ...arr ];
  clone.splice(indexToRemove, 1);

  return clone;
};

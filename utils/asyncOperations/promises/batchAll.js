module.exports = async (
  array,
  batchSize,
  getPromiseFn,
  params = {}
) => {
  const elements = array.slice();

  const promises = new Array(batchSize).fill(
    Promise.resolve()
  );

  // Recursively chain the next Promise to the currently executed Promise
  function chainNext(currentPromise) {
    if (elements.length) {
      const element = elements.shift();

      return currentPromise.then(() => {
        const nextPromise = getPromiseFn(
          element,
          params
        );

        return chainNext(nextPromise);
      });
    }

    return currentPromise;
  }

  await Promise.all(promises.map(chainNext));
};

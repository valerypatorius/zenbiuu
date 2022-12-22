/**
 * Parse video fragment tags
 */
export function parseFragTags (tagList: string[][]): Array<Record<string, any>> {
  const filteredTags = tagList.reduce((result: Array<Record<string, string[]>>, item) => {
    const tagName = item.shift();

    if (tagName !== undefined) {
      result.push({
        [tagName]: item,
      });
    }

    return result;
  }, []);

  const filteredProps = filteredTags.reduce((result: Array<Record<string, any>>, item) => {
    Object.entries(item).forEach(([tagName, rawProps]) => {
      /**
       * Do not bother if we have nothing to parse
       */
      if (rawProps.length !== 1 || rawProps.every((rawProp) => !rawProp.includes(','))) {
        result.push({
          [tagName]: rawProps,
        });

        return;
      }

      const parsedProps = rawProps[0].split(',').reduce((resultProps: Record<string, string>, rawPair) => {
        const [name, value] = rawPair.split('=');

        resultProps[name] = value.replace(/"/g, '');

        return resultProps;
      }, {});

      result.push({
        [tagName]: parsedProps,
      });
    });

    return result;
  }, []);

  return filteredProps;
}

const recent: string[] = [];

export const track = (id: string) => {
  const i = recent.indexOf(id);
  if (i >= 0) recent.splice(i, 1);
  recent.unshift(id);
  recent.length = Math.min(recent.length, 8);
};

export const getRecent = () => [...recent];

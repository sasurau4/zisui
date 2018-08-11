import { StoryKind } from "@storybook/addons";

export type Story = {
  kind: string,
  story: string,
};

export type Task<T, S> = (runner: S) => Promise<T>;

export function sleep(time: number = 0) {
  return new Promise(res => {
    setTimeout(() => res(), time);
  });
}

export function flattenStories(stories: StoryKind[]) {
  return stories.reduce(
    (acc, storyKind) => [...acc, ...storyKind.stories.map(story => ({ kind: storyKind.kind, story }))], [] as Story[]
  );
}

export const execParalell = <T, S>(tasks: Task<T, S>[], runners: S[]) => {
  const copied = tasks.slice();
  const results = <T[]>[];
  const p = runners.length;
  if (!p) throw new Error("No runners");
  return Promise.all(
    new Array(p).fill("").map((_, i) => new Promise((res, rej) => {
      function next(): Promise<number | void> {
        const t = copied.shift();
        return t == null ? Promise.resolve(res()) : t(runners[i])
          .then((r) => results.push(r))
          .then(next)
          .catch(rej);
      }
      return next();
    }))
  ).then(() => results);
};

export type VoteData = {
  title: string;
  closed: boolean;
  votedUser: string[];
  options: {
    [key: string]: {
      count: number;
    };
  };
};

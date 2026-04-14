export type TeamByRunId = {
  type: "run_id";
  run_id: number;
};

export type TeamByBoss = {
  type: "boss";
  boss: string;
};

export type TeamParam = TeamByRunId | TeamByBoss;

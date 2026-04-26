export type TeamByRecordId = {
  type: "record_id";
  record_id: number;
};

export type TeamByBoss = {
  type: "boss";
  boss: string;
};

export type TeamParam = TeamByRecordId | TeamByBoss;

// TRY TO HAVE THIS AS THE MAIN HUB FOR ADJUSTING POINT VALUES
/**
 * @info object that stores all point values in one neat place for easy maintaining.
 * @get get point value for key value
 */
const pointRewards = new Map<string, number>;
pointRewards.set('event_participation', 5);
pointRewards.set('event_hosting', 10);
pointRewards.set('forum_bump', 5);
pointRewards.set('learner_half', 5);
pointRewards.set('learner_full', 10);
pointRewards.set('split_low', 10);
pointRewards.set('split_medium', 20);
pointRewards.set('split_high', 30);

export { pointRewards };
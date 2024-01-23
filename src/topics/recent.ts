import db from '../database';
import plugins from '../plugins';
import posts from '../posts';

interface Terms {
    day: number;
    week: number;
    month: number;
    year: number;
}

interface Options {
    uid: string;
    start: number;
    stop: string;
    term: string;
}

interface sortedTopics {
    cids: string;
    uid: string;
    start: number;
    stop: number;
    filter: string;
    sort: string;
}

interface singleTopic {
    tid: string;
    cid: string;
    uid: string;
    mainPid: string;
    postcount: number;
    viewcount: number;
    postercount: number;
    deleted: boolean;
    locked: boolean;
    pinned: boolean;
    pinExpiry: Date;
    timestamp: Date;
    upvotes: number;
    downvotes: number;
    lastposttime: number;
    deleterUid:number;
}

interface latestTopics {
    topics: unknown;
    nextStart: number;
}

interface Topic {
    terms: Terms;
    getRecentTopics(cid: string, uid: string, start: number, stop: number, filter: string): Promise<unknown>;
    getLatestTopics(options: Options): Promise<latestTopics>;
    getLatestTidsFromSet(set: string, start: number, stop: string, term: string): Promise<unknown>;
    updateLastPostTimeFromLastPid(tid: string): Promise<void>;
    updateLastPostTime(tid: string, lastposttime: Date): Promise<void>;
    updateRecent(tid: string, timestamp: Date): Promise<void>;
    //  In a different file not yet translated to typescript
    getSortedTopics(arg0: sortedTopics): unknown;
    getTopics(arg0: unknown, arg1: Options): unknown;
    getLatestUndeletedPid(arg0: string): unknown;
    setTopicField(arg0: string, arg1: string, arg2: Date): unknown;
    getTopicFields(arg0: string, arg1: string[]): singleTopic;
}

export default function (Topics: Topic) {
    const terms: Terms = {
        day: 86400000,
        week: 604800000,
        month: 2592000000,
        year: 31104000000,
    };

    Topics.getRecentTopics = async function (cid: string, uid: string, start: number, stop: number, filter: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return await Topics.getSortedTopics({
            cids: cid,
            uid: uid,
            start: start,
            stop: stop,
            filter: filter,
            sort: 'recent',
        });
    };

    /* not an orphan method, used in widget-essentials */
    Topics.getLatestTopics = async function (options: Options) {
        // uid, start, stop, term
        const tids = await Topics.getLatestTidsFromSet('topics:recent', options.start, options.stop, options.term);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const topics = await Topics.getTopics(tids, options);
        return { topics: topics, nextStart: parseInt(options.stop, 10) + 1 };
    };

    Topics.getLatestTidsFromSet = async function (set: string, start: number, stop: string, term: string) {
        let since: number = terms.day;
        if (terms[term]) {
            since = terms[term] as number;
        }

        const count: string | number = parseInt(stop, 10) === -1 ? stop : parseInt(stop, 10) - start + 1;
        return await db.getSortedSetRevRangeByScore(set, start, count, '+inf', Date.now() - since);
    };

    Topics.updateLastPostTimeFromLastPid = async function (tid: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const pid = await Topics.getLatestUndeletedPid(tid);
        if (!pid) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const timestamp = await posts.getPostField(pid, 'timestamp');
        if (!timestamp) {
            return;
        }
        await Topics.updateLastPostTime(tid, timestamp);
    };

    Topics.updateLastPostTime = async function (tid: string, lastposttime: Date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await Topics.setTopicField(tid, 'lastposttime', lastposttime);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const topicData = await Topics.getTopicFields(tid, ['cid', 'deleted', 'pinned']);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.sortedSetAdd(`cid:${topicData.cid}:tids:lastposttime`, lastposttime, tid);

        await Topics.updateRecent(tid, lastposttime);

        if (!topicData.pinned) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.sortedSetAdd(`cid:${topicData.cid}:tids`, lastposttime, tid);
        }
    };

    Topics.updateRecent = async function (tid: string, timestamp: Date) {
        let data = { tid: tid, timestamp: timestamp };
        if (plugins.hooks.hasListeners('filter:topics.updateRecent')) {
            data = await plugins.hooks.fire('filter:topics.updateRecent', { tid: tid, timestamp: timestamp });
        }
        if (data && data.tid && data.timestamp) {
            await db.sortedSetAdd('topics:recent', data.timestamp, data.tid);
        }
    };
};

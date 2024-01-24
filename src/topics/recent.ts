/*import db from '../database';
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
    stop: string | number;
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

interface Update {
    tid: string;
    timestamp: Date;
}

interface Topic {
    terms: Terms;
    getRecentTopics(cid: string, uid: string, start: number, stop: number, filter: string): Promise<unknown>;
    getLatestTopics(options: Options): Promise<latestTopics>;
    getLatestTidsFromSet(set: string, start: number, stop: string | number, term: string): Promise<unknown>;
    updateLastPostTimeFromLastPid(tid: string): Promise<void>;
    updateLastPostTime(tid: string, lastposttime: Date): Promise<void>;
    updateRecent(tid: string, timestamp: Date): Promise<void>;
    //  In a different file not yet translated to typescript
    getSortedTopics(arg0: sortedTopics): unknown;
    getTopics(arg0: unknown, arg1: Options): unknown;
    getLatestUndeletedPid(arg0: string): unknown;
    setTopicField(arg0: string, arg1: string, arg2: Date): unknown;
    getTopicFields(arg0: string, arg1: string[]): Promise<singleTopic>;
}

export = function (Topics: Topic) {
    const terms: Terms = {
        day: 86400000,
        week: 604800000,
        month: 2592000000,
        year: 31104000000,
    };

    Topics.getRecentTopics = async function (cid, uid, start, stop, filter) {
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

     not an orphan method, used in widget-essentials 
    Topics.getLatestTopics = async function (options: Options) {
        // uid, start, stop, term
        const tids = await Topics.getLatestTidsFromSet('topics:recent', options.start, options.stop, options.term);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const topics = await Topics.getTopics(tids, options);
        
        if (typeof options.stop === 'string') {
            return { topics: topics, nextStart: parseInt(options.stop, 10) + 1 };
        }
        
        return { topics: topics, nextStart: options.stop + 1 };

        const tids = await Topics.getLatestTidsFromSet('topics:recent', options.start, options.stop, options.term);
        const topics = await Topics.getTopics(tids, options);
        return { topics: topics, nextStart: options.stop + 1 };
    };

    Topics.getLatestTidsFromSet = async function (set: string, start: number, stop: number | string, term: string) {
        let since: number  = terms.day;
        if (terms[term]) {
            since = terms[term] as number;
        }

        let count :string | number;
        if (typeof stop === 'string') {
            const stopInt: number = parseInt(stop, 10);
            count = stopInt === -1 ? stop : stopInt - start + 1;
        } else {
            count = stop - start + 1;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return await db.getSortedSetRevRangeByScore(set, start, count, '+inf', Date.now() - since) as string[];

        let since = terms.day;
        if (terms[term]) {
            since = terms[term];
        }

        const count = parseInt(stop, 10) === -1 ? stop : stop - start + 1;
        return await db.getSortedSetRevRangeByScore(set, start, count, '+inf', Date.now() - since);
    };

    Topics.updateLastPostTimeFromLastPid = async function (tid) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const pid = await Topics.getLatestUndeletedPid(tid);
        if (!pid) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const timestamp = await posts.getPostField(pid, 'timestamp') as Date;
        if (!timestamp) {
            return;
        }
        await Topics.updateLastPostTime(tid, timestamp);
    };

    Topics.updateLastPostTime = async function (tid, lastposttime) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await Topics.setTopicField(tid, 'lastposttime', lastposttime);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const topicData: singleTopic = await Topics.getTopicFields(tid, ['cid', 'deleted', 'pinned']);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.sortedSetAdd(`cid:${topicData.cid}:tids:lastposttime`, lastposttime, tid);

        await Topics.updateRecent(tid, lastposttime);

        if (!topicData.pinned) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.sortedSetAdd(`cid:${topicData.cid}:tids`, lastposttime, tid);
        }
    };

    Topics.updateRecent = async function (tid, timestamp) {
        let data: Update = { tid: tid, timestamp: timestamp };
        if (plugins.hooks.hasListeners('filter:topics.updateRecent')) {
            data = await plugins.hooks.fire('filter:topics.updateRecent', { tid: tid, timestamp: timestamp }) as Update;
        }
        if (data && data.tid && data.timestamp) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.sortedSetAdd('topics:recent', data.timestamp, data.tid);
        }
    };
}
*/

'use strict';

import db from '../database';
import plugins from '../plugins';
import posts from '../posts';

module.exports = function (Topics) {
    const terms = {
        day: 86400000,
        week: 604800000,
        month: 2592000000,
        year: 31104000000,
    };

    Topics.getRecentTopics = async function (cid, uid, start, stop, filter) {
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
    Topics.getLatestTopics = async function (options) {
        // uid, start, stop, term
        console.log("passed first line")
        const tids = await Topics.getLatestTidsFromSet('topics:recent', options.start, options.stop, options.term);
        console.log("passed third line")
        const topics = await Topics.getTopics(tids, options);
        console.log("passed fourth line")
        return { topics: topics, nextStart: options.stop + 1 };
    };

    Topics.getLatestTidsFromSet = async function (set, start, stop, term) {
        let since = terms.day;
        console.log("passed second line")
        if (terms[term]) {
            since = terms[term];
        }

        const count = parseInt(stop, 10) === -1 ? stop : stop - start + 1;
        return await db.getSortedSetRevRangeByScore(set, start, count, '+inf', Date.now() - since);
    };

    Topics.updateLastPostTimeFromLastPid = async function (tid) {
        const pid = await Topics.getLatestUndeletedPid(tid);
        if (!pid) {
            return;
        }
        const timestamp = await posts.getPostField(pid, 'timestamp');
        if (!timestamp) {
            return;
        }
        await Topics.updateLastPostTime(tid, timestamp);
    };

    Topics.updateLastPostTime = async function (tid, lastposttime) {
        await Topics.setTopicField(tid, 'lastposttime', lastposttime);
        const topicData = await Topics.getTopicFields(tid, ['cid', 'deleted', 'pinned']);

        await db.sortedSetAdd(`cid:${topicData.cid}:tids:lastposttime`, lastposttime, tid);

        await Topics.updateRecent(tid, lastposttime);

        if (!topicData.pinned) {
            await db.sortedSetAdd(`cid:${topicData.cid}:tids`, lastposttime, tid);
        }
    };

    Topics.updateRecent = async function (tid, timestamp) {
        let data = { tid: tid, timestamp: timestamp };
        if (plugins.hooks.hasListeners('filter:topics.updateRecent')) {
            data = await plugins.hooks.fire('filter:topics.updateRecent', { tid: tid, timestamp: timestamp });
        }
        if (data && data.tid && data.timestamp) {
            await db.sortedSetAdd('topics:recent', data.timestamp, data.tid);
        }
    };
};
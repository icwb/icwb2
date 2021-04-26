import { CronJob } from 'cron';

const timezone = 'Asia/Jakarta';

export function ScheduleEveryNMinutes(n: number, task: () => any) {
  return new CronJob(`0 */${n} * * * *`, task, null, true, timezone);
}

export function ScheduleEveryNHours(n: number, task: () => any) {
  return new CronJob(`0 0 */${n} * * *`, task, null, true, timezone);
}

export function ScheduleEveryHour(task: () => any) {
  return new CronJob('0 0 */1 * * *', task, null, true, timezone);
}

export function ScheduleEveryTenMinutes(task: () => any) {
  return new CronJob('0 */10 * * * *', task, null, true, timezone);
}

export function ScheduleEveryFiveMinutes(task: () => any) {
  return new CronJob('0 */5 * * * *', task, null, true, timezone);
}

export function ScheduleOneHour(task: () => any) {
  return new CronJob('0 0 1 * * *', task, null, true, timezone);
}

export function ScheduleTenMinutes(task: () => any) {
  return new CronJob('0 10 * * * *', task, null, true, timezone);
}

export function Schedule5Minutes(task: () => any) {
  return new CronJob('0 5 * * * *', task, null, true, timezone);
}

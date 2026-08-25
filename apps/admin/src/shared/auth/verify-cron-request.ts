import { isAuthorizedBearerRequest } from '@repo/helpers/is-authorized-bearer-request';

export const isAuthorizedCronRequest = (req: Request): boolean =>
  isAuthorizedBearerRequest(req, process.env['CRON_SECRET']);

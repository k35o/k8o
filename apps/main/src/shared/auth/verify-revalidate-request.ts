import { isAuthorizedBearerRequest } from '@repo/helpers/is-authorized-bearer-request';

export const isAuthorizedRevalidateRequest = (req: Request): boolean =>
  isAuthorizedBearerRequest(req, process.env['REVALIDATE_SECRET']);

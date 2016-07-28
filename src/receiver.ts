import { createHmac } from 'crypto';

import {
  Request, Response, NextFunction, RequestHandler
}  from 'express-serve-static-core';
import * as Q from 'q';
Q.longStackSupport = true;

import { HTTPError } from './apiClient';

export interface middlewareOption {
  ChannelSecret: string,
}

export const EventType = {
  Message: '138311609000106303',
  Operation: '138311609100106403'
};

export enum OperationType {
  AddedAsFriend = 4,
  BlockedAccount = 8
}

const err470 = new Error(
  'Unable to process the contents of the received request') as
  HTTPError;
err470.status = 470;

export function middlewareFactory(
  option: middlewareOption): RequestHandler {
  const secret = option.ChannelSecret;

  function validateSignature(
    req: Request, signature: string): Q.Promise<boolean> {

    const logErr = (err: Error) => {
      console.error('validateSignature err', err);
      console.error(err.stack);
    };
    const defer = Q.defer<boolean>();

    let readBuffer = new Buffer(0);
    const doneRead = () => {
      try {
        req.body = req.body || JSON.parse(readBuffer.toString());
      } catch (err) {
        logErr(err);
        defer.reject(err);
      }
    };

    req
      .on('error', err => {
        logErr(err);
        defer.reject(err);
      })
      .on('data', (data: Buffer) => {
        readBuffer = Buffer.concat([readBuffer, data]);
      })
      .on('end', doneRead)
      .on('close', doneRead)
      ;

    try {
      const hmac = createHmac('sha256', secret);

      hmac
        .on('readable', () => {
          try {
            const digest = hmac.read() as Buffer;
            defer.resolve(
              !!digest && digest.toString('base64') === signature);
          } catch (err) {
            logErr(err);
            defer.resolve(false);
          }
        })
        .on('error', err => {
          logErr(err);
          defer.resolve(false);
        })
        ;

      req.pipe(hmac);
      return defer.promise;
    } catch (err) {
      logErr(err);
      return Q(false);
    }
  }

  return function(
    req: Request, res: Response, next: NextFunction) {

    if (req.method !== 'POST') { throw err470; }

    const signature =
      req.header('X-Line-ChannelSignature') ||
      req.header('X-LINE-ChannelSignature');

    validateSignature(req, signature)
      .then(validated => {
        if (!validated) { throw err470; }

        const results: any[] = req.body && req.body.result;
        if (!Array.isArray(results)) { throw err470; }

        req.body = results;
      })
      .then(next)
      .fail(err => {
        console.error('receiver err', err);
        console.error(err.stack);
        throw err470;
      });
  };
}

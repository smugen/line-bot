import { IncomingMessage } from 'http';

import * as Q from 'q';
import * as request from 'request';

import { BaseEvent } from './event';

const profileEndpoint = 'https://trialbot-api.line.me/v1/profiles';
const postEventEndpoint = 'https://trialbot-api.line.me/v1/events';

export interface APIClientOption {
  ChannelID: string,
  ChannelSecret: string,
  ChannelMID: string,
  profileEndpoint?: string,
  postEventEndpoint?: string
}

export interface HTTPError extends Error {
  status?: number,
  getResponse?: () => IncomingMessage,
  body?: any
}

export type APICallback = (err: HTTPError, result: any) => void;

const _headers = Symbol('_headers');
const _profileEndpoint = Symbol('_profileEndpoint');
const _postEventEndpoint = Symbol('_postEventEndpoint');

export class LineAPIClient {
  constructor(option: APIClientOption) {
    option = option || {} as APIClientOption;
    this[_headers] = {
      'X-Line-ChannelID': option.ChannelID,
      'X-Line-ChannelSecret': option.ChannelSecret,
      'X-Line-Trusted-User-With-ACL': option.ChannelMID
    };
    this[_profileEndpoint] =
      option.profileEndpoint || profileEndpoint;
    this[_postEventEndpoint] =
      option.postEventEndpoint || postEventEndpoint;
  }

  getProfiles(mids: string[], cb?: APICallback): Q.Promise<any> {
    const options = {
      url: this[_profileEndpoint],
      method: 'GET',
      headers: this[_headers],
      qs: { mids: mids.join(',') },
      json: true
    };

    return Q.nfcall(request, options)
      .spread((res: IncomingMessage, body: any) => {
        if (res.statusCode >= 400) {
          const err = new Error(res.statusMessage) as HTTPError;
          err.status = res.statusCode;
          err.getResponse = () => res;
          err.body = body;
          throw err;
        }
        return body;
      })
      .nodeify(cb);
  }

  getProfilesMap(mids: string[], cb?: APICallback): Q.Promise<any> {
    return this.getProfiles(mids)
      .then(result => {
        const map = {};
        let contacts: any[];
        if ((contacts = result.contacts) && contacts.length &&
          contacts.forEach instanceof Function) {
          contacts.forEach(contact => {
            if (typeof contact.mid === 'string') {
              map[contact.mid] = contact;
            }
          });
        }
        return map;
      })
      .nodeify(cb)
  }

  post(event: BaseEvent, cb?: APICallback): Q.Promise<any> {
    const options = {
      url: this[_postEventEndpoint],
      method: 'POST',
      headers: this[_headers],
      json: event
    };

    return Q.nfcall(request, options)
      .spread((res: IncomingMessage, body: any) => {
        if (res.statusCode >= 400) {
          const err = new Error(res.statusMessage) as HTTPError;
          err.status = res.statusCode;
          err.getResponse = () => res;
          err.body = body;
          throw err;
        }
        return body;
      })
      .nodeify(cb);
  }
}

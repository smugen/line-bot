import * as Q from 'q';
import * as request from 'request';

import { BaseEvent } from './event';

const profileEndpoint = 'https://trialbot-api.line.me/v1/profiles';
const postEventEndpoint = 'https://trialbot-api.line.me/v1/events';

export interface APIClientOption {
  ChannelID: string,
  ChannelSecret: string,
  ChannelMID: string,
  Endpoint?: string
}

export type APICallback = (err: Error, result: any) => void;

const _headers = Symbol('_headers');
const _endpoint = Symbol('_endpoint');

export class BaseAPIClient {
  constructor(option: APIClientOption) {
    option = option || {} as APIClientOption;
    this[_headers] = {
      'X-Line-ChannelID': option.ChannelID,
      'X-Line-ChannelSecret': option.ChannelSecret,
      'X-Line-Trusted-User-With-ACL': option.ChannelMID
    };
    this[_endpoint] = option.Endpoint;
  }
}

//     ____             _____ __
//    / __ \_________  / __(_) /__
//   / /_/ / ___/ __ \/ /_/ / / _ \
//  / ____/ /  / /_/ / __/ / /  __/
// /_/   /_/   \____/_/ /_/_/\___/
export class ProfileAPIClient extends BaseAPIClient {
  constructor(option: APIClientOption) {
    option = option || {} as APIClientOption;
    option.Endpoint = option.Endpoint || profileEndpoint;
    super(option);
  }

  getProfiles(mids: string[], cb?: APICallback): Q.Promise<any> {
    const options = {
      url: this[_endpoint],
      method: 'GET',
      headers: this[_headers],
      qs: { mids: mids.join(',') },
      json: true
    };

    return Q.nfcall(request, options)
      .spread((res, body) => Q(body))
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
        return Q(map);
      })
      .nodeify(cb)
  }
}

//     ____  ____  ___________   ______                 __
//    / __ \/ __ \/ ___/_  __/  / ____/   _____  ____  / /_
//   / /_/ / / / /\__ \ / /    / __/ | | / / _ \/ __ \/ __/
//  / ____/ /_/ /___/ // /    / /___ | |/ /  __/ / / / /_
// /_/    \____//____//_/    /_____/ |___/\___/_/ /_/\__/
export class POSTEventAPIClient extends BaseAPIClient {
  constructor(option: APIClientOption) {
    option = option || {} as APIClientOption;
    option.Endpoint = option.Endpoint || postEventEndpoint;
    super(option);
  }

  post(event: BaseEvent, cb?: APICallback): Q.Promise<any> {
    const options = {
      url: this[_endpoint],
      method: 'POST',
      headers: this[_headers],
      json: event
    };

    return Q.nfcall(request, options)
      .spread((res, body) => Q(body))
      .nodeify(cb);
  }
}

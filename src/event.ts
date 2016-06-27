import { BaseContent } from './content';

export interface BaseEventParam {
  to?: string[]
}

export interface SingleEventParam extends BaseEventParam {
  content?: BaseContent
}

export interface MultipleEventParam extends BaseEventParam {
  messages?: BaseContent[]
  messageNotified?: number
}

const _to = Symbol('_to');

export class BaseEvent {
  get to(): string[] { return this[_to].slice(); }
  set to(mids: string[]) {
    if (mids && mids.length && mids.forEach instanceof Function) {
      const _mids = [];
      mids.forEach(mid => {
        if (typeof mid === 'string') { _mids.push(mid); }
      });
      this[_to] = _mids;
    }
  }

  get toChannel(): number { return 1383378250; }

  get eventType(): string { return ''; }

  get content(): any { return {}; }

  constructor(param?: BaseEventParam) {
    param = param || {} as BaseEventParam;
    this[_to] = [];
    this.to = param.to;
  }

  toJSON(): any {
    return {
      to: this.to.slice(0, 150),
      toChannel: this.toChannel,
      eventType: this.eventType,
      content: this.content
    };
  }

  inspect(): any { return this.toJSON(); }
}

//    _____ _             __        ______                 __
//   / ___/(_)___  ____ _/ /__     / ____/   _____  ____  / /_
//   \__ \/ / __ \/ __ `/ / _ \   / __/ | | / / _ \/ __ \/ __/
//  ___/ / / / / / /_/ / /  __/  / /___ | |/ /  __/ / / / /_
// /____/_/_/ /_/\__, /_/\___/  /_____/ |___/\___/_/ /_/\__/
//              /____/
const _content = Symbol('_content');

export class SingleEvent extends BaseEvent {
  get eventType(): string { return '138311608800106203'; }

  get content(): BaseContent { return this[_content]; }
  set content(content: BaseContent) {
    if (content instanceof BaseContent) { this[_content] = content; }
  }

  constructor(param?: SingleEventParam) {
    param = param || {} as SingleEventParam;
    super(param);
    this[_content] = {};
    this.content = param.content;
  }
}

//     __  ___      ____  _       __        ______                 __
//    /  |/  /_  __/ / /_(_)___  / /__     / ____/   _____  ____  / /_
//   / /|_/ / / / / / __/ / __ \/ / _ \   / __/ | | / / _ \/ __ \/ __/
//  / /  / / /_/ / / /_/ / /_/ / /  __/  / /___ | |/ /  __/ / / / /_
// /_/  /_/\__,_/_/\__/_/ .___/_/\___/  /_____/ |___/\___/_/ /_/\__/
//                     /_/
export interface MultipleEventContent {
  messages: BaseContent[]
  messageNotified: number
}

export class MultipleEvent extends BaseEvent {
  get eventType(): string { return '140177271400161403'; }

  get content(): MultipleEventContent {
    return {
      messages: this.messages,
      messageNotified: this.messageNotified
    };
  }

  get messages(): BaseContent[] {
    return this[_content].messages.slice();
  }
  set messages(msgs: BaseContent[]) {
    if (msgs && msgs.length && msgs.forEach instanceof Function) {
      const _msgs = [];
      msgs.forEach(msg => {
        if (msg instanceof BaseContent) { _msgs.push(msg); }
      });
      this[_content].messages = _msgs;
    }
  }

  get messageNotified(): number {
    return this[_content].messageNotified;
  }
  set messageNotified(num: number) {
    if (typeof num === 'number' && num >= 0) {
      this[_content].messageNotified =
        Math.min(Math.floor(num),
          this.messages.length ? (this.messages.length - 1) : 0);
    }
  }

  constructor(param?: MultipleEventParam) {
    param = param || {} as MultipleEventParam;
    super(param);
    this[_content] = {
      messages: [],
      messageNotified: 0
    };
    this.messages = param.messages;
    this.messageNotified = param.messageNotified;
  }

  addMessage(msg: BaseContent) {
    if (msg instanceof BaseContent) {
      this[_content].messages.push(msg);
    }
  }

  addMessages(msgs: BaseContent[]) {
    if (msgs && msgs.length && msgs.forEach instanceof Function) {
      msgs.forEach(msg => this.addMessage(msg));
    }
  }
}

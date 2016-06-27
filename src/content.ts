enum ContentType {
  Base = 0, Text, Image, Video, Audio,
  Location = 7, Sticker,
  RichMessage = 12
}

export class BaseContent {
  get contentType(): number { return ContentType.Base; }
  get toType(): number { return 1; }

  toJSON(): any {
    return {
      contentType: this.contentType,
      toType: this.toType
    };
  }

  inspect(): any { return this.toJSON(); }
}

//   ______          __
//  /_  __/__  _  __/ /_
//   / / / _ \| |/_/ __/
//  / / /  __/>  </ /_
// /_/  \___/_/|_|\__/
const _text = Symbol('_text');

export class TextContent extends BaseContent {
  get contentType(): number { return ContentType.Text; }

  get text(): string { return this[_text]; }
  set text(str: string) {
    if (typeof str === 'string' || str as any instanceof String) {
      this[_text] = str.slice(0, 1024);
    }
  }

  constructor(text?: string) {
    super();
    this[_text] = '';
    this.text = text;
  }

  toJSON(): any {
    const obj = super.toJSON();
    obj.text = this.text;
    return obj;
  }
}

//     ____
//    /  _/___ ___  ____ _____ ____
//    / // __ `__ \/ __ `/ __ `/ _ \
//  _/ // / / / / / /_/ / /_/ /  __/
// /___/_/ /_/ /_/\__,_/\__, /\___/
//                     /____/
const _originalContentUrl = Symbol('_originalContentUrl');
const _previewImageUrl = Symbol('_previewImageUrl');

export interface ImageContentParam {
  originalContentUrl: string,
  previewImageUrl: string
}

export class ImageContent extends BaseContent {
  get contentType(): number { return ContentType.Image; }

  get originalContentUrl(): string { return this[_originalContentUrl]; }
  set originalContentUrl(url: string) {
    if (typeof url === 'string') {
      this[_originalContentUrl] = url;
    }
  }

  get previewImageUrl(): string { return this[_previewImageUrl]; }
  set previewImageUrl(url: string) {
    if (typeof url === 'string') {
      this[_previewImageUrl] = url;
    }
  }

  constructor(param?: ImageContentParam) {
    param = param || {} as ImageContentParam;
    super();
    this[_originalContentUrl] = '';
    this[_previewImageUrl] = '';
    this.originalContentUrl = param.originalContentUrl;
    this.previewImageUrl = param.previewImageUrl;
  }

  toJSON(): any {
    const obj = super.toJSON();
    obj.originalContentUrl = this.originalContentUrl;
    obj.previewImageUrl = this.previewImageUrl;
    return obj;
  }
}

//  _    ___     __
// | |  / (_)___/ /__  ____
// | | / / / __  / _ \/ __ \
// | |/ / / /_/ /  __/ /_/ /
// |___/_/\__,_/\___/\____/
export class VideoContent extends ImageContent {
  get contentType(): number { return ContentType.Video; }
}

//     ___             ___
//    /   | __  ______/ (_)___
//   / /| |/ / / / __  / / __ \
//  / ___ / /_/ / /_/ / / /_/ /
// /_/  |_\__,_/\__,_/_/\____/
const _audlen = Symbol('_audlen');

export interface AudioContentParam {
  originalContentUrl: string,
  AUDLEN: string
}

export class AudioContent extends BaseContent {
  get contentType(): number { return ContentType.Audio; }

  get originalContentUrl(): string { return this[_originalContentUrl]; }
  set originalContentUrl(url: string) {
    if (typeof url === 'string') {
      this[_originalContentUrl] = url;
    }
  }

  get AUDLEN(): string { return this[_audlen]; }
  set AUDLEN(len: string) {
    if (typeof len === 'string') {
      this[_audlen] = len;
    }
  }

  constructor(param?: AudioContentParam) {
    param = param || {} as AudioContentParam;
    super();
    this[_originalContentUrl] = '';
    this[_audlen] = '';
    this.originalContentUrl = param.originalContentUrl;
    this.AUDLEN = param.AUDLEN;
  }

  toJSON(): any {
    const obj = super.toJSON();
    obj.originalContentUrl = this.originalContentUrl;
    obj.contentMetadata = { AUDLEN: this.AUDLEN };
    return obj;
  }
}

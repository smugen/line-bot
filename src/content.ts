export enum ContentType {
  Base = 0, Text, Image, Video, Audio,
  Location = 7, Sticker,
  Contact = 10,
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

//     __                     __  _
//    / /   ____  _________ _/ /_(_)___  ____
//   / /   / __ \/ ___/ __ `/ __/ / __ \/ __ \
//  / /___/ /_/ / /__/ /_/ / /_/ / /_/ / / / /
// /_____/\____/\___/\__,_/\__/_/\____/_/ /_/
const _location = Symbol('_location');

export interface LocationContentLocation {
  title: string,
  latitude: number,
  longitude: number,
  address?: string
}

export class LocationContent extends TextContent {
  get contentType(): number { return ContentType.Location; }

  get location(): LocationContentLocation {
    const location: LocationContentLocation = this[_location];
    const ret: LocationContentLocation = {
      title: this.text,
      latitude: location.latitude,
      longitude: location.longitude
    };
    if (location.address) { ret.address = location.address; }
    return ret;
  }
  set location(loc: LocationContentLocation) {
    if (loc && typeof loc.title === 'string' &&
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number') {

      this.text = loc.title;

      const location = {} as LocationContentLocation;
      location.latitude = loc.latitude;
      location.longitude = loc.longitude;

      if (typeof loc.address === 'string') {
        location.address = loc.address;
      }

      this[_location] = location;
    }
  }

  constructor(param?: LocationContentLocation) {
    param = param || {} as LocationContentLocation;
    super(param.title);
    this[_location] = {};
    this.location = param;
  }

  toJSON(): any {
    const obj = super.toJSON();
    obj.location = this.location;
    return obj;
  }
}

//    _____ __  _      __
//   / ___// /_(_)____/ /_____  _____
//   \__ \/ __/ / ___/ //_/ _ \/ ___/
//  ___/ / /_/ / /__/ ,< /  __/ /
// /____/\__/_/\___/_/|_|\___/_/
const _metadata = Symbol('_metadata');

export interface StickerContentMeta {
  STKID: string,
  STKPKGID: string,
  STKVER: string
}

export class StickerContent extends BaseContent {
  get contentType(): number { return ContentType.Sticker; }

  get metadata(): StickerContentMeta {
    const metadata: StickerContentMeta = this[_metadata];
    return {
      STKID: metadata.STKID,
      STKPKGID: metadata.STKPKGID,
      STKVER: metadata.STKVER
    };
  }
  set metadata(meta: StickerContentMeta) {
    if (meta && typeof meta.STKID === 'string' &&
      typeof meta.STKPKGID === 'string' &&
      typeof meta.STKVER === 'string') {

      const metadata = {} as StickerContentMeta;
      metadata.STKID = meta.STKID;
      metadata.STKPKGID = meta.STKPKGID;
      metadata.STKVER = meta.STKVER;
      this[_metadata] = metadata;
    }
  }

  constructor(param?: StickerContentMeta) {
    param = param || {} as StickerContentMeta;
    super();
    this[_metadata] = {};
    this.metadata = param;
  }

  toJSON(): any {
    const obj = super.toJSON();
    obj.contentMetadata = this.metadata;
    return obj;
  }
}

enum ContentType {
  Base = 0,
  Text
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
}

//   ______          __     ______            __             __
//  /_  __/__  _  __/ /_   / ____/___  ____  / /____  ____  / /_
//   / / / _ \| |/_/ __/  / /   / __ \/ __ \/ __/ _ \/ __ \/ __/
//  / / /  __/>  </ /_   / /___/ /_/ / / / / /_/  __/ / / / /_
// /_/  \___/_/|_|\__/   \____/\____/_/ /_/\__/\___/_/ /_/\__/
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

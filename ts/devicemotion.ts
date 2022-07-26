// by jsejcksn from stackoverflow, licensed under CC-BY-SA 4.0
// https://stackoverflow.com/a/70616929

function createEvent <Type extends string, Detail>(
  type: Type,
  detail: Detail,
): CustomEvent<Detail> & {type: Type} {
  return new CustomEvent(type, {detail}) as CustomEvent<Detail> & {type: Type};
}

function getMaxAcceleration (event: DeviceMotionEvent): number {
  let max = 0;
  if (event.acceleration) {
    for (const key of ['x', 'y', 'z'] as const) {
      const value = Math.abs(event.acceleration[key] ?? 0);
      if (value > max) max = value;
    }
  }
  return max;
}

export type ShakeEventData = DeviceMotionEvent;
export type ShakeEvent = CustomEvent<ShakeEventData> & {type: 'shake'};
export type ShakeEventListener = (event: ShakeEvent) => void;

export type ShakeOptions = {
  /**
   * Minimum acceleration needed to dispatch an event:
   * meters per second squared (m/s²).
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent/acceleration
   */
  threshold: number;
  /**
   * After a shake event is dispatched, subsequent events will not be dispatched
   * until after a duration greater than or equal to this value (milliseconds).
   */
  timeout: number;
};

export class Shake extends EventTarget {
  #approved?: boolean;
  #threshold: ShakeOptions['threshold'];
  #timeout: ShakeOptions['timeout'];
  #timeStamp: number;

  constructor (options?: Partial<ShakeOptions>) {
    super();
    const {
      threshold = 15,
      timeout = 1000,
    } = options ?? {};
    this.#threshold = threshold;
    this.#timeout = timeout;
    this.#timeStamp = timeout * -1;
  }
  
  // @ts-ignore
  addEventListener (
    type: 'shake',
    listener: ShakeEventListener | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    type Arg1 = Parameters<EventTarget['addEventListener']>[1];
    super.addEventListener(type, listener as Arg1, options);
  }

  dispatchEvent (event: ShakeEvent): boolean {
    return super.dispatchEvent(event);
  }

  // @ts-ignore
  removeEventListener (
    type: 'shake',
    callback: ShakeEventListener | null,
    options?: EventListenerOptions | boolean
  ): void {
    type Arg1 = Parameters<EventTarget['removeEventListener']>[1];
    super.removeEventListener(type, callback as Arg1, options);
  }

  async approve (): Promise<boolean> {
    if (typeof this.#approved === 'undefined') {
      if (!('DeviceMotionEvent' in window)) return this.#approved = false;
      try {
        type PermissionRequestFn = () => Promise<PermissionState>;
        type DME = typeof DeviceMotionEvent & { requestPermission: PermissionRequestFn };
        if (typeof (DeviceMotionEvent as DME).requestPermission === 'function') {
          const permissionState = await (DeviceMotionEvent as DME).requestPermission();
          this.#approved = permissionState === 'granted';
        }
        else this.#approved = true;
      }
      catch {
        this.#approved = false;
      }
    }
    return this.#approved;
  }

  #handleDeviceMotion = (event: DeviceMotionEvent): void => {
    const diff = event.timeStamp - this.#timeStamp;
    if (diff < this.#timeout) return;
    const accel = getMaxAcceleration(event);
    if (accel < this.#threshold) return;
    this.#timeStamp = event.timeStamp;
    this.dispatchEvent(createEvent('shake', event));
  };

  async start (): Promise<boolean> {
    const approved = await this.approve();
    if (!approved) return false;
    window.addEventListener('devicemotion', this.#handleDeviceMotion);
    return true;
  }

  stop (): void {
    window.removeEventListener('devicemotion', this.#handleDeviceMotion);
  }
}
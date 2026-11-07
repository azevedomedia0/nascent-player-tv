/**
 * Bluetooth accessories for Nascent TV — Android-style pairing model
 * backed by Web Bluetooth + the HID Gamepad API.
 */

export type BtDeviceKind = 'remote' | 'gamepad' | 'speaker' | 'headphones' | 'car' | 'hearing' | 'other';
export type BtConnectionStatus = 'connected' | 'paired' | 'available' | 'connecting';
export type BtAudioDeviceType =
  | 'not-set'
  | 'speaker'
  | 'headphones'
  | 'car'
  | 'hearing'
  | 'other';
export type BtDeviceSource = 'web-bt' | 'gamepad';

export interface SavedBtDevice {
  id: string;
  name: string;
  customName?: string;
  kind: BtDeviceKind;
  source: BtDeviceSource;
  status: BtConnectionStatus;
  detail: string;
  audioDeviceType: BtAudioDeviceType;
  mediaAudio: boolean;
  phoneCalls: boolean;
  contactSharing: boolean;
  autoConnect: boolean;
  batteryPercent: number | null;
  lastSeenAt: string;
  pairedAt: string;
}

export interface BtPreferences {
  adapterOn: boolean;
  deviceName: string;
  autoConnectSaved: boolean;
  preferHdAudio: boolean;
  mediaAudioOnly: boolean;
  showBattery: boolean;
}

const STORAGE_DEVICES = 'nascent_tv_bt_devices';
const STORAGE_PREFS = 'nascent_tv_bt_prefs';

export const DEFAULT_BT_PREFS: BtPreferences = {
  adapterOn: true,
  deviceName: 'Nascent Player TV',
  autoConnectSaved: true,
  preferHdAudio: true,
  mediaAudioOnly: false,
  showBattery: true,
};

export function loadBtPreferences(): BtPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS);
    if (!raw) return { ...DEFAULT_BT_PREFS };
    return { ...DEFAULT_BT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_BT_PREFS };
  }
}

export function saveBtPreferences(prefs: BtPreferences): void {
  try {
    localStorage.setItem(STORAGE_PREFS, JSON.stringify(prefs));
  } catch {
    /* ignore quota */
  }
}

export function loadSavedBtDevices(): SavedBtDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_DEVICES);
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedBtDevice[];
    // Gamepads are ephemeral — don't restore as connected
    return list
      .filter((d) => d.source !== 'gamepad')
      .map((d) => ({
        ...d,
        status: d.status === 'connected' ? 'paired' : d.status === 'available' ? 'paired' : d.status,
        batteryPercent: null,
        detail: d.detail || 'Saved device',
      }));
  } catch {
    return [];
  }
}

export function saveBtDevices(devices: SavedBtDevice[]): void {
  try {
    const persistable = devices
      .filter((d) => d.source !== 'gamepad')
      .map(({ batteryPercent: _b, ...rest }) => ({
        ...rest,
        status: rest.status === 'connected' ? ('paired' as const) : rest.status,
      }));
    localStorage.setItem(STORAGE_DEVICES, JSON.stringify(persistable));
  } catch {
    /* ignore */
  }
}

export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && !!(navigator as Navigator & { bluetooth?: unknown }).bluetooth;
}

export function inferBtKind(name: string): BtDeviceKind {
  const lower = name.toLowerCase();
  if (/remote|fire tv|shield|roku|apple tv|chromecast|mi box|android tv/.test(lower)) return 'remote';
  if (/xbox|dualshock|dualsense|controller|gamepad|joy-con|switch|stadia/.test(lower)) return 'gamepad';
  if (/speaker|soundbar|boom|homepod|echo|jbl|sonos/.test(lower)) return 'speaker';
  if (/buds|headphone|airpods|headset|earbud|wh-1000|galaxy buds/.test(lower)) return 'headphones';
  if (/car|auto|hands-free|hfp|carkit/.test(lower)) return 'car';
  if (/hearing|aid|cochlear/.test(lower)) return 'hearing';
  return 'other';
}

export function kindToAudioType(kind: BtDeviceKind): BtAudioDeviceType {
  switch (kind) {
    case 'speaker':
      return 'speaker';
    case 'headphones':
      return 'headphones';
    case 'car':
      return 'car';
    case 'hearing':
      return 'hearing';
    case 'other':
    case 'remote':
    case 'gamepad':
    default:
      return 'not-set';
  }
}

export function displayName(device: SavedBtDevice): string {
  return device.customName?.trim() || device.name;
}

export function audioTypeLabel(t: BtAudioDeviceType): string {
  switch (t) {
    case 'speaker':
      return 'Speaker';
    case 'headphones':
      return 'Headphones';
    case 'car':
      return 'Car';
    case 'hearing':
      return 'Hearing device';
    case 'other':
      return 'Other';
    default:
      return 'Not set';
  }
}

export function kindLabel(kind: BtDeviceKind): string {
  switch (kind) {
    case 'remote':
      return 'Remote';
    case 'gamepad':
      return 'Gamepad';
    case 'speaker':
      return 'Speaker';
    case 'headphones':
      return 'Headphones';
    case 'car':
      return 'Car kit';
    case 'hearing':
      return 'Hearing';
    default:
      return 'Accessory';
  }
}

/** Chromium Web Bluetooth device shape we use. */
export type WebBluetoothDevice = {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<BluetoothRemoteGATTServerLike>;
    disconnect: () => void;
  };
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

type BluetoothRemoteGATTServerLike = {
  connected: boolean;
  getPrimaryService: (service: string) => Promise<{
    getCharacteristic: (char: string) => Promise<{
      readValue: () => Promise<DataView>;
    }>;
  }>;
};

type BluetoothNavigator = {
  requestDevice: (opts: {
    acceptAllDevices?: boolean;
    optionalServices?: string[];
    filters?: Array<{ services?: string[]; namePrefix?: string }>;
  }) => Promise<WebBluetoothDevice>;
  getDevices?: () => Promise<WebBluetoothDevice[]>;
};

export function getBluetoothApi(): BluetoothNavigator | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as Navigator & { bluetooth?: BluetoothNavigator }).bluetooth ?? null;
}

const OPTIONAL_SERVICES: string[] = [
  'battery_service',
  'device_information',
  'generic_access',
  'generic_attribute',
  'human_interface_device',
  'audio_source',
  'audio_sink',
  'headset',
  'handsfree',
  'a2dp',
  'avrcp',
];

export async function requestPairDevice(): Promise<WebBluetoothDevice> {
  const api = getBluetoothApi();
  if (!api?.requestDevice) {
    throw new Error('Web Bluetooth is not available in this browser.');
  }
  return api.requestDevice({
    acceptAllDevices: true,
    optionalServices: OPTIONAL_SERVICES,
  });
}

export async function getPermittedDevices(): Promise<WebBluetoothDevice[]> {
  const api = getBluetoothApi();
  if (!api?.getDevices) return [];
  try {
    return await api.getDevices();
  } catch {
    return [];
  }
}

export async function connectGatt(device: WebBluetoothDevice): Promise<boolean> {
  if (!device.gatt) return false;
  if (device.gatt.connected) return true;
  await device.gatt.connect();
  return device.gatt.connected;
}

export function disconnectGatt(device: WebBluetoothDevice): void {
  try {
    device.gatt?.disconnect();
  } catch {
    /* already disconnected */
  }
}

/** Read Battery Level characteristic (0x2A19) when the service is present. */
export async function readBatteryPercent(device: WebBluetoothDevice): Promise<number | null> {
  if (!device.gatt?.connected) return null;
  try {
    const server = device.gatt.connected
      ? await device.gatt.connect()
      : null;
    if (!server) return null;
    const service = await server.getPrimaryService('battery_service');
    const char = await service.getCharacteristic('battery_level');
    const value = await char.readValue();
    return value.getUint8(0);
  } catch {
    return null;
  }
}

export function gamepadsToDevices(): SavedBtDevice[] {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
  const pads = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
  const now = new Date().toISOString();
  return pads.map((pad, idx) => ({
    id: `gamepad-${pad.index}`,
    name: pad.id?.trim() || `Gamepad ${pad.index + 1}`,
    kind: 'gamepad' as const,
    source: 'gamepad' as const,
    status: 'connected' as const,
    detail: `HID · index ${pad.index} · ${pad.buttons?.length ?? 0} buttons · ${pad.axes?.length ?? 0} axes`,
    audioDeviceType: 'not-set' as const,
    mediaAudio: false,
    phoneCalls: false,
    contactSharing: false,
    autoConnect: true,
    batteryPercent: null,
    lastSeenAt: now,
    pairedAt: now,
    // stable synthetic key when multiple pads share index edge cases
    ...(idx >= 0 ? {} : {}),
  }));
}

export function toSavedFromWebDevice(
  device: WebBluetoothDevice,
  connected: boolean
): SavedBtDevice {
  const name = device.name?.trim() || 'Bluetooth device';
  const kind = inferBtKind(name);
  const now = new Date().toISOString();
  return {
    id: device.id || `bt-${Date.now()}`,
    name,
    kind,
    source: 'web-bt',
    status: connected ? 'connected' : 'paired',
    detail: connected ? 'Connected · GATT' : 'Paired · tap Connect to open GATT',
    audioDeviceType: kindToAudioType(kind),
    mediaAudio: kind === 'speaker' || kind === 'headphones' || kind === 'car',
    phoneCalls: kind === 'car' || kind === 'headphones',
    contactSharing: kind === 'car',
    autoConnect: true,
    batteryPercent: null,
    lastSeenAt: now,
    pairedAt: now,
  };
}

/* Small builders so hand-authored cases and the factory share one shape and one set of defaults. */
import type { Device, Engagement, Location, Visit } from './types';

/** The fixed reference "now" every relative time is measured from. */
export const NOW = '2026-09-13T12:00:00.000Z';

export const LOCATIONS = {
  frankfurt: { country: 'Germany', countryCode: 'DE', region: 'Hesse', city: 'Frankfurt' },
  amsterdam: { country: 'Netherlands', countryCode: 'NL', region: 'North Holland', city: 'Amsterdam' },
  austin: { country: 'United States', countryCode: 'US', region: 'Texas', city: 'Austin' },
  atlanta: { country: 'United States', countryCode: 'US', region: 'Georgia', city: 'Atlanta' },
  sanJose: { country: 'United States', countryCode: 'US', region: 'California', city: 'San Jose' },
  brooklyn: { country: 'United States', countryCode: 'US', region: 'New York', city: 'Brooklyn' },
  manchester: { country: 'United Kingdom', countryCode: 'GB', region: 'England', city: 'Manchester' },
  toronto: { country: 'Canada', countryCode: 'CA', region: 'Ontario', city: 'Toronto' },
  saoPaulo: { country: 'Brazil', countryCode: 'BR', region: 'Sao Paulo', city: 'Sao Paulo' },
  bengaluru: { country: 'India', countryCode: 'IN', region: 'Karnataka', city: 'Bengaluru' },
  lagos: { country: 'Nigeria', countryCode: 'NG', region: 'Lagos', city: 'Lagos' },
  hanoi: { country: 'Vietnam', countryCode: 'VN', region: 'Hanoi', city: 'Hanoi' },
  quezon: { country: 'Philippines', countryCode: 'PH', region: 'Metro Manila', city: 'Quezon City' },
  singapore: { country: 'Singapore', countryCode: 'SG', region: 'Central', city: 'Singapore' },
  sydney: { country: 'Australia', countryCode: 'AU', region: 'New South Wales', city: 'Sydney' },
  kualaLumpur: { country: 'Malaysia', countryCode: 'MY', region: 'Kuala Lumpur', city: 'Kuala Lumpur' },
  buenosAires: { country: 'Argentina', countryCode: 'AR', region: 'Buenos Aires', city: 'Buenos Aires' },
  montevideo: { country: 'Uruguay', countryCode: 'UY', region: 'Montevideo', city: 'Montevideo' },
  santiago: { country: 'Chile', countryCode: 'CL', region: 'Santiago Metropolitan', city: 'Santiago' },
  paris: { country: 'France', countryCode: 'FR', region: 'Ile-de-France', city: 'Paris' },
} satisfies Record<string, Location>;

export const DEVICES = {
  chromeWindows: { id: 'd-c121-win', browser: 'Chrome 121', os: 'Windows 11', kind: 'desktop' },
  chromeMac: { id: 'd-c121-mac', browser: 'Chrome 121', os: 'macOS 15', kind: 'desktop' },
  safariIos: { id: 'd-s17-ios', browser: 'Safari 17', os: 'iOS 17', kind: 'mobile' },
  chromeAndroid: { id: 'd-c120-and', browser: 'Chrome 120', os: 'Android 14', kind: 'mobile' },
  firefoxLinux: { id: 'd-f122-lin', browser: 'Firefox 122', os: 'Linux', kind: 'desktop' },
  headlessLinux: { id: 'd-hc121-lin', browser: 'HeadlessChrome 121', os: 'Linux', kind: 'desktop' },
  edgeWindows: { id: 'd-e121-win', browser: 'Edge 121', os: 'Windows 11', kind: 'desktop' },
  safariIpad: { id: 'd-s17-ipad', browser: 'Safari 17', os: 'iPadOS 17', kind: 'tablet' },
} satisfies Record<string, Device>;

export const ENGAGED: Engagement = { durationSec: 95, scrollDepth: 0.7, clicks: 4, pointerMoved: true, jsEnabled: true };
export const SHALLOW: Engagement = { durationSec: 3, scrollDepth: 0, clicks: 0, pointerMoved: false, jsEnabled: true };
export const SHALLOW_HUMAN: Engagement = { durationSec: 4, scrollDepth: 0.05, clicks: 1, pointerMoved: true, jsEnabled: true };

export type VisitInput = Partial<Omit<Visit, 'id' | 'occurredAt'>> & Pick<Visit, 'id' | 'occurredAt'>;

export function visit(input: VisitInput): Visit {
  const source = input.source ?? 'organic';
  return {
    source,
    landingPage: '/',
    location: LOCATIONS.austin,
    device: DEVICES.chromeWindows,
    networkType: 'residential',
    vpnOrProxy: false,
    engagement: ENGAGED,
    botProbability: 0.08,
    formResult: 'not-submitted',
    converted: false,
    ...input,
  };
}

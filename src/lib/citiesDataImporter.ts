/**
 * Import city JSON files directly as modules
 * This bundles them with the serverless function, avoiding HTTP fetch issues
 */

import alabama from '@/data/cities/alabama.json';
import alaska from '@/data/cities/alaska.json';
import arizona from '@/data/cities/arizona.json';
import arkansas from '@/data/cities/arkansas.json';
import california from '@/data/cities/california.json';
import colorado from '@/data/cities/colorado.json';
import connecticut from '@/data/cities/connecticut.json';
import delaware from '@/data/cities/delaware.json';
import florida from '@/data/cities/florida.json';
import georgia from '@/data/cities/georgia.json';
import hawaii from '@/data/cities/hawaii.json';
import idaho from '@/data/cities/idaho.json';
import illinois from '@/data/cities/illinois.json';
import indiana from '@/data/cities/indiana.json';
import iowa from '@/data/cities/iowa.json';
import kansas from '@/data/cities/kansas.json';
import kentucky from '@/data/cities/kentucky.json';
import louisiana from '@/data/cities/louisiana.json';
import maine from '@/data/cities/maine.json';
import maryland from '@/data/cities/maryland.json';
import massachusetts from '@/data/cities/massachusetts.json';
import michigan from '@/data/cities/michigan.json';
import minnesota from '@/data/cities/minnesota.json';
import mississippi from '@/data/cities/mississippi.json';
import missouri from '@/data/cities/missouri.json';
import montana from '@/data/cities/montana.json';
import nebraska from '@/data/cities/nebraska.json';
import nevada from '@/data/cities/nevada.json';
import newHampshire from '@/data/cities/new-hampshire.json';
import newJersey from '@/data/cities/new-jersey.json';
import newMexico from '@/data/cities/new-mexico.json';
import newYork from '@/data/cities/new-york.json';
import northCarolina from '@/data/cities/north-carolina.json';
import northDakota from '@/data/cities/north-dakota.json';
import ohio from '@/data/cities/ohio.json';
import oklahoma from '@/data/cities/oklahoma.json';
import oregon from '@/data/cities/oregon.json';
import pennsylvania from '@/data/cities/pennsylvania.json';
import rhodeIsland from '@/data/cities/rhode-island.json';
import southCarolina from '@/data/cities/south-carolina.json';
import southDakota from '@/data/cities/south-dakota.json';
import tennessee from '@/data/cities/tennessee.json';
import texas from '@/data/cities/texas.json';
import utah from '@/data/cities/utah.json';
import vermont from '@/data/cities/vermont.json';
import virginia from '@/data/cities/virginia.json';
import washington from '@/data/cities/washington.json';
import westVirginia from '@/data/cities/west-virginia.json';
import wisconsin from '@/data/cities/wisconsin.json';
import wyoming from '@/data/cities/wyoming.json';

interface CityData {
  name: string;
  slug: string;
  salonCount?: number;
  population?: number;
}

interface StateData {
  state: string;
  stateCode: string;
  citiesCount: number;
  cities: CityData[];
}

// Map of state slugs to their data
const statesDataMap = new Map<string, StateData>([
  ['alabama', alabama as StateData],
  ['alaska', alaska as StateData],
  ['arizona', arizona as StateData],
  ['arkansas', arkansas as StateData],
  ['california', california as StateData],
  ['colorado', colorado as StateData],
  ['connecticut', connecticut as StateData],
  ['delaware', delaware as StateData],
  ['florida', florida as StateData],
  ['georgia', georgia as StateData],
  ['hawaii', hawaii as StateData],
  ['idaho', idaho as StateData],
  ['illinois', illinois as StateData],
  ['indiana', indiana as StateData],
  ['iowa', iowa as StateData],
  ['kansas', kansas as StateData],
  ['kentucky', kentucky as StateData],
  ['louisiana', louisiana as StateData],
  ['maine', maine as StateData],
  ['maryland', maryland as StateData],
  ['massachusetts', massachusetts as StateData],
  ['michigan', michigan as StateData],
  ['minnesota', minnesota as StateData],
  ['mississippi', mississippi as StateData],
  ['missouri', missouri as StateData],
  ['montana', montana as StateData],
  ['nebraska', nebraska as StateData],
  ['nevada', nevada as StateData],
  ['new-hampshire', newHampshire as StateData],
  ['new-jersey', newJersey as StateData],
  ['new-mexico', newMexico as StateData],
  ['new-york', newYork as StateData],
  ['north-carolina', northCarolina as StateData],
  ['north-dakota', northDakota as StateData],
  ['ohio', ohio as StateData],
  ['oklahoma', oklahoma as StateData],
  ['oregon', oregon as StateData],
  ['pennsylvania', pennsylvania as StateData],
  ['rhode-island', rhodeIsland as StateData],
  ['south-carolina', southCarolina as StateData],
  ['south-dakota', southDakota as StateData],
  ['tennessee', tennessee as StateData],
  ['texas', texas as StateData],
  ['utah', utah as StateData],
  ['vermont', vermont as StateData],
  ['virginia', virginia as StateData],
  ['washington', washington as StateData],
  ['west-virginia', westVirginia as StateData],
  ['wisconsin', wisconsin as StateData],
  ['wyoming', wyoming as StateData],
]);

/**
 * Get all states and cities data (synchronous, bundled with function)
 */
export function getAllStateCityData(): Map<string, StateData> {
  return statesDataMap;
}

/**
 * Get a single state's data
 */
export function getStateCityData(stateSlug: string): StateData | null {
  return statesDataMap.get(stateSlug) || null;
}

/**
 * Get list of all state slugs
 */
export function getAllStatesList(): string[] {
  return Array.from(statesDataMap.keys());
}

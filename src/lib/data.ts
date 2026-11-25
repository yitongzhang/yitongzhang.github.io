// The _data folder is shared with the diary tooling (scripts/diary.py and the
// agents described in DIARY.md), so it stays where Jekyll kept it.
import { parse } from 'yaml'
import diaryJson from '../../_data/diary.json'
import displayYml from '../../_data/diary_display.yml?raw'
import navigationYml from '../../_data/navigation.yml?raw'
import workYml from '../../_data/work.yml?raw'

export type NavItem = { name: string; link: string }
export type WorkItem = {
  name: string
  company?: string
  description: string
  startDate: string
  endDate: string
  images: string[]
}

export const navigation: NavItem[] = parse(navigationYml)
export const work: WorkItem[] = parse(workYml)
export const diary = diaryJson
export const diaryDisplay = parse(displayYml)

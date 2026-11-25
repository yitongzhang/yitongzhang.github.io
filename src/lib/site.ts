// The site has always declared itself as http://zhayitong.com (from the CNAME on
// GitHub Pages). Feed entry ids are built from it, so it must not change: feed
// readers use those ids to decide what is new.
export const SITE_URL = 'http://zhayitong.com'
export const OG_IMAGE = 'https://www.zhayitong.com/assets/img/ogImage.jpg'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2024-02-01" -> "Feb 2024" (Liquid `date: "%b %Y"`). */
export const monthYear = (ymd: string) => `${MONTHS[Number(ymd.slice(5, 7)) - 1]} ${ymd.slice(0, 4)}`

/** "2024-02-01" -> "01 Feb 2024" (Liquid `date: "%d %b %Y"`). */
export const dayMonthYear = (ymd: string) => `${ymd.slice(8, 10)} ${monthYear(ymd)}`

/** Midnight UTC, as GitHub Pages' Jekyll stamped every post. */
export const isoMidnight = (ymd: string) => `${ymd}T00:00:00+00:00`

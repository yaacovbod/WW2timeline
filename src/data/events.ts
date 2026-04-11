export interface GameEvent {
  id: number
  sortKey: number
  displayDate: string
  title: string
  description: string
  image: string
  isSeed?: boolean
  isCorrect?: boolean
}

export const ALL_EVENTS: GameEvent[] = [
  { id: 1,  sortKey: 19330130, displayDate: "30 בינואר 1933",    title: "מינוי היטלר לקנצלר",                        description: "הנשיא הינדנבורג מעניק להיטלר את ראשות הממשלה בדרך חוקית.",                                                                                              image: "/pics/01.jpeg" },
  { id: 2,  sortKey: 19330227, displayDate: "פברואר 1933",        title: "שריפת הרייכסטאג",                            description: "בניין הפרלמנט עולה באש והנאצים מנצלים זאת לפרסום צו המבטל את הגנת החוק.",                                                                               image: "/pics/02.jpeg" },
  { id: 3,  sortKey: 19330323, displayDate: "מרץ 1933",           title: "חוק ההסמכה",                                 description: "החוק מעניק להיטלר סמכות לחוקק ללא אישור הפרלמנט והופך את גרמניה לדיקטטורה חוקית.",                                                                    image: "/pics/03.jpeg" },
  { id: 4,  sortKey: 19330401, displayDate: "אפריל 1933",         title: "יום החרם",                                   description: "הנאצים מארגנים חרם כלכלי על עסקים וסחורות בבעלות יהודים.",                                                                                             image: "/pics/04.jpeg" },
  { id: 5,  sortKey: 19330407, displayDate: "אפריל 1933",         title: "החוק להחזרת הפקידות המקצועית",              description: "פקידים ומורים יהודים מסולקים ממשרותיהם בשירות הציבורי מכוח חקיקה חדשה.",                                                                               image: "/pics/05.jpeg" },
  { id: 6,  sortKey: 19340630, displayDate: "יוני 1934",          title: "ליל הסכינים הארוכות",                        description: "היטלר מורה על הוצאה להורג של מפקד ה-SA ארנסט רהם וקצינים נוספים בארגון.",                                                                              image: "/pics/06.jpeg" },
  { id: 7,  sortKey: 19350915, displayDate: "ספטמבר 1935",        title: "חוקי נירנברג",                               description: "המפלגה הנאצית מאשרת חוקים השוללים את אזרחות היהודים וקובעים את טוהר הדם הגרמני.",                                                                      image: "/pics/07.jpeg" },
  { id: 8,  sortKey: 19360801, displayDate: "1936",               title: "האולימפיאדה בברלין",                          description: "המשטר משתמש באירוע לחיזוק התמיכה בשלטון והחדרת עקרונות האידיאולוגיה הנאצית.",                                                                           image: "/pics/08.jpeg" },
  { id: 9,  sortKey: 19381109, displayDate: "נובמבר 1938",        title: "ליל הבדולח",                                 description: "פוגרום מאורגן הכולל רצח יהודים ושריפת בתי כנסת ועסקים יהודיים ברחבי גרמניה.",                                                                          image: "/pics/09.jpeg" },
  { id: 10, sortKey: 19390901, displayDate: "1 בספטמבר 1939",    title: "פלישת גרמניה לפולין",                        description: "הצבא הגרמני תוקף בעוצמה רבה וגורם לפריצת מלחמת העולם השנייה.",                                                                                         image: "/pics/10.jpeg" },
  { id: 12, sortKey: 19390921, displayDate: "21 בספטמבר 1939",   title: "איגרת הבזק של היידריך",                      description: "הוראה סודית לריכוז יהודי פולין בערים גדולות סמוך למסילות ברזל והקמת מועצות יהודיות.",                                                                   image: "/pics/11.jpeg" },
  { id: 15, sortKey: 19400614, displayDate: "יוני 1940",          title: "כיבוש צרפת",                                 description: "הצבא הגרמני נכנס לפריז והמדינה מחולקת לאזור כיבוש ולשלטון משתף פעולה.",                                                                               image: "/pics/12.jpeg" },
  { id: 16, sortKey: 19400815, displayDate: "אוגוסט 1940",        title: "הקרב על בריטניה",                            description: "חיל האוויר הגרמני פותח בהפצצות כבדות על לונדון ומתקנים צבאיים במטרה להכניע את המדינה.",                                                                  image: "/pics/13.jpeg" },
  { id: 17, sortKey: 19401016, displayDate: "אוקטובר 1940",       title: "הקמת גטו ורשה",                              description: "יהודי העיר והסביבה נדחקים לשטח מצומצם המוקף חומה בתוך שכונות העוני.",                                                                                  image: "/pics/14.jpeg" },
  { id: 18, sortKey: 19410622, displayDate: "22 ביוני 1941",      title: "מבצע ברברוסה",                               description: "גרמניה פולשת לברית המועצות במתקפת בזק ובניגוד להסכם ריבנטרופ-מולוטוב.",                                                                               image: "/pics/15.jpeg" },
  { id: 19, sortKey: 19410701, displayDate: "יוני 1941",          title: "תחילת הרצח ההמוני בבורות הירי",             description: "עוצבות המבצע המיוחדות של ה-SS מוציאות להורג יהודים בשטחים שנכבשו במזרח.",                                                                             image: "/pics/16.jpeg" },
  { id: 21, sortKey: 19411207, displayDate: "7 בדצמבר 1941",     title: "המתקפה על פרל הרבור",                        description: "מטוסים יפנים מפציצים את הבסיס הימי האמריקני החשוב באוקיינוס השקט.",                                                                                     image: "/pics/17.jpeg" },
  { id: 22, sortKey: 19411208, displayDate: "8 בדצמבר 1941",     title: "הפעלת מחנה ההשמדה חלמנו",                   description: "הנאצים מתחילים ברצח המוני של יהודים באתר קבוע באמצעות משאיות גז אטומות.",                                                                               image: "/pics/18.jpeg" },
  { id: 23, sortKey: 19420120, displayDate: "20 בינואר 1942",     title: "ועידת ואנזה",                                description: "פקידי הממשל הנאצי דנים בדרכי הפעולה ליישום הפתרון הסופי עבור יהודי אירופה.",                                                                           image: "/pics/19.jpeg" },
  { id: 24, sortKey: 19420301, displayDate: "1942",               title: "מבצע ריינהרד",                               description: "הקמת מחנות השמדה קבועים ושימוש בתאי גזים להשמדת יהודי פולין כולה.",                                                                                    image: "/pics/20.jpeg" },
  { id: 25, sortKey: 19421023, displayDate: "אוקטובר 1942",       title: "קרב אל עלמיין",                              description: "כוחות בריטיים מביסים את צבא היבשה הגרמני ומסלקים את הסכנה הנאצית מהמזרח התיכון.",                                                                    image: "/pics/21.jpeg" },
  { id: 33, sortKey: 19421110, displayDate: "נובמבר 1942",        title: "הפלישה הנאצית לתוניסיה",                    description: "בתגובה לנחיתת בעלות הברית בצפון אפריקה, פולשים כוחות גרמנים ואיטלקים לתוניסיה ומחזיקים בה כחצי שנה עד לכניעתם במאי 1943.",                            image: "/pics/22.jpeg" },
  { id: 26, sortKey: 19421119, displayDate: "נובמבר 1942",        title: "מתקפת הנגד בסטלינגרד",                      description: "הצבא הרוסי מתאושש ויוצא למבצע צבאי גדול המוביל למפלת הגרמנים בחזית המזרחית.",                                                                          image: "/pics/23.jpeg" },
  { id: 27, sortKey: 19430419, displayDate: "19 באפריל 1943",     title: "מרד גטו ורשה",                               description: "ארגוני המחתרת היהודים פותחים בלחימה נגד הכוחות הגרמנים הנכנסים לגטו לצורך חיסולו.",                                                                    image: "/pics/24.jpeg" },
  { id: 28, sortKey: 19440606, displayDate: "6 ביוני 1944",       title: "הפלישה לנורמנדי",                            description: "כוחות בעלות הברית נוחתים בחוף נורמנדי במבצע המכונה אוברלורד לשיחרור אירופה.",                                                                           image: "/pics/25.jpeg" },
  { id: 29, sortKey: 19450115, displayDate: "ינואר 1945",         title: "צעדות המוות",                                description: "הנאצים מפנים את האסירים מהמחנות במזרח ומצעידים אותם מערבה בקור מקפיא ללא מזון הולם.",                                                                   image: "/pics/26.jpeg" },
  { id: 30, sortKey: 19450416, displayDate: "אפריל 1945",         title: "הקרב על ברלין",                              description: "הצבא הרוסי מתקיף את ברלין והיטלר מתבצר בבונקר פיקוד תת-קרקעי במרכז העיר.",                                                                             image: "/pics/27.jpeg" },
  { id: 31, sortKey: 19450430, displayDate: "30 באפריל 1945",     title: "התאבדות היטלר",                              description: "המנהיג הנאצי נוטל את חייו בבונקר הפיקוד שלו במרכז ברלין כאשר הצבא האדום נמצא בתוך העיר.",                                                             image: "/pics/28.jpeg" },
  { id: 32, sortKey: 19450806, displayDate: "אוגוסט 1945",        title: "הטלת פצצות האטום על הירושימה ונגסאקי",      description: "ארצות הברית משתמשת בנשק גרעיני נגד ערים ביפן, מה שמביא לכניעתה ללא תנאי.",                                                                             image: "/pics/29.jpeg" },
]

export const MUTUAL_EXCLUSIONS: [number, number][] = [
  [26, 33],
  [21, 22],
  [18, 19],
  [30, 31],
  [4,  5 ],
  [23, 24],
  [25, 33],
]

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickEvents(): GameEvent[] {
  const shuffled = shuffle(ALL_EVENTS)
  const selected = shuffled.slice(0, 8)

  MUTUAL_EXCLUSIONS.forEach(([idA, idB]) => {
    const posA = selected.findIndex(e => e.id === idA)
    const posB = selected.findIndex(e => e.id === idB)
    if (posA === -1 || posB === -1) return
    const removePos = Math.max(posA, posB)
    const replacement = shuffled.find(e => !selected.includes(e))
    if (replacement) selected.splice(removePos, 1, replacement)
  })

  return selected
}

export function formatTime(ms: number): string {
  const m = String(Math.floor(ms / 60000)).padStart(2, '0')
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  const t = String(Math.floor((ms % 1000) / 100))
  return `${m}:${s}.${t}`
}

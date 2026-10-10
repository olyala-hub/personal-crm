/**
 * Fills an empty database with realistic test contacts and notes.
 *
 * Usage: pnpm db:seed [count]   (default: 1000 contacts)
 *
 * Refuses to run when contacts already exist, so it never duplicates
 * or overwrites real data.
 */
import { fakerRU as faker } from "@faker-js/faker";
import { loadEnvConfig } from "@next/env";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "../src/db/connection-url";
import { contacts, notes } from "../src/db/schema";

loadEnvConfig(process.cwd());

const DEFAULT_CONTACT_COUNT = 1000;
const BATCH_SIZE = 500;

type Sex = "male" | "female";
type Gendered = { male: string; female: string };

const both = (text: string): Gendered => ({ male: text, female: text });

const ABOUT: Gendered[] = [
  { male: "Бывший коллега", female: "Бывшая коллега" },
  both("Коллега по работе"),
  { male: "Однокурсник", female: "Однокурсница" },
  { male: "Одноклассник", female: "Одноклассница" },
  { male: "Друг детства", female: "Подруга детства" },
  { male: "Сосед по дому", female: "Соседка по дому" },
  { male: "Сосед по даче", female: "Соседка по даче" },
  { male: "Двоюродный брат", female: "Двоюродная сестра" },
  both("Друг семьи"),
  both("Бывший руководитель"),
  both("Партнёр по бегу"),
  { male: "Знакомый из спортзала", female: "Знакомая из спортзала" },
  { male: "Папа одноклассника сына", female: "Мама одноклассницы дочки" },
  { male: "Товарищ по походам", female: "Подруга по походам" },
  both("Стоматолог"),
  both("Риелтор"),
  both("Юрист"),
  both("Бухгалтер"),
  both("Фотограф"),
  both("Ветеринар"),
  both("Автомеханик"),
  both("Дизайнер интерьеров"),
  both("Репетитор по английскому"),
  both("Тренер по плаванию"),
  both("Мастер по ремонту"),
  both("Ментор по карьере"),
  { male: "Клиент по фрилансу", female: "Клиентка по фрилансу" },
  { male: "Попутчик из поезда", female: "Попутчица из поезда" },
];

const CITIES = [
  "Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск",
  "Нижний Новгород", "Минск", "Самара", "Сочи", "Калининград", "Ярославль",
  "Томск", "Краснодар", "Пермь",
];
const CITIES_PREPOSITIONAL = [
  "Москве", "Санкт-Петербурге", "Казани", "Екатеринбурге", "Новосибирске",
  "Нижнем Новгороде", "Минске", "Самаре", "Сочи", "Калининграде",
  "Ярославле", "Томске", "Краснодаре", "Перми",
];
const CITIES_ACCUSATIVE = [
  "Москву", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск",
  "Нижний Новгород", "Минск", "Самару", "Сочи", "Калининград", "Ярославль",
  "Томск", "Краснодар", "Пермь",
];
const UNIVERSITIES = ["МГУ", "СПбГУ", "МФТИ", "ВШЭ", "КФУ", "УрФУ", "БГУ", "МГТУ им. Баумана", "НГУ"];
const COMPANIES = ["Северный ветер", "Альфа-Проект", "Город Софт", "ТехноЛайн", "Добрые руки", "Зелёный квадрат", "Медиа Плюс", "СтройДом"];
const CONFERENCES = ["по продуктовой разработке", "по маркетингу", "по дизайну", "для предпринимателей", "по аналитике данных"];
const HIKES = ["по Алтаю", "по Карелии", "на Эльбрус", "на Байкал", "в Хибины", "по Кавказу"];
const COURSES = ["английского", "фотографии", "керамики", "программирования", "вождения", "испанского"];
const MONTHS_PREPOSITIONAL = [
  "январе", "феврале", "марте", "апреле", "мае", "июне", "июле",
  "августе", "сентябре", "октябре", "ноябре", "декабре",
];
const MONTHS_ACCUSATIVE = [
  "январь", "февраль", "март", "апрель", "май", "июнь", "июль",
  "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];
const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня", "июля",
  "августа", "сентября", "октября", "ноября", "декабря",
];
const SPECIALISTS = ["стоматолога", "юриста", "автомеханика", "бухгалтера", "репетитора по английскому", "ветеринара"];
const LOOKING_FOR = ["квартиру в аренду", "хорошего ветеринара", "работу в маркетинге", "няню для ребёнка", "попутчиков в Грузию", "мастера по ремонту"];
const TOPICS = ["переездом", "новой работой", "покупкой машины", "поступлением дочки", "ремонтом", "собакой"];
const BOOKS = ["Мастер и Маргарита", "Сто лет одиночества", "Пикник на обочине", "Маленький принц", "Шантарам"];
const EMAIL_DOMAINS = ["gmail.com", "yandex.ru", "mail.ru", "outlook.com", "icloud.com", "proton.me"];

const pick = <T>(items: readonly T[]): T => faker.helpers.arrayElement(items);
const byPronoun = (sex: Sex, male: string, female: string) =>
  sex === "male" ? male : female;

function howWeMet(sex: Sex): string {
  const year = faker.number.int({ min: 2005, max: 2024 });
  const cityIndex = faker.number.int({ min: 0, max: CITIES.length - 1 });
  const city = CITIES_PREPOSITIONAL[cityIndex];
  const friend = `${faker.person.firstName()} ${faker.person.lastName()}`;

  const variants = [
    () => `Учились вместе в ${pick(UNIVERSITIES)}, ${year}–${year + 5}`,
    () => `Работали вместе в «${pick(COMPANIES)}» с ${year} по ${year + faker.number.int({ min: 1, max: 4 })} год`,
    () => `Познакомились на конференции ${pick(CONFERENCES)} в ${city}`,
    () => `Живём в одном доме в ${city}`,
    () => `Познакомились через общего друга — ${friend}`,
    () => `Вместе ходили в поход ${pick(HIKES)} в ${year} году`,
    () => `Познакомились на свадьбе у друзей в ${city}`,
    () => "Ходим в один спортзал, разговорились на тренировке",
    () => `Ехали в одном купе: ${CITIES[cityIndex]} — ${pick(CITIES)}`,
    () => `Вместе учились на курсах ${pick(COURSES)}`,
    () => "Познакомились в чате жильцов, потом встретились на субботнике",
    () => `Обращались к ${byPronoun(sex, "нему", "ней")} по рабочему вопросу в ${year} году`,
    () => "Дети ходят в одну школу, видимся на родительских собраниях",
    () => `Вместе волонтёрили на городском фестивале в ${city}`,
    () => `Учились в одной школе в ${city}`,
    () => "Познакомились в отпуске, жили в соседних номерах",
  ];
  return pick(variants)();
}

function noteBody(sex: Sex): string {
  const he = byPronoun(sex, "он", "она");
  const He = byPronoun(sex, "Он", "Она");
  const him = byPronoun(sex, "ему", "ей");
  const his = byPronoun(sex, "него", "неё");
  const ending = (male: string, female: string) => byPronoun(sex, male, female);
  const month = pick(MONTHS_PREPOSITIONAL);

  const variants = [
    () => `Созвонились. Договорились встретиться в ${month}, выпить кофе.`,
    () => `${ending("Рассказал", "Рассказала")}, что переезжает в ${pick(CITIES_ACCUSATIVE)}. Спросить, как устроились.`,
    () => `Договорились, что ${he} пришлёт контакты хорошего ${pick(SPECIALISTS)}.`,
    () => `Встретились, обменялись книгами — вернуть «${pick(BOOKS)}» до конца месяца.`,
    () => `У ${his} день рождения ${faker.number.int({ min: 1, max: 28 })} ${pick(MONTHS_GENITIVE)}. Не забыть поздравить.`,
    () => "Обсудили совместный проект. Договорились созвониться в следующий вторник.",
    () => `${He} ищет ${pick(LOOKING_FOR)}. Если попадётся что-то подходящее — переслать.`,
    () => `Поздравили с новосельем. ${He} ${ending("звал", "звала")} в гости в ${month}.`,
    () => `Одолжили ${him} палатку — вернёт после отпуска.`,
    () => `Обсудили ремонт: ${he} советует бригаду, телефон в переписке.`,
    () => `Договорились вместе сходить на концерт в ${month}. Билеты беру я.`,
    () => "Списались после долгого перерыва. Всё хорошо, сын пошёл в первый класс.",
    () => `Спросить, чем закончилась история с ${pick(TOPICS)}.`,
    () => `Встречу перенесли на ${pick(MONTHS_ACCUSATIVE)}. Напомнить за неделю.`,
    () => `${ending("Помог", "Помогла")} с резюме — отправить ${him} благодарность и небольшой подарок.`,
  ];
  return pick(variants)();
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return [...text.toLowerCase()]
    .map((char) => TRANSLIT[char] ?? (/[a-z0-9]/.test(char) ? char : ""))
    .join("");
}

function email(firstName: string, lastName: string): string {
  const first = transliterate(firstName);
  const last = transliterate(lastName);
  const local = pick([
    `${first}.${last}`,
    `${first}${last}${faker.number.int({ min: 1, max: 99 })}`,
    `${first[0]}.${last}`,
    `${last}.${first}`,
    `${first}_${faker.number.int({ min: 1970, max: 2005 })}`,
  ]);
  return `${local}@${pick(EMAIL_DOMAINS)}`;
}

function phone(): string {
  const digits = (length: number) =>
    faker.string.numeric({ length, allowLeadingZeros: true });
  return `+7 9${digits(2)} ${digits(3)}-${digits(2)}-${digits(2)}`;
}

function generate(total: number, now: Date) {
  const generatedContacts: (typeof contacts.$inferInsert)[] = [];
  const notesByContact: { body: string; createdAt: Date }[][] = [];

  for (let index = 0; index < total; index++) {
    const sex = faker.person.sexType() as Sex;
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName(sex);
    const createdAt = faker.date.past({ years: 3, refDate: now });

    const noteCount = faker.helpers.weightedArrayElement([
      { weight: 35, value: 0 },
      { weight: 30, value: 1 },
      { weight: 20, value: 2 },
      { weight: 10, value: 3 },
      { weight: 5, value: 5 },
    ]);
    const contactNotes = Array.from({ length: noteCount }, () => ({
      body: noteBody(sex),
      createdAt: faker.date.between({ from: createdAt, to: now }),
    }));
    const lastActivity = contactNotes.reduce(
      (latest, note) => (note.createdAt > latest ? note.createdAt : latest),
      createdAt,
    );

    generatedContacts.push({
      name: `${firstName} ${lastName}`,
      about: faker.datatype.boolean(0.85) ? pick(ABOUT)[sex] : null,
      howWeMet: faker.datatype.boolean(0.8) ? howWeMet(sex) : null,
      phone: faker.datatype.boolean(0.9) ? phone() : null,
      email: faker.datatype.boolean(0.75) ? email(firstName, lastName) : null,
      createdAt,
      updatedAt: lastActivity,
    });
    notesByContact.push(contactNotes);
  }

  return { generatedContacts, notesByContact };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}

async function main() {
  const requested = Number(process.argv[2] ?? DEFAULT_CONTACT_COUNT);
  if (!Number.isInteger(requested) || requested <= 0) {
    throw new Error(`Contact count must be a positive integer, got "${process.argv[2]}"`);
  }

  const client = postgres(getDatabaseUrl(), { max: 1 });
  const db = drizzle(client);

  try {
    const [{ value: existing }] = await db.select({ value: count() }).from(contacts);
    if (existing > 0) {
      console.log(
        `Seed skipped: the database already has ${existing} contacts. Seeding only runs on an empty database.`,
      );
      return;
    }

    faker.seed(20261010);
    const { generatedContacts, notesByContact } = generate(requested, new Date());

    const noteTotal = await db.transaction(async (tx) => {
      const ids: number[] = [];
      for (const batch of chunk(generatedContacts, BATCH_SIZE)) {
        const inserted = await tx
          .insert(contacts)
          .values(batch)
          .returning({ id: contacts.id });
        // Identity values are assigned in VALUES order.
        ids.push(...inserted.map((row) => row.id).sort((a, b) => a - b));
      }

      const generatedNotes = ids.flatMap((contactId, index) =>
        notesByContact[index].map((note) => ({ ...note, contactId })),
      );
      for (const batch of chunk(generatedNotes, BATCH_SIZE)) {
        await tx.insert(notes).values(batch);
      }
      return generatedNotes.length;
    });

    console.log(`Seeded ${generatedContacts.length} contacts and ${noteTotal} notes.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});

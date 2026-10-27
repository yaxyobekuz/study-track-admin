/**
 * YUZ TANISH DVIGATELI — brauzerda (ro'yxatga olish uchun).
 *
 * ⚠️ KIOSK DASTURI BILAN AYNI MODEL. Vektorlar bir-biri bilan
 * taqqoslanadi, ya'ni panelda olingan kadr kioskda ishlashi SHART.
 * Model nomi va o'lchami serverdagi sozlamada (`embeddingModel`,
 * `embeddingDim`) yozilgan va server mos kelmagan vektorni RAD etadi —
 * shu sababli bu yerda nom qo'lda yozilmaydi, sozlamadan tekshiriladi.
 *
 * ── NIMA UCHUN CDN'DAN, `node_modules` DAN EMAS ─────────────────────
 *
 * `@vladmandic/human` kutubxonasi ~1.5 MB, model fayllari esa ~10 MB.
 * Ularni admin panel bundle'iga qo'shish:
 *   · har deploy'ni 10 MB og'irlashtirardi;
 *   · ro'yxatga olish sahifasiga KIRMAYDIGAN 95% foydalanuvchiga
 *     tegishsiz yuk bo'lardi (`vite` model fayllarini bo'lib bermaydi).
 *
 * Shuning uchun kutubxona TALAB BO'LGANDA, dinamik `import()` bilan
 * yuklanadi. Kiosk dasturida esa aksincha — modellar OFFLINE, dastur
 * ichida: u internetsiz ishlashi kerak.
 *
 * ⚠️ `VITE_FACE_CDN` / `VITE_FACE_MODELS_URL` bilan o'z serveringizga
 * ko'chirish mumkin: internetsiz ofisda panel ham ishlashi kerak bo'lsa.
 */

/**
 * KUTUBXONA VERSIYASI — kutubxona ham, modellar ham shundan oladi.
 *
 * ⚠️ `face-id/package.json` dagi `@vladmandic/human` versiyasi bilan
 * AYNI bo'lishi SHART: panelda olingan vektor kioskda taqqoslanadi va
 * ikki xil model versiyasi ikki xil vektor beradi.
 */
const HUMAN_VERSION = "3.3.5";

/** Kutubxonaning ESM bundle'i. */
const HUMAN_CDN =
  import.meta.env.VITE_FACE_CDN ||
  `https://cdn.jsdelivr.net/npm/@vladmandic/human@${HUMAN_VERSION}/dist/human.esm.js`;

/**
 * Model fayllari — KUTUBXONANING O'Z PAKETIDAN.
 *
 * ⚠️ `@vladmandic/human-models` PAKETI EMAS: u alohida chiqadi va
 * versiyasi kutubxonadan orqada qoladi (3.0.4 va 3.3.5). Modellar
 * kutubxonaning o'z paketi ichida ham bor va aynan shu nusxa kiosk
 * dasturidagisi bilan bir xil (`face-id/scripts/fetch-models.js`
 * ularni `node_modules/@vladmandic/human/models/` dan ko'chiradi).
 *
 * ⚠️ VERSIYA QOTIB TURADI va kutubxona versiyasidan OLINADI. "latest"
 * ishlatilsa, paket yangilangan kuni model formati o'zgarib, BAZADAGI
 * BARCHA VEKTORLAR yaroqsiz bo'lib qolardi — ertalab butun maktab
 * "tanilmadi" bo'lib qolardi va sababi topilmasdi.
 */
const MODELS_URL =
  import.meta.env.VITE_FACE_MODELS_URL ||
  `https://cdn.jsdelivr.net/npm/@vladmandic/human@${HUMAN_VERSION}/models/`;

/**
 * Kiosk va panel ikkalasida AYNI konfiguratsiya.
 *
 * ⚠️ `face.description` — vektor beradigan model (`faceres`, 1024
 * o'lcham). `antispoof` va `liveness` — tiriklik. Uchalasi ham
 * YOQILGAN bo'lishi shart: server ularning ballarini talab qiladi va
 * nol kelgan kadrni tiriklik tekshiruvidan o'tmagan deb rad etadi.
 *
 * ⚠️ Keraksiz modullar (`body`, `hand`, `gesture`, `emotion`)
 * O'CHIRILGAN: ular kadrni 3-4 barobar sekinlashtiradi va bu yerda
 * hech narsaga kerak emas.
 */
const HUMAN_CONFIG = {
  modelBasePath: MODELS_URL,
  backend: "webgl",
  cacheSensitivity: 0,
  warmup: "none",
  filter: { enabled: true, equalization: false },
  face: {
    enabled: true,
    detector: { rotation: false, maxDetected: 2, minConfidence: 0.3, return: false },
    mesh: { enabled: true },
    iris: { enabled: false },
    description: { enabled: true },
    emotion: { enabled: false },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
  segmentation: { enabled: false },
};

/** Model nomi — serverdagi `embeddingModel` bilan AYNI qiymat. */
export const ENGINE_MODEL = "human/faceres";

/** Vektor o'lchami — serverdagi `embeddingDim` bilan AYNI qiymat. */
export const ENGINE_DIM = 1024;

let enginePromise = null;

/**
 * Dvigatelni bir marta yuklaydi (keyingi chaqiruvlar o'sha nusxani oladi).
 *
 * ⚠️ Promise KESHLANADI, natija emas: sahifa ikki joydan bir vaqtda
 * chaqirsa (kamera va "qayta urinish" tugmasi), modellar IKKI MARTA
 * yuklanib, 50 MB tarmoq ketardi.
 *
 * ⚠️ XATO BO'LSA KESH TOZALANADI: internet qaytganda "Qayta urinish"
 * tugmasi ishlashi kerak, aks holda sahifani yangilashdan boshqa yo'l
 * qolmasdi.
 *
 * @returns {Promise<object>} `Human` nusxasi
 */
export const loadFaceEngine = () => {
  if (enginePromise) return enginePromise;

  enginePromise = (async () => {
    // `@vite-ignore` — manzil ish vaqtida hal qilinadi (env bilan
    // almashtirilishi mumkin), shuning uchun Vite uni bundle'ga
    // qo'shmasligi kerak.
    const module = await import(/* @vite-ignore */ HUMAN_CDN);
    const Human = module.Human || module.default?.Human || module.default;
    if (!Human) throw new Error("Yuz tanish kutubxonasi yuklanmadi");

    const human = new Human(HUMAN_CONFIG);
    await human.load();
    await human.warmup();
    return human;
  })();

  enginePromise.catch(() => {
    enginePromise = null;
  });

  return enginePromise;
};

/**
 * BITTA KADRDAN YUZNI O'QIYDI.
 *
 * ⚠️ IKKI YUZ KO'RINSA RAD ETILADI. Kirish eshigida orqada turgan odam
 * kadrga tushishi odatiy hol va qaysi yuz kimnikiligi noaniq bo'lib
 * qoladi: "navbatdagi odam o'zi o'tdi, orqadagi ham o'tdi" degan holat
 * eng yomoni bo'lardi.
 *
 * ⚠️ `embedding` MASSIV sifatida qaytadi (`Array.from`): u JSON orqali
 * serverga ketadi va `Float32Array` JSON'da obyekt bo'lib ketardi
 * (`{"0": 0.1, "1": ...}`).
 *
 * @param {object} human - `loadFaceEngine()` natijasi
 * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} source
 * @returns {Promise<{ ok: boolean, reason?: string, face?: object, embedding?: number[], quality?: number, liveness?: number, antispoof?: number }>}
 */
export const readFace = async (human, source) => {
  const result = await human.detect(source);
  const faces = result?.face || [];

  if (faces.length === 0) return { ok: false, reason: "no_face" };
  if (faces.length > 1) return { ok: false, reason: "many_faces" };

  const face = faces[0];
  if (!Array.isArray(face.embedding) || face.embedding.length === 0) {
    // Mesh yoki description modeli hali yuklanmagan bo'lishi mumkin —
    // bu "yuz yo'q" emas, "hali hisoblanmadi".
    return { ok: false, reason: "no_embedding" };
  }

  return {
    ok: true,
    face,
    embedding: Array.from(face.embedding),
    quality: Number(face.faceScore ?? face.score ?? 0),
    liveness: Number(face.live ?? 0),
    antispoof: Number(face.real ?? 0),
  };
};

/**
 * KADRNI JPEG (base64) ga aylantiradi — audit rasmi uchun.
 *
 * ⚠️ FAQAT YUZ ATROFI kesiladi va kichraytiriladi (kengligi 320 px,
 * sifat 0.7): to'liq kadr 300 KB, yuz esa ~20 KB bo'ladi. Server 400
 * KB dan kattasini rad etadi, lekin asosiy sabab boshqa — kirish
 * eshigidagi kamera kuniga minglab kadr yozadi.
 *
 * ⚠️ Yuz koordinatasi bo'lmasa butun kadr olinadi: rasm audit uchun va
 * "rasm yo'q" undan yomonroq.
 *
 * @param {HTMLVideoElement} video
 * @param {object} [face] - `readFace` natijasidagi `face`
 * @returns {string|null} `data:` prefiksisiz base64
 */
export const captureSnapshot = (video, face) => {
  const vw = video.videoWidth || video.clientWidth;
  const vh = video.videoHeight || video.clientHeight;
  if (!vw || !vh) return null;

  // Yuz atrofidan 40% zapas — iyak va soch ham kadrga tushsin.
  let [bx, by, bw, bh] = face?.box || [0, 0, vw, vh];
  const padX = bw * 0.4;
  const padY = bh * 0.4;
  bx = Math.max(0, bx - padX);
  by = Math.max(0, by - padY);
  bw = Math.min(vw - bx, bw + padX * 2);
  bh = Math.min(vh - by, bh + padY * 2);

  const target = 320;
  const scale = Math.min(1, target / bw);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bw * scale);
  canvas.height = Math.round(bh * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, bx, by, bw, bh, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
};

/** Kadr rad etilgan sababining o'zbekcha matni. */
export const FACE_REASONS = {
  no_face: "Yuz ko'rinmayapti — kameraga to'g'ri qarang",
  many_faces: "Kadrda bir nechta yuz bor — yolg'iz turing",
  no_embedding: "Modellar hali yuklanmoqda — bir lahza kutib turing",
};

/**
 * SERVERDAN KELGAN FAYLNI SAQLASH.
 *
 * ⚠️ FAYL NOMI SERVER SARLAVHASIDAN OLINADI. Uni mijozda yig'ish
 * server bilan ikki xil nom berardi (masalan sana formati boshqacha
 * bo'lardi) va foydalanuvchi "qaysi fayl qaysi hisobot" degan savolga
 * javob topolmasdi. Sarlavha yetib kelmasa (CORS'da `Content-Disposition`
 * ochiq bo'lmasa) zaxira nom ishlatiladi.
 *
 * ⚠️ `revokeObjectURL` MAJBURIY: aks holda har yuklab olishda blob
 * xotirada qolib ketadi — uzoq ochiq turadigan panelda bu sezilarli
 * o'sish.
 *
 * @param {import("axios").AxiosResponse} response - `responseType: "blob"` bilan
 * @param {string} [fallbackName] - sarlavha bo'lmasa ishlatiladigan nom
 */
export const downloadBlob = (response, fallbackName = "hisobot.xlsx") => {
  const disposition =
    response?.headers?.["content-disposition"] ||
    response?.headers?.get?.("content-disposition") ||
    "";

  // `filename*=UTF-8''...` (RFC 5987) va oddiy `filename="..."` — ikkalasi ham.
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  const name = utf8
    ? decodeURIComponent(utf8[1])
    : plain
      ? plain[1].trim()
      : fallbackName;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

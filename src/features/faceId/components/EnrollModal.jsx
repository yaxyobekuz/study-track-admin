// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { CheckCircle2, Trash2, UserRound } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import FaceCapture from "./FaceCapture";
import FaceSnapshot from "./FaceSnapshot";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data & queries
import { RECOMMENDED_SAMPLES } from "../data/faceId.data";
import { faceIdQueries } from "../queries/faceId.queries";
import {
  useAddFaceSample,
  useRemoveFaceProfile,
  useRemoveFaceSample,
} from "../queries/faceId.mutations";

/**
 * BITTA ODAMNI RO'YXATGA OLISH — kamera va olingan kadrlar bir ekranda.
 *
 * ⚠️ BIR NECHTA KADR TAVSIYA ETILADI va buni ekran AYTADI. Bitta vektor
 * bilan ko'zoynak kiygan (yoki soch turmagi o'zgargan) odam kiosk
 * oldida har kuni "tanilmadi" bo'lardi — taqqoslash eng yaxshi namuna
 * bo'yicha ketadi (`.claude/rules/face-id.md`).
 *
 * ⚠️ DUBLIKAT XATOSI MA'NOLI KO'RSATILADI. Server 409 bilan "bu yuz
 * allaqachon boshqa odamga biriktirilgan: Aliyev Vali" deydi va shu
 * matn ekranda turishi SHART: "saqlanmadi" deb o'tib ketilsa, xodim
 * qaytadan urinib yurardi va sabab hech qachon ko'rinmasdi.
 */
const EnrollModal = () => (
  <ResponsiveModal
    name="faceEnroll"
    title="Yuzni ro'yxatga olish"
    description="Kameraga qarab turgan odamning bir nechta kadrini oling"
    className="max-w-3xl"
  >
    <EnrollBody />
  </ResponsiveModal>
);

const EnrollBody = ({ close, person, settings }) => {
  const { can } = usePermissions();
  const [lastError, setLastError] = useState(null);

  const userId = person?.userId;
  const { data: profile } = useQuery(faceIdQueries.profile(userId));

  const addSample = useAddFaceSample();
  const removeSample = useRemoveFaceSample();
  const removeProfile = useRemoveFaceProfile();

  const samples = profile?.profile?.samples ?? [];
  const count = samples.length;
  const maxSamples = settings?.maxSamplesPerPerson ?? 5;

  const handleCapture = (payload) => {
    setLastError(null);
    addSample.mutate(
      { userId, data: payload },
      {
        onSuccess: (result) => {
          toast.success(
            result.replacedCount > 0
              ? "Kadr saqlandi — eng eski kadr o'chirildi"
              : "Kadr saqlandi",
          );
        },
        onError: (error) => {
          const data = error?.response?.data;
          // Dublikat — alohida ko'rsatiladi, chunki keyingi qadam boshqa:
          // "boshqa odamni tanlang" yoki "o'sha odamning profilini
          // tekshirib ko'ring".
          setLastError({
            message: data?.message || "Kadr saqlanmadi",
            duplicate: data?.details?.reason === "duplicate_face",
            name: data?.details?.name,
          });
          toast.error(data?.message || "Kadr saqlanmadi");
        },
      },
    );
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* ── Chap: kamera ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          {person?.photo ? (
            <img src={person.photo} alt="" className="size-9 rounded-full object-cover" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-gray-100">
              <UserRound className="size-4 text-gray-400" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{person?.name}</p>
            <p className="text-[11.5px] text-gray-500">
              {person?.role === "student" ? "O'quvchi" : "Xodim"}
            </p>
          </div>
        </div>

        <FaceCapture
          settings={settings}
          busy={addSample.isPending}
          onCapture={handleCapture}
        />

        {lastError && (
          <div
            className={cn(
              "rounded-xl px-3.5 py-2.5",
              lastError.duplicate ? "bg-rose-50" : "bg-amber-50",
            )}
          >
            <p
              className={cn(
                "text-[12.5px] font-medium",
                lastError.duplicate ? "text-rose-900" : "text-amber-900",
              )}
            >
              {lastError.message}
            </p>
            {lastError.duplicate && (
              <p className="mt-1 text-[11.5px] leading-snug text-rose-700">
                Bitta yuz ikki odamga biriktirilsa, kiosk ularni adashtirib
                davomatni tasodifiy belgilab ketadi. Avval{" "}
                <b>{lastError.name}</b> ning profilini tekshirib ko'ring.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── O'ng: olingan kadrlar ── */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[12.5px] font-medium text-gray-700">
            Olingan kadrlar: {count} / {maxSamples}
          </p>
          {count >= RECOMMENDED_SAMPLES && (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              Yetarli
            </span>
          )}
        </div>

        {count < RECOMMENDED_SAMPLES && (
          <div className="rounded-xl bg-sky-50 px-3.5 py-2.5">
            <p className="text-[11.5px] leading-snug text-sky-800">
              Kamida <b>{RECOMMENDED_SAMPLES} kadr</b> oling: bittasi
              ko'zoynakli, bittasi ko'zoynaksiz, bittasi boshqa yorug'likda.
              Bitta kadr bilan odam har kuni "tanilmadi" bo'lib qolishi mumkin.
            </p>
          </div>
        )}

        {count === 0 ? (
          <p className="py-8 text-center text-[12.5px] text-gray-400">
            Hali kadr olinmagan
          </p>
        ) : (
          <ul className="space-y-2">
            {samples.map((sample) => (
              <li
                key={sample.id}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2"
              >
                {/* ⚠️ Rasm OCHIQ URL BILAN kelmaydi — u `faceId.events`
                    ruxsati ortidagi API yo'li va token bilan yuklanadi
                    (`FaceSnapshot` izohiga qarang). */}
                <FaceSnapshot
                  path={sample.snapshotUrl}
                  className="size-10 shrink-0 rounded-lg"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-gray-800">
                    Sifat {sample.qualityPercent ?? 0}%
                  </p>
                  <p className="truncate text-[11px] text-gray-500">
                    {formatDateTimeUz(sample.createdAt)}
                  </p>
                </div>

                {can("faceId.unenroll") && (
                  <ConfirmPopover
                    danger
                    title="Kadrni o'chirish?"
                    confirmLabel="O'chirish"
                    tooltip="O'chirish"
                    onConfirm={() =>
                      removeSample.mutate(sample.id, {
                        onSuccess: () => toast.success("Kadr o'chirildi"),
                      })
                    }
                  >
                    <Button variant="ghost" size="icon" className="text-rose-600">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </ConfirmPopover>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          {count > 0 && can("faceId.unenroll") ? (
            <ConfirmPopover
              danger
              title="Profilni butunlay o'chirish?"
              description="Barcha kadrlar o'chiriladi va odam kiosk orqali o'ta olmaydi. Urinishlar jurnali o'z holida qoladi."
              confirmLabel="O'chirish"
              onConfirm={() =>
                removeProfile.mutate(userId, {
                  onSuccess: () => {
                    toast.success("Profil o'chirildi");
                    close();
                  },
                })
              }
            >
              <Button variant="ghost" className="gap-1.5 text-rose-600">
                <Trash2 className="size-4" />
                Profilni o'chirish
              </Button>
            </ConfirmPopover>
          ) : (
            <span />
          )}

          <Button type="button" onClick={() => close()}>
            Yopish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollModal;

// Sounds
import {
  softClickSound,
  buttonClickSound,
  completeSuccessSound,
  confirmSuccessSound,
  alertErrorSound,
  rejectErrorSound,
  popNotificationSound,
} from "@/shared/assets/sounds";

export const soundCategories = ["click", "success", "error", "notification"];

export const soundSentiments = [
  "neutral",
  "positive",
  "negative",
  "informational",
];

export const soundCatalog = [
  // Click Sounds
  {
    id: "click-soft",
    key: "softClickSound",
    category: "click",
    sentiment: "neutral",
    tags: ["click", "tap", "soft", "ui"],
    src: softClickSound,
  },
  {
    id: "click-button",
    key: "buttonClickSound",
    category: "click",
    sentiment: "neutral",
    tags: ["click", "button", "press", "ui"],
    src: buttonClickSound,
  },

  // Success Sounds
  {
    id: "success-complete",
    key: "completeSuccessSound",
    category: "success",
    sentiment: "positive",
    tags: ["success", "complete", "done", "finish"],
    src: completeSuccessSound,
  },
  {
    id: "success-confirm",
    key: "confirmSuccessSound",
    category: "success",
    sentiment: "positive",
    tags: ["success", "confirm", "approve", "accept"],
    src: confirmSuccessSound,
  },

  // Error Sounds
  {
    id: "error-alert",
    key: "alertErrorSound",
    category: "error",
    sentiment: "negative",
    tags: ["error", "alert", "warning", "danger"],
    src: alertErrorSound,
  },
  {
    id: "error-reject",
    key: "rejectErrorSound",
    category: "error",
    sentiment: "negative",
    tags: ["error", "reject", "deny", "fail"],
    src: rejectErrorSound,
  },

  // Notification Sounds
  {
    id: "notification-pop",
    key: "popNotificationSound",
    category: "notification",
    sentiment: "informational",
    tags: ["notification", "pop", "alert", "info"],
    src: popNotificationSound,
  },
];

export const clickSounds = soundCatalog.filter(
  (item) => item.category === "click",
);

export const successSounds = soundCatalog.filter(
  (item) => item.category === "success",
);

export const errorSounds = soundCatalog.filter(
  (item) => item.category === "error",
);

export const notificationSounds = soundCatalog.filter(
  (item) => item.category === "notification",
);

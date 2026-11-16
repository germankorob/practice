// Публичная страница прогресса: только числа, без содержания личных заметок.
import "./style.css";
import { api } from "./api";
import { need } from "./ui";

async function showProgress(): Promise<void> {
  const progress = await api.publicProgress();
  need("[data-progress='cards_learned']").textContent = String(
    progress.cards_learned,
  );
  need("[data-progress='cards_total']").textContent = String(
    progress.cards_total,
  );
  need("[data-progress='reviews_total']").textContent = String(
    progress.reviews_total,
  );
  need("[data-progress='streak']").textContent = String(progress.streak);
}

showProgress().catch(() => {
  need("#progress-status").textContent = "Не удалось загрузить прогресс.";
});

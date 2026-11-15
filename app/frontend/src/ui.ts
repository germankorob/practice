// Общие помощники интерфейса: поиск элементов, строка статуса, кнопки.
import { ApiError } from "./api";

export function need(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) {
    throw new Error(`нет элемента: ${selector}`);
  }
  return el;
}

export function field(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value === "string") {
    return value;
  }
  return "";
}

export function showError(error: unknown): void {
  const statusBar = need("#status");
  statusBar.dataset.state = "error";

  if (error instanceof ApiError && error.status === 401) {
    // Личные данные закрыты токеном: показываем форму входа.
    statusBar.textContent = "Заметки личные — введите токен доступа.";
    need("#token-form").hidden = false;
    return;
  }

  if (error instanceof ApiError) {
    statusBar.textContent = `Ошибка: ${error.message}`;
  } else {
    statusBar.textContent = "Что-то пошло не так";
  }
}

export function clearStatus(): void {
  const statusBar = need("#status");
  statusBar.textContent = "";
  delete statusBar.dataset.state;
}

// Запустить действие по кнопке: блокируем её на время запроса и показываем ошибки.
export function onClick(
  button: HTMLButtonElement,
  action: () => Promise<void>,
): void {
  button.addEventListener("click", () => {
    button.disabled = true;
    clearStatus();
    action()
      .catch(showError)
      .finally(() => {
        button.disabled = false;
      });
  });
}

export function button(text: string, testId: string): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = text;
  el.dataset.testid = testId;
  return el;
}

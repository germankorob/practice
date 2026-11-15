import "./style.css";
import { api, saveToken, type Card, type Grade } from "./api";
import { parseTags } from "./format";
import { noteItem } from "./notes";
import { button, clearStatus, field, need, onClick, showError } from "./ui";

const GRADES: Grade[] = ["again", "hard", "good", "easy"];

const GRADE_LABELS: Record<Grade, string> = {
  again: "не помню",
  hard: "с трудом",
  good: "помню",
  easy: "легко",
};

// Тег, по которому сейчас отфильтрован список заметок ("" — без фильтра).
let currentTag = "";

function cardItem(card: Card): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.className = "card";
  wrap.dataset.testid = "queue-card";
  wrap.dataset.id = card.id;

  const front = document.createElement("p");
  front.className = "front";
  front.textContent = card.front;

  // Ответ спрятан: сначала нужно попробовать вспомнить самому.
  const answer = document.createElement("details");
  answer.className = "answer";
  const summary = document.createElement("summary");
  summary.textContent = "Показать ответ";
  const back = document.createElement("p");
  back.className = "back";
  back.textContent = card.back;
  answer.append(summary, back);

  const buttons = document.createElement("div");
  buttons.className = "grade-buttons";
  for (const grade of GRADES) {
    const gradeButton = button(GRADE_LABELS[grade], `grade-${grade}`);
    gradeButton.setAttribute("aria-label", `Оценить: ${GRADE_LABELS[grade]}`);
    onClick(gradeButton, async () => {
      await api.grade(card.id, grade);
      await refreshAll();
    });
    buttons.append(gradeButton);
  }

  wrap.append(front, answer, buttons);
  return wrap;
}

async function refreshStats(): Promise<void> {
  const stats = await api.stats();
  need("[data-stat='due_today']").textContent = `сегодня: ${stats.due_today}`;
  need("[data-stat='due_week']").textContent = `за неделю: ${stats.due_week}`;
  need("[data-stat='streak']").textContent = `серия: ${stats.streak}`;
}

function filterByTag(tag: string): void {
  currentTag = tag;
  refreshNotes().catch(showError);
}

async function refreshNotes(): Promise<void> {
  let tag: string | undefined;
  if (currentTag !== "") {
    tag = currentTag;
  }
  const notes = await api.listNotes(tag);
  const items: HTMLLIElement[] = [];
  for (const note of notes) {
    items.push(noteItem(note, { refresh: refreshAll, filterByTag }));
  }
  need("#note-list").replaceChildren(...items);

  const filter = need("#tag-filter");
  filter.hidden = currentTag === "";
  need("#tag-filter-name").textContent = `#${currentTag}`;
}

async function refreshQueue(): Promise<void> {
  const cards = await api.queue();
  const box = need("#queue");
  if (cards.length === 0) {
    const done = document.createElement("p");
    done.dataset.testid = "queue-empty";
    done.textContent = "На сегодня всё повторено.";
    box.replaceChildren(done);
    return;
  }
  const items: HTMLDivElement[] = [];
  for (const card of cards) {
    items.push(cardItem(card));
  }
  box.replaceChildren(...items);
}

async function refreshAll(): Promise<void> {
  await Promise.all([refreshStats(), refreshNotes(), refreshQueue()]);
}

function setUpNoteForm(): void {
  const form = need("#note-form");
  if (!(form instanceof HTMLFormElement)) {
    throw new Error("нет формы #note-form");
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submit = form.querySelector<HTMLButtonElement>(
      "button[type='submit']",
    );
    if (!submit) {
      return;
    }
    const data = new FormData(form);
    const input = {
      title: field(data, "title"),
      body: field(data, "body"),
      tags: parseTags(field(data, "tags")),
    };

    submit.disabled = true;
    clearStatus();
    api
      .createNote(input)
      .then(() => {
        form.reset();
        return refreshNotes();
      })
      .catch(showError)
      .finally(() => {
        submit.disabled = false;
      });
  });
}

// Вход по токену: сохраняем его в браузере и перечитываем данные.
function setUpTokenForm(): void {
  const form = need("#token-form");
  if (!(form instanceof HTMLFormElement)) {
    throw new Error("нет формы #token-form");
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveToken(field(new FormData(form), "token"));
    form.reset();
    form.hidden = true;
    clearStatus();
    refreshAll().catch(showError);
  });
}

const resetFilter = need("#tag-filter-reset");
resetFilter.addEventListener("click", () => {
  filterByTag("");
});

setUpNoteForm();
setUpTokenForm();

need("#status").textContent = "Загрузка…";
refreshAll().then(clearStatus, showError);

// Элемент списка заметок: теги-фильтры, удаление и создание карточки из заметки.
import { api, type Note } from "./api";
import { button, clearStatus, field, onClick, showError } from "./ui";

export interface NoteActions {
  // Перечитать данные после изменения.
  refresh: () => Promise<void>;
  // Показать только заметки с этим тегом.
  filterByTag: (tag: string) => void;
}

function tagButtons(note: Note, actions: NoteActions): HTMLSpanElement {
  const tags = document.createElement("span");
  tags.className = "note-tags";
  for (const tag of note.tags) {
    const tagButton = button(`#${tag}`, "tag");
    tagButton.className = "tag";
    tagButton.setAttribute("aria-label", `Показать заметки с тегом ${tag}`);
    tagButton.addEventListener("click", () => {
      actions.filterByTag(tag);
    });
    tags.append(tagButton);
  }
  return tags;
}

// Форма «вопрос — ответ»: карточка создаётся из конкретной заметки.
function cardForm(note: Note, actions: NoteActions): HTMLFormElement {
  const form = document.createElement("form");
  form.className = "card-form";
  form.dataset.testid = "card-form";
  form.hidden = true;

  const front = document.createElement("input");
  front.name = "front";
  front.required = true;
  front.placeholder = "Вопрос";
  front.setAttribute("aria-label", "Вопрос карточки");

  const back = document.createElement("input");
  back.name = "back";
  back.required = true;
  back.placeholder = "Ответ";
  back.setAttribute("aria-label", "Ответ карточки");

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Сохранить карточку";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    submit.disabled = true;
    clearStatus();
    api
      .createCard({
        note_id: note.id,
        front: field(data, "front"),
        back: field(data, "back"),
      })
      .then(() => {
        form.reset();
        form.hidden = true;
        return actions.refresh();
      })
      .catch(showError)
      .finally(() => {
        submit.disabled = false;
      });
  });

  form.append(front, back, submit);
  return form;
}

export function noteItem(note: Note, actions: NoteActions): HTMLLIElement {
  const item = document.createElement("li");
  item.dataset.testid = "note";
  item.dataset.id = note.id;

  const head = document.createElement("div");
  head.className = "note-head";

  const title = document.createElement("span");
  title.className = "note-title";
  title.textContent = note.title;

  const addCard = button("+ карточка", "add-card");
  addCard.setAttribute(
    "aria-label",
    `Сделать карточку из заметки: ${note.title}`,
  );

  const remove = button("удалить", "delete-note");
  remove.setAttribute("aria-label", `Удалить заметку: ${note.title}`);
  onClick(remove, async () => {
    await api.deleteNote(note.id);
    await actions.refresh();
  });

  head.append(title, tagButtons(note, actions), addCard, remove);
  item.append(head);

  if (note.body !== "") {
    const body = document.createElement("p");
    body.className = "note-body";
    body.textContent = note.body;
    item.append(body);
  }

  const form = cardForm(note, actions);
  addCard.addEventListener("click", () => {
    form.hidden = !form.hidden;
  });
  item.append(form);

  return item;
}

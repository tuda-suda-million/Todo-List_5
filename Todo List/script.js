class TodoItem {
    constructor(id, text) {
        this.id = id;
        this.text = text;
        this.completed = false;
    }
}

class TodoManager {
    #todos = [];

    constructor() {
        const saved = JSON.parse(localStorage.getItem("todos"));
        if (saved) this.#todos = saved;
    }

    save() {
        localStorage.setItem("todos", JSON.stringify(this.#todos))
    }

    add(text) {
        const newTodo = new TodoItem(Date.now(), text);
        this.#todos.unshift(newTodo);
        this.save();
    }

    getAll() {
        return this.#todos
    }

    getLength() {
        return this.#todos.length;
    }

    toggleCompleted(id) {
        this.#todos = this.#todos.map((item) => {
            if (item.id === id) {
                return { ...item, completed: !item.completed }
            } else {
                return item
            }
        })
        this.save();
    }

    update(id, newText) {
        this.#todos = this.#todos.map((item) => {
            if (item.id === id) {
                return { ...item, text: newText }
            } else {
                return item
            }
        })
        this.save();
    }

    delete(id) {
        this.#todos = this.#todos.filter((item) => item.id !== id);
        this.save();
    }

    cleanCompleted() {
        this.#todos = this.#todos.filter((item) => item.completed !== true);
        this.save();
    }
}

const myTodoManager = new TodoManager();

// Elements
const todosCollection = document.querySelector(".list");
const form = document.querySelector(".add");
const stats = document.querySelector(".stats");

// Старт
renderTasks(myTodoManager.getAll());
showLength();

document.getElementById("clean-completed").addEventListener("click", () => {
    myTodoManager.cleanCompleted();
    renderTasks(myTodoManager.getAll());
    showLength();
})

todosCollection.addEventListener("click", (event) => {
    const selectedItem = event.target;
    if (selectedItem.id === "delete") {
        const article = selectedItem.parentElement.parentElement;

        myTodoManager.delete(Number(article.dataset.id));
        renderTasks(myTodoManager.getAll());
        showLength();
        return;
    }

    if (selectedItem.id === "edit") {
        const article = selectedItem.parentElement.parentElement;

        const articleInput = article.querySelector(".text");
        articleInput.classList.add("editable");
        articleInput.focus();

        selectedItem.textContent = "💾";
        selectedItem.id = "save";
        selectedItem.title = "Сохранить";

        const deleteBtn = selectedItem.nextElementSibling;

        deleteBtn.textContent = "❌"
        deleteBtn.id = "cancel";
        deleteBtn.title = "Отменить";

        return;
    }

    if (selectedItem.id === "save") {
        const article = selectedItem.parentElement.parentElement;
        const articleInput = article.querySelector(".text");

        myTodoManager.update(Number(article.dataset.id), articleInput.value)

        articleInput.classList.remove("editable");

        selectedItem.id = "edit"
        selectedItem.title = "Редактировать"
        selectedItem.textContent = "✎"

        const deleteBtn = selectedItem.nextElementSibling;

        deleteBtn.id = "delete"
        deleteBtn.title = "Удалить"
        deleteBtn.textContent = "🗑"

        return;
    }

    if (selectedItem.id === "cancel") {
        const article = selectedItem.parentElement.parentElement;
        const articleInput = article.querySelector(".text");

        articleInput.classList.remove("editable");
        renderTasks(myTodoManager.getAll());

        selectedItem.id = "delete";
        selectedItem.title = "Удалить";
        selectedItem.textContent = "🗑";

        const saveBtn = selectedItem.previousElementSibling;

        saveBtn.id = "edit";
        saveBtn.title = "Редактировать";
        saveBtn.textContent = "✎";

        return;
    }

    if (selectedItem.id === "checkbox") {
        const article = selectedItem.parentElement;
        myTodoManager.toggleCompleted(Number(article.dataset.id))
        renderTasks(myTodoManager.getAll());
    }
})

// События
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const todoName = document.getElementById("todoName").value;

    if (todoName) myTodoManager.add(todoName);
    document.getElementById("todoName").value = "";

    renderTasks(myTodoManager.getAll());
    showLength()
})



// Функции
function showLength() {
    const len = myTodoManager.getLength();
    stats.textContent = `${len} / 5`;

    if (todosCollection.children.length >= 5) {
        form.lastElementChild.disabled = true;
    } else {
        form.lastElementChild.disabled = false;
    }
}

function renderTasks(todos) {
    todosCollection.innerHTML = "";

    if (todos.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("empty");
        emptyDiv.textContent = " Пока задач нет — добавьте первую задачу, чтобы начать.";
        todosCollection.appendChild(emptyDiv);
        return;
    }


    todos.forEach((todo, idx) => {
        // Article
        const todoWrapper = document.createElement("article");
        todoWrapper.dataset.id = todo.id;

        if (todo.completed === true) {
            todoWrapper.className = "item done"
        } else {
            todoWrapper.className = "item"
        }

        // div - checkbox
        const checkbox = document.createElement("div");
        checkbox.role = "button";
        checkbox.id = "checkbox";

        if (todo.completed === true) {
            checkbox.className = "checkbox checked";
            checkbox.ariaPressed = true;
            checkbox.title = "Выполнено";
            checkbox.textContent = "✓"
        } else {
            checkbox.className = "checkbox";
            checkbox.ariaPressed = false;
            checkbox.title = "Отметить как выполненное";
        }

        // div - content
        const content = document.createElement("div");
        content.className = "content";

        const contentText = document.createElement("input");
        contentText.className = "text";
        contentText.value = `${todo.text}`;
        contentText.id = todo.id;

        // Actions
        const actions = document.createElement("div")
        actions.className = "actions"

        const button = document.createElement("button")
        button.id = "edit"
        button.className = "btn-icon"
        button.title = "Редактировать"
        button.textContent = "✎"

        const button2 = document.createElement("button");
        button2.id = "delete"
        button2.className = "btn-icon"
        button2.title = "Удалить"
        button2.textContent = "🗑"

        actions.append(button, button2)
        content.appendChild(contentText);
        todoWrapper.append(checkbox, content, actions)

        todosCollection.append(todoWrapper);
    })
}


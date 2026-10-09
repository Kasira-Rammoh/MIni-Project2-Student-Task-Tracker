const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const filterButtons = document.querySelectorAll('.filters button');

async function loadTasks(filter = 'all') {
  let url = '/api/tasks';

  if (filter === 'active') {
    url = '/api/tasks?done=false';
  }

  if (filter === 'completed') {
    url = '/api/tasks?done=true';
  }

  const response = await fetch(url);
  const tasks = await response.json();

  renderTasks(tasks);
}

function formatDueDate(value) {
  if (!value) {
    return 'ยังไม่กำหนดวันส่ง';
  }

  const [year, month, day] = value.slice(0, 10).split('-');

  return `${day}/${month}/${year}`;
}

function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
  taskList.innerHTML = `
    <div class="empty-state">
      <p>🌷 ยังไม่มีงานตรงนี้นะ</p>
    </div>
  `;

  return;
}

  tasks.forEach((task) => {
    const taskItem = document.createElement('div');

    if (task.done) {
        taskItem.classList.add('completed');
    }

    taskItem.innerHTML = `
        <h3>
            ${task.done ? '🌸' : '✨'} ${task.title}
        </h3>

        <p>📝 ${task.description}</p>
        <p>
          📚 Subject:
          <span class="category-badge">
            ${task.category || 'ไม่ระบุรายวิชา'}
          </span>
        </p>
        <p class="due-date">
          📅 Due Date: ${formatDueDate(task.dueDate)}
        </p>
        <p>
            ${task.done ? '✅ Completed' : '⏳ Active'}
        </p>

        <button class="toggle-btn">
            ${task.done ? '↩️ Mark Active' : '✅ Mark Completed'}
        </button>

        <button class="edit-btn">✏️ Edit</button>

        <button class="delete-btn">🗑️ Delete</button>
    `;

    const toggleButton = taskItem.querySelector('.toggle-btn');

    toggleButton.addEventListener('click', async () => {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          done: !task.done
        })
      });

      await loadTasks();
    });

    const editButton = taskItem.querySelector('.edit-btn');

    
editButton.addEventListener('click', async () => {

  const newTitle = prompt(
    'แก้ไขชื่องาน',
    task.title
  );

  const newDescription = prompt(
    'แก้ไขรายละเอียด',
    task.description
  );

  const newCategory = prompt(
    'แก้ไขรายวิชา',
    task.category
  );

  const newDueDate = prompt(
    'แก้ไขวันส่ง (YYYY-MM-DD) เว้นว่างหากไม่กำหนด',
    task.dueDate ? task.dueDate.slice(0, 10) : ''
  );

  // หากกด Cancel จะไม่บันทึก
  if (
    newTitle === null ||
    newDescription === null ||
    newCategory === null ||
    newDueDate === null
  ) {
    return;
  }

  if (!newTitle.trim()) {
    alert('กรุณากรอกชื่องาน');
    return;
  }

  // ตรวจสอบรูปแบบวันที่เบื้องต้น
  if (
    newDueDate &&
    !/^\d{4}-\d{2}-\d{2}$/.test(newDueDate)
  ) {
    alert('กรุณากรอกวันที่ในรูปแบบ YYYY-MM-DD');
    return;
  }

  const response = await fetch(`/api/tasks/${task.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      dueDate: newDueDate || null
    })
  });

  if (!response.ok) {
    alert('ไม่สามารถแก้ไขงานได้ กรุณาตรวจสอบข้อมูล');
    return;
  }

  await loadTasks();
});


    const deleteButton = taskItem.querySelector('.delete-btn');

    deleteButton.addEventListener('click', async () => {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      });

      await loadTasks();
    });

    taskList.appendChild(taskItem);
  });
}


taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // รับค่าจาก Form
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const dueDate = document.getElementById('dueDate').value;

  // ส่งข้อมูลไป Backend
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      description,
      category,
      dueDate: dueDate || null
    })
  });

  if (!response.ok) {
    alert('ไม่สามารถเพิ่มงานได้');
    return;
  }

  // โหลดรายการงานใหม่
  await loadTasks();

  // ล้างข้อมูลใน Form
  taskForm.reset();
});


filterButtons.forEach((button) => {
  button.addEventListener('click', () => {

    filterButtons.forEach((btn) => {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    const filter = button.dataset.filter;

    loadTasks(filter);
  });
});

loadTasks();
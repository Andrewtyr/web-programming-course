// src/testApi.ts — тест на реальный сервер dancv.ddns.net
async function testRealApi() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('Сначала залогинься через GitHub!');
    return;
  }

  try {
    const res = await fetch('http://dancv.ddns.net/api/categories', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`Ошибка ${res.status}`);

    const data = await res.json();
    console.log('Категории с реального сервера:', data);
    alert('Всё работает! Открывай консоль → увидишь категории с dancv.ddns.net');
  } catch (err) {
    console.error(err);
    alert('Ошибка: ' + (err as Error).message);
  }
}

// Запускаем тест
testRealApi();
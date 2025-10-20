/**
 * Задание 5: Responsive дизайн
 *
 * Задачи:
 * 1. Сделайте карточки responsive (TODO: grid с breakpoints для 1/2/3 колонок)
 * 2. Скройте элемент на мобильных (TODO: используйте hidden и md:block)
 * 3. Измените размер текста (TODO: text-sm на мобильных, text-base на десктопе)
 * 4. Сделайте кнопку полной ширины на мобильных (TODO: w-full и lg:w-auto)
 */

const products = [
  { id: 1, name: 'Товар 1', price: 1990, desc: 'Описание товара', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300' },
  { id: 2, name: 'Товар 2', price: 2990, desc: 'Описание товара', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' },
  { id: 3, name: 'Товар 3', price: 3990, desc: 'Описание товара', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300' },
  { id: 4, name: 'Товар 4', price: 4990, desc: 'Описание товара', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300' },
  { id: 5, name: 'Товар 5', price: 5990, desc: 'Описание товара', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300' },
  { id: 6, name: 'Товар 6', price: 6990, desc: 'Описание товара', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300' },
];

function Task5() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 5: Responsive дизайн</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task5.tsx</code> и добавьте responsive классы.
        Измените размер окна!
      </div>

      <div className="space-y-8">
        {/* 1. Responsive grid */}
        <div>
          <h3 className="text-lg font-semibold mb-3">1. Responsive grid (1→2→3 колонки)</h3>
          
          {/* TODO: добавьте grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded shadow">
                <h4 className="font-bold">{p.name}</h4>
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded mt-2" />
                <p className="text-gray-600 text-sm">{p.desc}</p>
                <p className="text-blue-600 font-bold mt-2">{p.price} ₽</p>
              </div>
            ))}
          
          </div>
        </div>

        {/* 2. Скрыть/показать элементы */}
        <div>
          <h3 className="text-lg font-semibold mb-3">2. Скрыть на мобильных, показать на планшетах+</h3>
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">Основной текст (всегда виден)</p>
            {/* TODO: добавьте hidden md:block */}
            <p className="text-gray-600 mt-2 hidden md:block">
              Дополнительная информация (только на планшетах и десктопах)
            </p>
          </div>
        </div>

        {/* 3. Responsive размеры текста */}
        <div>
          <h3 className="text-lg font-semibold mb-3">3. Responsive размер текста</h3>
          <div className="bg-white p-4 rounded shadow">
            {/* TODO: добавьте text-sm md:text-base lg:text-lg */}
            <p className="text-sm md:text-base lg:text-lg">
              Этот текст меняет размер: маленький на мобильных, средний на планшетах, большой на десктопах
            </p>
          </div>
        </div>

        {/* 4. Responsive кнопка */}
        <div>
          <h3 className="text-lg font-semibold mb-3">4. Кнопка: полная ширина → обычная</h3>
          <div className="bg-white p-4 rounded shadow">
            {/* TODO: добавьте w-full lg:w-auto */}
            <button className="bg-blue-500 text-white px-6 py-2 rounded w-full lg:w-auto">
              Купить
            </button>
          </div>
        </div>

        {/* Индикатор breakpoint */}
        <div className="mt-6 p-3 bg-gray-800 text-white rounded text-center font-semibold">
          <span className="md:hidden">📱 Mobile (&lt;768px)</span>
          <span className="hidden md:inline lg:hidden">💻 Tablet (768px-1023px)</span>
          <span className="hidden lg:inline">🖥 Desktop (≥1024px)</span>
        </div>
      </div>
    </div>
  );
}

export default Task5;

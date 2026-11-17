// Настройки конфигуратора шкатулки COFFIN BOFFIN
// Изображения: общий фон 1000x1000, слои PNG также 1000x1000.
window.BOX_CONFIGURATOR_CONFIG = {
  enabled: true,
  category: 'Шкатулки',
  productId: 4,
  productName: 'Шкатулка EPITAPH II',
  price: 1000,
  background: 'images/box-configurator/box-background.png',
  frontDesigns: [
    { id: 'ankh-pink', name: 'Розовый', image: 'images/box-configurator/front-ankh-pink.png' },
    { id: 'ankh-red', name: 'Красный', image: 'images/box-configurator/front-ankh-red.png' },
    { id: 'ankh-white', name: 'Белый', image: 'images/box-configurator/front-ankh-white.png' },
    { id: 'ankh-yellow', name: 'Жёлтый', image: 'images/box-configurator/front-ankh-yellow.png' },
    { id: 'ankh-yellow2', name: 'Жёлтый — вариант 2', image: 'images/box-configurator/front-ankh-yellow2.png' }
  ],
  frontBaseDesigns: [
    { id: 'base-black', name: 'Чёрный', image: 'images/box-configurator/front-base-black.png' },
    { id: 'base-pink', name: 'Розовый', image: 'images/box-configurator/front-base-pink.png' },
    { id: 'base-red', name: 'Красный', image: 'images/box-configurator/front-base-red.png' },
    { id: 'base-white', name: 'Белый', image: 'images/box-configurator/front-base-white.png' },
    { id: 'base-yellow', name: 'Жёлтый', image: 'images/box-configurator/front-base-yellow.png' },
    { id: 'base-yellow2', name: 'Жёлтый — вариант 2', image: 'images/box-configurator/front-base-yellow2.png' }
  ],
  backDesigns: [
    { id: 'tarot-joker', name: 'Joker', image: 'images/box-configurator/back-tarot-joker.png' },
    { id: 'tarot-pink-devil', name: 'Pink Devil', image: 'images/box-configurator/back-tarot-pink-devil.png' },
    { id: 'tarot-red-death', name: 'Red Death', image: 'images/box-configurator/back-tarot-red-death.png' },
    { id: 'tarot-sun', name: 'Sun', image: 'images/box-configurator/back-tarot-sun.png' },
    { id: 'tarot-white-death', name: 'White Death', image: 'images/box-configurator/back-tarot-white-death.png' },
    { id: 'tarot-white-devil', name: 'White Devil', image: 'images/box-configurator/back-tarot-white-devil.png' },
    { id: 'tarot-yellow-star', name: 'Yellow Star', image: 'images/box-configurator/back-tarot-yellow-star.png' },
    { id: 'tarot-zamok', name: 'Замок', image: 'images/box-configurator/back-tarot-zamok.png' }
  ],
  materials: [{ id: 'PLA', name: 'PLA' }, { id: 'PETG', name: 'PETG' }]
};

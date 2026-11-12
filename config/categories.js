// Категории магазина COFFIN BOFFIN
// Информационные карточки редактируются здесь отдельно для каждой категории.
// info — одна карточка; infoCards — несколько карточек в карусели.
// image — прямая ссылка на фото; description — общее описание;
// dimensions — размеры; packaging — информация об упаковке.
const CATEGORIES = [
  {
    name: 'Футляры для зажигалок',
    icon: '🕯️',
    description: 'Футляры для зажигалок BIC J3',
    keywords: [],
    enabled: true,
    infoCards: [
      {
        title: 'Футляр EMBER II',
        image: 'https://i.yapx.cc/eYqcQ.jpg',
        description: 'Зажигалка в подарок!',
        dimensions: '90х44х17',
        packaging: 'Без доп упаковки'
      },
      {
        title: 'Футляр ASHES II',
        image: 'https://i.yapx.cc/eYq9u.jpg',
        description: 'Зажигалка в подарок',
        dimensions: '74х36х17',
        packaging: 'Без доп упаковки'
      }
    ]
  },
  {
    name: 'Шкатулки',
    icon: '⚰️',
    description: 'Шкатулки для хранения мелочей',
    keywords: [],
    enabled: true,
    info: {
      title: '',
      image: '',
      description: '',
      dimensions: '',
      packaging: ''
    }
  },
  {
    name: 'Брелоки',
    icon: '🗝️',
    description: 'Брелоки и небольшие аксессуары',
    keywords: [],
    enabled: true,
    info: {
      title: '',
      image: '',
      description: '',
      dimensions: '',
      packaging: ''
    }
  }
];

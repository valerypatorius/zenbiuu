export default {
  library: 'Библиотека',
  router: {
    auth: 'Войти',
    library: 'Библиотека',
  },
  auth: {
    title: 'Начало',
    description: 'Для общения с API придется авторизоваться хотя бы в одном сервисе',
    disclaimer: 'Будет произведен переход в браузер. Персональные данные сохранятся только на текущем устройстве',
  },
  sidebar: {
    settings: 'Настройки',
    hide: 'Скрыть',
    foundItems: 'Результаты поиска',
    showOffline: 'Показать неактивные',
    hideOffline: 'Скрыть неактивные',
    searchError: 'Ничего не найдено',
  },
  settings: {
    title: 'Настройки',
    interface: {
      title: 'Интерфейс',
      general: 'Основные',
      isAlwaysOnTop: 'Поверх остальных окон',
      isBlurEnabled: 'Включить эффекты размытия',
      size: 'Размер интерфейса',
    },
    colorScheme: {
      title: 'Цветовая схема',
      system: 'Системная',
      dark: 'Тёмная',
      light: 'Светлая',
    },
    locale: {
      title: 'Язык',
      change: 'Сменить язык',
    },
    account: {
      title: 'Аккаунт',
      twitchSettings: 'Открыть настройки в браузере',
    },
    about: {
      title: 'О приложении',
      issue: 'Сообщить о проблеме на',
      iconBy: 'Иконка приложения от',
      interfaceIcons: 'Иконки интерфейса от',
      updateChecking: 'Проверка обновлений',
      updateNotNeeded: 'Установлена последняя версия',
      updateAvailable: 'Доступно обновление',
      updateDownload: 'Скачать',
      updateDownloading: 'Загружаем',
      updateInstall: 'Установить',
      updateProblems: 'Возникли проблемы?',
      updateManualDownload: 'Скачать вручную',
    },
    logout: 'Выйти',
  },
  chat: {
    connectingTo: 'Подключение к чату {channel}...',
    joinedAs: 'Вы вошли в чат {channel} как {name}',
    scrollToBottom: 'Прокрутить вниз',
    message: 'Сообщение',
    emotes: {
      hot: 'Актуальные',
      recent: 'Недавние',
      all: 'Все',
    },
  },
  player: {
    mute: 'Отключить звук',
    unmute: 'Включить звук',
    compressor: 'компрессор',
    source: 'Источник',
    auto: 'Авто',
    startedAt: 'Начало в',
    selectQuality: 'Выбрать качество',
    showSidebar: 'Показать боковую панель',
    hideSidebar: 'Скрыть боковую панель',
    showChat: 'Показать чат',
    hideChat: 'Скрыть чат',
    enterFullscreen: 'Открыть в полноэкранном режиме',
    exitFullscreen: 'Выйти из полноэкранного режима',
    setHorizontalLayout: 'Чат справа',
    setVerticalLayout: 'Чат снизу',
    ad: 'Реклама',
  },
  sorting: {
    label: 'Сортировать по',
    viewers: 'зрителям',
    channel: 'каналу',
    game: 'игре',
    duration: 'длительности',
  },
  version: 'Версия',
  legal: {
    disclaimer:
      '{name} не связано, не обслуживается, не спонсируется и не одобрено Twitch Interactive, Inc. или любыми связанными с ней компаниями.',
  },
  enable: 'Включить',
  disable: 'Отключить',
  openInBrowser: 'Открыть в браузере',
  search: 'Поиск',
  validUntilDate: 'Действует до {date}',
};

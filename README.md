# Apartment Sales

`Apartment Sales` - это учебный fullstack+ML проект для оценки рыночной стоимости квартиры по характеристикам объекта. В проекте объединены три части: обучение модели в ноутбуке, backend-сервис для инференса и мобильный/web-клиент для ввода параметров квартиры и получения прогноза.

## Что решает проект

Проект решает задачу быстрой предварительной оценки стоимости недвижимости без ручного анализа объявлений и без привлечения эксперта на первом этапе. Пользователь заполняет форму с параметрами квартиры, после чего система:

1. преобразует "сырые" пользовательские поля в признаки для модели;
2. подгружает обученную модель и метаданные;
3. рассчитывает прогноз цены;
4. возвращает результат в удобном виде через API и мобильный интерфейс.

Такой сценарий полезен для:

- первичной оценки стоимости квартиры перед продажей;
- демонстрации ML-модели в прикладном продукте;
- построения end-to-end пайплайна от обучения модели до пользовательского интерфейса.

## Архитектура решения

Проект состоит из следующих частей:

- `docs/apartments.ipynb` - исследование данных, feature engineering, обучение и оценка модели.
- `ml/artifacts/` - сохраненные артефакты модели: `model.cbm` и `metadata.json`.
- `api-gateway/` - FastAPI-сервис, который загружает модель из MinIO и отдает REST API для клиента.
- `mobile/` - Expo/React Native приложение с формой оценки квартиры и web-сборкой.
- `docker-compose.yaml` - orchestration для запуска web-клиента, backend, MinIO и Redis.

Поток данных выглядит так:

1. в `docs/apartments.ipynb` обучается модель CatBoost;
2. артефакты сохраняются в `ml/artifacts/`;
3. `model.cbm` и `metadata.json` загружаются в MinIO;
4. `api-gateway` при старте скачивает их из MinIO;
5. `mobile` запрашивает `metadata` и отправляет данные на `/predict`;
6. backend возвращает оценку стоимости квартиры в долларах.

## Технологический стек

### ML и аналитика

- Python
- Jupyter Notebook
- Pandas
- NumPy
- Matplotlib
- Seaborn
- scikit-learn
- CatBoost

### Backend

- Python 3.12
- FastAPI
- Uvicorn
- Pydantic / pydantic-settings
- MinIO Python SDK
- Poetry

### Frontend / mobile

- Expo
- React 19
- React Native
- TypeScript
- expo-router
- React Navigation
- NativeWind
- Tailwind CSS
- Nginx для production web-сборки

### Infra

- Docker
- Docker Compose
- MinIO
- Redis

Примечание: `Redis` присутствует в `docker-compose.yaml`, но в текущей версии `api-gateway` напрямую не используется. Фактическая обязательная внешняя зависимость backend-сервиса - это `MinIO`, где лежат артефакты модели.

## Структура проекта

```text
apartment_sales/
├── api-gateway/           # FastAPI backend для инференса
├── docs/
│   └── apartments.ipynb   # анализ данных и обучение модели
├── ml/
│   └── artifacts/         # model.cbm и metadata.json
├── mobile/                # Expo / React Native клиент
└── docker-compose.yaml    # запуск сервисов в Docker
```

## ML-часть проекта

### Бизнес-задача

Модель предсказывает цену продажи квартиры по характеристикам объекта: площади, количеству комнат, этажности, состоянию, наличию вида на воду, городу, ZIP-коду и другим параметрам. Это классическая задача регрессии на табличных данных.

### Данные

В ноутбуке используется датасет `USA_Housing_Dataset.csv`. После загрузки и очистки в анализе фигурирует выборка размером `4140 x 18`.

Исходные признаки включают:

- `bedrooms`
- `bathrooms`
- `sqft_living`
- `sqft_lot`
- `floors`
- `waterfront`
- `view`
- `condition`
- `sqft_above`
- `sqft_basement`
- `yr_built`
- `yr_renovated`
- `city`
- `statezip`
- и другие служебные поля, включая `date`, `street`, `country`

Целевая переменная - `price`.

### Feature engineering

В ноутбуке и на backend используется согласованная логика подготовки признаков. Из исходных данных формируются дополнительные фичи:

- `zip` - извлекается из `statezip`;
- `house_age` - возраст дома;
- `was_renovated` - бинарный признак ремонта;
- `total_rooms` - сумма спален и ванных;
- `sqft_per_room` - площадь на комнату;
- `lot_utilization` - доля жилой площади от участка;
- `zip_price_level` - медианный уровень цены по ZIP-коду.

Часть исходных колонок исключается из модели как шумовые, избыточные или служебные: например `date`, `street`, `country`, `yr_built`, `yr_renovated`, `sqft_above`.

### Почему выбран CatBoost

Для проекта выбран `CatBoostRegressor`, потому что:

- задача решается на табличных данных;
- в данных есть смесь числовых и категориальных признаков;
- CatBoost хорошо работает с категориальными признаками без громоздкого ручного one-hot encoding;
- бустинг по деревьям обычно дает сильный baseline и хорошее качество для подобных регрессионных задач;
- модель устойчива к неоднородным масштабам признаков;
- в проекте дополнительно используется `log1p(price)`, что помогает сгладить влияние выбросов и стабилизировать обучение.

### Параметры модели

В ноутбуке используется `CatBoostRegressor` с ключевыми параметрами:

- `iterations=3000`
- `learning_rate=0.02`
- `depth=7`
- `l2_leaf_reg=12`
- `early_stopping_rounds=100`
- `loss_function='RMSE'`

### Результаты модели

Итоговые метрики на тестовой выборке:

- `MAE = 80,652.87`
- `MSE = 19,245,529,850.27`
- `RMSE = 138,728.26`
- `R2 = 0.7815`

Для учебного прикладного проекта это приемлемый результат: модель объясняет значимую долю дисперсии цены и дает рабочую оценку стоимости, которую уже можно встроить в пользовательский интерфейс.

### Артефакты модели

После обучения используются два основных файла:

- `ml/artifacts/model.cbm` - сериализованная модель CatBoost;
- `ml/artifacts/metadata.json` - порядок признаков, списки категориальных значений и `zip_price_map`.

`metadata.json` нужен не только для backend, но и для клиента: через endpoint `/metadata` мобильное приложение получает значения для выпадающих списков и может отправлять корректные параметры в `/predict`.

## Backend: `api-gateway`

### Назначение

`api-gateway` - это backend-сервис для инференса. При старте он загружает модель и метаданные из MinIO, сохраняет их в памяти приложения и предоставляет API для клиента.

### Основные endpoints

- `GET /health` - проверка доступности сервиса;
- `GET /api/v1/apartment/metadata` - получение справочных значений для UI;
- `POST /api/v1/apartment/predict` - прогноз цены квартиры.

### Как работает предсказание

Пользователь отправляет "сырые" поля, например:

- количество спален;
- количество ванных;
- площадь жилья;
- площадь участка;
- этажность;
- состояние объекта;
- город;
- `statezip`;
- год постройки;
- год ремонта.

Далее backend:

1. преобразует входные поля в набор признаков модели;
2. берет `feature_order` из `metadata.json`;
3. формирует входной вектор в правильном порядке;
4. вызывает `model.predict(...)`;
5. делает обратное преобразование `expm1`, так как модель обучалась на `log1p(price)`;
6. возвращает `price_usd`.

## Mobile: `mobile`

### Назначение

`mobile` - это Expo-приложение с двумя основными сценариями:

- экран `Home` с маркетинговыми блоками и краткой статистикой;
- экран `Apartments` с формой для оценки стоимости квартиры.

### Как клиент работает с API

Клиент:

- получает данные для выпадающих списков через `GET /api/v1/apartment/metadata`;
- отправляет заполненную форму на `POST /api/v1/apartment/predict`;
- показывает пользователю рассчитанную стоимость.

По умолчанию клиент использует:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080
```

Для Docker web-сборки это значение подставляется на этапе билда.

## Запуск проекта в Docker

### 1. Подготовить `.env` для backend

Скопируйте шаблон:

```bash
cp api-gateway/.env.template api-gateway/.env
```

Дополните `api-gateway/.env` переменными MinIO:

```env
# APPLICATION
CONFIG__APP__HOST=0.0.0.0
CONFIG__APP__PORT=8080

# API
CONFIG__API__PREFIX=/api
CONFIG__API__V1__PREFIX=/v1
CONFIG__API__V1__APARTMENT_PREFIX=/apartment

# MINIO
CONFIG__STORAGE__MINIO__ENDPOINT=minio:9000
CONFIG__STORAGE__MINIO__ACCESS_KEY=admin
CONFIG__STORAGE__MINIO__SECRET_KEY=password
CONFIG__STORAGE__MINIO__BUCKET=artifacts
CONFIG__STORAGE__MINIO__MODEL_FILENAME=model.cbm
CONFIG__STORAGE__MINIO__METADATA_FILENAME=metadata.json
```

Важно: `docker-compose.yaml` не прокидывает переменные окружения напрямую, поэтому для успешного запуска backend в Docker этот `.env` файл должен существовать в `api-gateway/` до сборки образа.

### 2. Поднять сервисы

Из корня проекта:

```bash
docker compose up --build
```

После запуска будут доступны:

- web-клиент: `http://localhost:3000`
- API gateway: `http://localhost:8080`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Redis: `localhost:6379`

### 3. Загрузить артефакты модели в MinIO

Backend ожидает, что в bucket `artifacts` будут лежать:

- `model.cbm`
- `metadata.json`

Загрузить их можно двумя способами.

Через web-консоль MinIO:

1. открыть `http://localhost:9001`;
2. войти с логином `admin` и паролем `password`;
3. создать bucket `artifacts`;
4. загрузить файлы из `ml/artifacts/`.

Или через `mc`:

```bash
mc alias set local http://localhost:9000 admin password
mc mb local/artifacts
mc cp ml/artifacts/model.cbm local/artifacts/model.cbm
mc cp ml/artifacts/metadata.json local/artifacts/metadata.json
```

Если bucket уже существует, команду `mc mb` можно пропустить.

### 4. Проверить, что backend готов

```bash
curl http://localhost:8080/health
```

Ожидаемый ответ:

```json
{"message":"healthy"}
```

### 5. Проверить предсказание

```bash
curl -X POST http://localhost:8080/api/v1/apartment/predict \
  -H "Content-Type: application/json" \
  -d '{
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft_living": 1340,
    "sqft_lot": 1384,
    "floors": 3,
    "waterfront": 0,
    "view": 0,
    "condition": 3,
    "sqft_basement": 0,
    "city": "Seattle",
    "statezip": "WA 98103",
    "yr_built": 2007,
    "yr_renovated": 0
  }'
```

## Запуск проекта без Docker

Ниже - сценарий, в котором приложение запускается локально, а не в контейнерах.

### Требования

- Python 3.12+
- Poetry
- Node.js 22+
- npm
- MinIO

### 1. Запустить MinIO локально

Пример команды:

```bash
minio server ~/minio-data --console-address ":9001"
```

Если MinIO у вас установлен иначе, можно поднять его любым эквивалентным способом. Главное, чтобы были доступны:

- S3 endpoint на `localhost:9000`
- console на `localhost:9001`

### 2. Создать bucket и загрузить артефакты

```bash
mc alias set local http://localhost:9000 admin password
mc mb local/artifacts
mc cp ml/artifacts/model.cbm local/artifacts/model.cbm
mc cp ml/artifacts/metadata.json local/artifacts/metadata.json
```

### 3. Настроить backend

Создайте `api-gateway/.env`:

```bash
cp api-gateway/.env.template api-gateway/.env
```

И добавьте в него:

```env
CONFIG__STORAGE__MINIO__ENDPOINT=localhost:9000
CONFIG__STORAGE__MINIO__ACCESS_KEY=admin
CONFIG__STORAGE__MINIO__SECRET_KEY=password
CONFIG__STORAGE__MINIO__BUCKET=artifacts
CONFIG__STORAGE__MINIO__MODEL_FILENAME=model.cbm
CONFIG__STORAGE__MINIO__METADATA_FILENAME=metadata.json
```

### 4. Запустить backend локально

```bash
cd api-gateway
poetry install
PYTHONPATH=src poetry run python -m api_gateway.main
```

После запуска backend будет доступен на:

```text
http://localhost:8080
```

### 5. Запустить mobile-клиент локально

В отдельном терминале:

```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm start
```

Дополнительно доступны команды:

```bash
cd mobile
npm run android
npm run ios
npm run web
npm run lint
```

Если нужен именно web-режим разработки:

```bash
cd mobile
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web
```

## Почему проект можно считать целостным

Этот репозиторий показывает полноценный ML product flow:

- исследование данных и обучение модели;
- сохранение артефактов;
- доставка модели в объектное хранилище;
- backend-инференс по HTTP;
- пользовательский интерфейс для ввода данных и отображения результата.

Именно в этом состоит основная ценность проекта: это не просто ноутбук с моделью и не просто UI, а связанная система, в которой ML-модель реально используется в приложении.

## Ограничения текущей версии

- модель обучена на одном датасете и подходит в первую очередь для демонстрационного/учебного сценария;
- точность достаточна для предварительной оценки, но не заменяет профессиональную рыночную экспертизу;
- для работы backend артефакты должны быть заранее загружены в MinIO;
- в `mobile` нет отдельного набора автоматических тестов;
- в текущем compose `Redis` поднят, но пока не участвует в бизнес-логике.

## Итог

`Apartment Sales` - это учебный проект, который объединяет анализ данных, обучение модели CatBoost, backend на FastAPI и клиент на Expo/React Native в единый сервис оценки стоимости квартиры. С инженерной точки зрения проект хорошо демонстрирует, как превратить результат из Jupyter Notebook в прикладное приложение с API и пользовательским интерфейсом.

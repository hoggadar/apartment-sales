# API Gateway — оценка стоимости недвижимости

Сервис предсказания рыночной стоимости квартир на основе модели CatBoost. Модель загружается из MinIO при старте приложения.

---

## 1. Исходные признаки датасета

Датасет `USA_Housing_Dataset.csv` содержит следующие поля:

| Признак | Тип | Описание |
|---------|-----|----------|
| `date` | datetime | Дата продажи |
| `price` | float | Цена (целевая переменная) |
| `bedrooms` | float | Количество спален |
| `bathrooms` | float | Количество ванных (может быть дробным, напр. 1.5) |
| `sqft_living` | int | Жилая площадь (кв. футы) |
| `sqft_lot` | int | Площадь участка (кв. футы) |
| `floors` | float | Количество этажей |
| `waterfront` | int | 1 — у воды, 0 — нет |
| `view` | int | Качество вида (0–4) |
| `condition` | int | Общее состояние (1–5) |
| `sqft_above` | int | Площадь над землёй |
| `sqft_basement` | int | Площадь подвала |
| `yr_built` | int | Год постройки |
| `yr_renovated` | int | Год ремонта (0 — не было) |
| `street` | str | Адрес |
| `city` | str | Город |
| `statezip` | str | Штат и индекс (напр. «WA 98103») |
| `country` | str | Страна |

---

## 2. Преобразования при обучении

В ноутбуке `docs/apartments.ipynb` применяется функция `transform_data()`:

| Исходный признак | Преобразование | Результат | Зачем |
|------------------|----------------|-----------|-------|
| `statezip` | Извлечение цифр regex `(\d+)` | `zip` | Чистый почтовый индекс для категориального признака |
| `yr_built` | `текущий_год - yr_built` | `house_age` | Возраст дома в годах — более интерпретируемо, чем год |
| `yr_renovated` | `1` если > 0, иначе `0` | `was_renovated` | Бинарный флаг: был ли ремонт |
| `bedrooms`, `bathrooms` | `bedrooms + bathrooms` | `total_rooms` | Суммарное число комнат |
| `sqft_living`, `total_rooms` | `sqft_living / (total_rooms + 1)` | `sqft_per_room` | Площадь на комнату (+1 защищает от деления на 0) |
| `sqft_living`, `sqft_lot` | `sqft_living / (sqft_lot + 1)` | `lot_utilization` | Доля жилой площади от участка |
| `zip`, `price` (по train) | Медиана цены по ZIP | `zip_price_level` | Прокси уровня цен в районе |

**Удалённые колонки:** `price`, `date`, `street`, `statezip`, `country`, `yr_built`, `yr_renovated`, `sqft_above` — либо целевая переменная, либо шум/дублирование (`sqft_above` = `sqft_living - sqft_basement`).

**Итоговый порядок признаков для модели:**
`bedrooms`, `bathrooms`, `sqft_living`, `sqft_lot`, `floors`, `waterfront`, `view`, `condition`, `sqft_basement`, `city`, `zip`, `house_age`, `was_renovated`, `total_rooms`, `sqft_per_room`, `lot_utilization`, `zip_price_level`.

---

## 3. Данные от пользователя и преобразование в API

Пользователь отправляет **сырые** данные в `POST /api/v1/apartment/predict`:

| Поле | Тип | Описание |
|------|-----|----------|
| `bedrooms` | float | Количество спален |
| `bathrooms` | float | Количество ванных |
| `sqft_living` | float | Жилая площадь (кв. футы) |
| `sqft_lot` | float | Площадь участка |
| `floors` | float | Количество этажей |
| `waterfront` | int | 0 или 1 |
| `view` | int | 0–4 |
| `condition` | int | 1–5 |
| `sqft_basement` | float | Площадь подвала |
| `city` | str | Город |
| `statezip` | str | Штат и индекс, напр. «WA 98103» |
| `yr_built` | int | Год постройки |
| `yr_renovated` | int | Год ремонта (0 — не было) |

Бэкенд (метод `to_model_features()` в `ApartmentPredictRequest`) выполняет те же преобразования, что и при обучении:

1. **zip** — извлекает цифры из `statezip` (regex).
2. **house_age** — `текущий_год - yr_built`.
3. **was_renovated** — `"1"` если `yr_renovated > 0`, иначе `"0"`.
4. **total_rooms** — `bedrooms + bathrooms`.
5. **sqft_per_room** — `sqft_living / (total_rooms + 1)`.
6. **lot_utilization** — `sqft_living / (sqft_lot + 1)`.
7. **zip_price_level** — берётся из `zip_price_map` в metadata (медиана цен по ZIP из обучающей выборки); для неизвестного ZIP — 0.

Категориальные признаки (`waterfront`, `view`, `condition`, `was_renovated`) приводятся к строковому виду для CatBoost.

---

## 4. API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/v1/apartment/metadata` | Список городов, ZIP-кодов и категорий для dropdown |
| `POST` | `/api/v1/apartment/predict` | Предсказание цены по сырым данным |

**Пример запроса predict:**
```json
{
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
}
```

**Ответ:** `{"price_usd": 523456.78}` — цена в долларах (модель обучена на `log1p(price)`, при ответе применяется `expm1`).
